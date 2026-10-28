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

app.get("/fashions", cors(), async (req, res) => {
  const result = await fashionCollection.find({}).toArray();
  res.send(result)
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
      return { ...f, similarity: Math.round(similarity * 10000) / 10000 }
    })
    .filter(f => f.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, top)
  res.send(result)
})
// ================================================================================

app.get("/fashions/:id",cors(),async (req,res)=>{
    var o_id = new ObjectId(req.params["id"]);
    const result = await fashionCollection.find({_id:o_id}).toArray();
    res.send(result[0])
    }
)

app.post("/fashions",cors(),async(req,res)=>{
//put json Fashion into database
await fashionCollection.insertOne(req.body)
//send message to client(send all database to client)
res.send(req.body)
})