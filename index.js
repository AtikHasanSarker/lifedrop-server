const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();
const app = express();
const port = process.env.PORT;
const uri = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB client and collection
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});



async function run() {
  try {
    await client.connect();
    const db = client.db("lifedrop");
    const donationRequestCollection = db.collection("donation-requests");
    console.log("Successfully Connected to MongoDB: lifedrop");

    app.post("/donation-requests", async (req, res) => {
      const requestData = req.body;
      const result = await donationRequestCollection.insertOne(requestData);
      res.json(result);
    });

    app.get("/donation-requests", async (req, res) => {
      const result = await donationRequestCollection.find().toArray();
      res.json(result);
    });

    
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running for tutors!");
});

app.listen(port, () => {
  console.log(`Server running on ${port} port`);
});
