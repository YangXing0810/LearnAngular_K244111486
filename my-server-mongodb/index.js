const express = require('express');
const app = express();
const port = 3002;

const morgan = require("morgan")
app.use(morgan("combined"))

const path = require("path")
const fs = require('fs');
app.use(express.static(path.join(__dirname, "public")))

const cors = require("cors")
app.use(cors())
const bodyParser = require("body-parser")
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.listen(port, () => {
  console.log(`My Server listening on port ${port}`)
})

app.get("/", (req, res) => {
  res.send("This Web server is processed for MongoDB")
})

const { MongoClient, ObjectId } = require('mongodb');
client = new MongoClient("mongodb://127.0.0.1:27017");
client.connect();
database = client.db("FashionData");
fashionCollection = database.collection("Fashion");

// ================== IdF: unique numeric id + Slug ==================
// Create a slug from the title: "Street Style Đẹp" + IdF 3 -> "street-style-dep-p3"
function slugify(text) {
  return (text || "").toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")   // remove Vietnamese accents
    .replace(/[^a-z0-9]+/g, "-")                          // special chars -> "-"
    .replace(/(^-|-$)+/g, "")
}
function createSlug(f) { return `${slugify(f.fashion_subject)}-p${f.IdF}` }
// add the "slug" field to every Fashion sent to the client
function withSlug(f) { return f ? { ...f, slug: createSlug(f) } : f }

// next IdF = current max IdF + 1
async function nextIdF() {
  const last = await fashionCollection.find({ IdF: { $exists: true } }).sort({ IdF: -1 }).limit(1).toArray()
  return last.length ? last[0].IdF + 1 : 1
}

// When the server starts: give an IdF to old documents that do not have one
// (numbered by creation date), then create a UNIQUE index on IdF
async function ensureIdF() {
  let id = await nextIdF()
  const missing = await fashionCollection.find({ IdF: { $exists: false } }).sort({ created_date: 1 }).toArray()
  for (const f of missing) {
    await fashionCollection.updateOne({ _id: f._id }, { $set: { IdF: id++ } })
  }
  await fashionCollection.createIndex({ IdF: 1 }, { unique: true })
  console.log(`IdF ready (${missing.length} document(s) numbered)`)
}
ensureIdF().catch(err => console.log("ensureIdF error:", err.message))
// ====================================================================

// [Exercise 58] API returns the entire Fashion, sorted by creation date descending
app.get("/fashions", cors(), async (req, res) => {
  const result = await fashionCollection.find({}).sort({ created_date: -1 }).toArray();
  res.send(result.map(withSlug))
})

// [Exercise 58] API returns the list of Styles (for dropdown list)
app.get("/fashions/styles", cors(), async (req, res) => {
  const styles = await fashionCollection.distinct("style");
  res.send(styles.filter(s => s).sort())
})

// [Exercise 58] API to filter the list of Fashions according to a certain Style
app.get("/fashions/style/:style", cors(), async (req, res) => {
  const style = req.params["style"]
  const escaped = style.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const result = await fashionCollection
    .find({ style: { $regex: "^" + escaped + "$", $options: "i" } })
    .sort({ created_date: -1 }).toArray();
  res.send(result.map(withSlug))
})

// ================== SEARCH FASHION: Cosine / Jaccard Similarity ==================
const STOP_WORDS = new Set(["a","an","the","and","or","of","to","in","on","at","for","with","is","are","was","were","be","by","as","it","its","this","that","from"])

// Split text into lowercase words (remove accents, punctuation, stop words)
function tokenize(text) {
  return (text || "").toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    .filter(w => w.length > 0 && !STOP_WORDS.has(w))
}

// Jaccard = |A ∩ B| / |A ∪ B|
function jaccardSimilarity(queryTokens, docTokens) {
  const A = new Set(queryTokens), B = new Set(docTokens)
  if (A.size === 0 || B.size === 0) return 0
  let intersection = 0
  A.forEach(w => { if (B.has(w)) intersection++ })
  return intersection / (A.size + B.size - intersection)
}

// Cosine = (A · B) / (|A| * |B|) on term-frequency vectors
function cosineSimilarity(queryTokens, docTokens) {
  const tf = tokens => tokens.reduce((m, w) => { m[w] = (m[w] || 0) + 1; return m }, {})
  const A = tf(queryTokens), B = tf(docTokens)
  let dot = 0, normA = 0, normB = 0
  for (const w in A) { normA += A[w] * A[w]; if (B[w]) dot += A[w] * B[w] }
  for (const w in B) normB += B[w] * B[w]
  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

// GET /fashions/search?q=street style&field=fashion_subject&metric=cosine&top=5
app.get("/fashions/search", cors(), async (req, res) => {
  const q = req.query.q || ""
  const field = req.query.field === "fashion_detail" ? "fashion_detail" : "fashion_subject"
  const metric = req.query.metric === "jaccard" ? "jaccard" : "cosine"
  const top = parseInt(req.query.top) > 0 ? parseInt(req.query.top) : 5

  const queryTokens = tokenize(q)
  const fashions = await fashionCollection.find({}).toArray()
  const result = fashions
    .map(f => {
      const docTokens = tokenize(f[field])
      const similarity = metric === "jaccard"
        ? jaccardSimilarity(queryTokens, docTokens)
        : cosineSimilarity(queryTokens, docTokens)
      return { ...withSlug(f), similarity: Math.round(similarity * 10000) / 10000 }
    })
    .filter(f => f.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, top)
  res.send(result)
})
// ================================================================================

// [Slug] GET /fashions/slug/street-style-p3 -> automatically resolve the Fashion
// 1. slug ends with "-p<IdF>"  -> find by IdF (title may have changed, still found)
// 2. pure number "3"            -> find by IdF
// 3. pure text slug             -> compare with the slug of each title
app.get("/fashions/slug/:slug", cors(), async (req, res) => {
  const slug = (req.params["slug"] || "").toLowerCase()
  let fashion = null
  const m = slug.match(/-p(\d+)$/) || slug.match(/^(\d+)$/)
  if (m) {
    fashion = await fashionCollection.findOne({ IdF: parseInt(m[1]) })
  } else {
    const all = await fashionCollection.find({}).toArray()
    fashion = all.find(f => slugify(f.fashion_subject) === slug) || null
  }
  if (!fashion) return res.status(404).send({ message: "Fashion not found" })
  res.send(withSlug(fashion))
})

// GET /fashions/idf/3 -> find by the numeric IdF
app.get("/fashions/idf/:idf", cors(), async (req, res) => {
  const fashion = await fashionCollection.findOne({ IdF: parseInt(req.params["idf"]) })
  if (!fashion) return res.status(404).send({ message: "Fashion not found" })
  res.send(withSlug(fashion))
})

app.get("/fashions/:id",cors(),async (req,res)=>{
    if (!ObjectId.isValid(req.params["id"])) return res.status(404).send({ message: "Fashion not found" })
    var o_id = new ObjectId(req.params["id"]);
    const result = await fashionCollection.find({_id:o_id}).toArray();
    res.send(withSlug(result[0]))
    }
)

app.post("/fashions",cors(),async(req,res)=>{
//MongoDB generates _id automatically, creation date = now
delete req.body._id
delete req.body.slug
req.body.created_date = new Date()
//IdF = unique number, auto increment
req.body.IdF = await nextIdF()
//put json Fashion into database
await fashionCollection.insertOne(req.body)
//send message to client(send all database to client)
res.send(withSlug(req.body))
})

app.put("/fashions", cors(), async (req, res) => {
  //update json Fashion into database
  await fashionCollection.updateOne(
    { _id: new ObjectId(req.body._id) }, //condition for update
    {
      $set: { //Field for updating
        style: req.body.style,
        fashion_subject: req.body.fashion_subject,
        fashion_detail: req.body.fashion_detail,
        fashion_image: req.body.fashion_image
      }
    }
  );

  //send Fahsion after updating
  var o_id = new ObjectId(req.body._id);
  const result = await fashionCollection.find({ _id: o_id }).toArray();
  res.send(withSlug(result[0]));
});

app.delete("/fashions/:id", cors(), async (req, res) => {
  //find detail Fashion with id
  var o_id = new ObjectId(req.params["id"]);
  const result = await fashionCollection.find({ _id: o_id }).toArray();
  //update json Fashion into database
  await fashionCollection.deleteOne(
    { _id: o_id }
  )
  //send Fashion after remove
  res.send(result[0])
})