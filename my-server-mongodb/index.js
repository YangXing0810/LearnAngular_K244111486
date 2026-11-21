const express = require('express');
const app = express();
const port = 3002;

const morgan = require("morgan")
app.use(morgan("combined"))

const path = require("path")
const fs = require('fs');
app.use(express.static(path.join(__dirname, "public")))

const cors = require("cors")
//app.use(cors())
app.use(cors({
  origin:'http://localhost:4200',
  credentials:true
}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const session = require('express-session');
app.use(session({
    secret: 'fashion-store-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 } // 1 hour
}));

// ================== JWT Token ==================
const jwt = require('jsonwebtoken');
const JWT_SECRET = "TranPham_K244111486_SecretKey"; // secret key to sign the token
const JWT_EXPIRES = "1h";                          // token expires after 1 hour

// Middleware: check "Authorization: Bearer <token>"
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!token) {
    return res.status(401).send({ message: "No token provided!" });
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Invalid or expired token!" });
    }
    req.user = decoded; // { username, role, iat, exp }
    next();
  });
}

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

// [Exercise 58] API returns the entire Fashion, sorted by creation date descending
app.get("/fashions", cors(), async (req, res) => {
  const result = await fashionCollection.find({}).sort({ created_date: -1 }).toArray();
  res.send(result)
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
//MongoDB generates _id automatically, creation date = now
delete req.body._id
req.body.created_date = new Date()
//put json Fashion into database
await fashionCollection.insertOne(req.body)
//send message to client(send all database to client)
res.send(req.body)
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
  res.send(result[0]);
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

// ================== Chapter 8: Login + Cookie ==================
app.post('/user-login', async (req, res) => {
    const UserCollection = database.collection("User");
    const user = await UserCollection.findOne({
        username: req.body.username,
        password: req.body.password
    });
    if (user) {
        if (req.body.rememberMe) {
            res.cookie('remember_user', req.body.username, {
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
                httpOnly: false,
                secure: false, // Set true nếu chạy https
                sameSite: 'Lax'
            });
        }
        // create JWT token for this user
        const token = jwt.sign(
            { username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES }
        );
        res.status(200).send({
            message: "Login successful!",
            token: token,
            user: { username: user.username, role: user.role }
        });
    } else {
        res.status(401).send({ message: "Wrong user or email!" });
    }
});

// ================== APIs protected by JWT Token ==================
// Get information of the logged-in user (need Bearer Token)
app.get('/user-profile', verifyToken, (req, res) => {
    res.send({
        message: "Token is valid!",
        user: req.user
    });
});

// Update a Fashion, only allowed with a valid token (need Bearer Token)
app.put('/secure/fashions', verifyToken, async (req, res) => {
    const o_id = new ObjectId(req.body._id);
    await fashionCollection.updateOne(
        { _id: o_id },
        {
            $set: {
                style: req.body.style,
                fashion_subject: req.body.fashion_subject,
                fashion_detail: req.body.fashion_detail,
                fashion_image: req.body.fashion_image
            }
        }
    );
    const result = await fashionCollection.find({ _id: o_id }).toArray();
    res.send({ updatedBy: req.user.username, fashion: result[0] });
});

app.post('/api/login', (req, res) => {
    // Assume authentication is successful
    // Save user information to Session
    req.session.user = {
        username: req.body.username,
        role: 'admin',
        loginTime: new Date()
    };
    res.send("Session has been created!");
});

app.get('/api/profile', (req, res) => {
    if (req.session.user) {
        // If Session exists
        res.send(`Welcome back, ${req.session.user.username}`);
    } else {
        // If the session has expired or you are not logged in
        res.status(401).send("Please login first!");
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err) return res.send("Error logging out");
        // Delete the identifying cookie on the client
        res.clearCookie('connect.sid');
        res.send("Logged out successfully");
    });
});

app.post('/cart/add', (req, res) => {
    const { fashionId, name, price } = req.body;
    // 1. Create a shopping cart if you don't already have one.
    if (!req.session.cart) {
        req.session.cart = [];
    }
    // 2. Add products to the session array
    req.session.cart.push({ fashionId, name, price, addedAt: new Date() });
    res.send({
        message: "Added to temporary cart",
        cartCount: req.session.cart.length
    });
});

app.get('/cart', (req, res) => {
  // Read data from Session
  const tempCart = req.session.cart || [];
  res.send(tempCart);
});

app.post('/cart/checkout', async (req, res) => {
    // 1. Authentication Check: Ensure the user is logged in
    if (!req.session.user) {
        return res.status(401).send("Please login to checkout!");
    }
    // 2. Session Cart Validation: Check if the cart exists and contains items
    const itemsToBuy = req.session.cart;
    if (!itemsToBuy || itemsToBuy.length === 0) {
        return res.send("Your cart is empty");
    }
    try {
        // 3. Database Collection Access:
        // MongoDB driver automatically creates the collection upon the first insertion
        const OrderCollection = database.collection("Orders");
        // 4. Data Preparation: Create the order document with session data
        const newOrder = {
            userId: req.session.user.id, // Linked to the logged-in user's ID
            items: itemsToBuy,         // Temporary cart data from Session
            totalStatus: 'Pending',    // Default order status
            createdAt: new Date()      // Timestamp of purchase
        };
        // 5. Persistence: Save the order to MongoDB
        await OrderCollection.insertOne(newOrder);
        // 6. Cleanup: Clear the temporary session cart after successful database storage
        req.session.cart = [];
        // 7. Response: Send success message and order details back to client
        res.status(200).send({
            message: "Order placed successfully!",
            order: newOrder
        });

    } catch (error) {
        // 8. Exception Handling: Catch and log database-related errors
        console.error("Checkout Error:", error);
        res.status(500).send("Database error occurred during checkout");
    }
});