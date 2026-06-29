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

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});


const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`),
);

const verifyToken = async (req, res, next) => {
  const authHeader = req?.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS);
    console.log("payload from jwt:", payload);
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden" });
  }
};

async function run() {
  try {
    await client.connect();
    const db = client.db("lifedrop");
    console.log("Successfully Connected to MongoDB: lifedrop");
    const donationRequestCollection = db.collection("donation-requests");
    const usersCollection = db.collection("user");
    const fundingCollection = db.collection("funding");

    app.post("/donation-requests", async (req, res) => {
      const requestData = req.body;
      const result = await donationRequestCollection.insertOne(requestData);
      res.json(result);
    });

    app.post("/funding", async (req, res) => {
      try {
        const {
          userId,
          userName,
          UserEmail,
          amount,
          currency,
          paymentIntent,
          checkoutSessionId,
          paymentStatus,
          transactionDate,
        } = req.body;

        const funding = {
          userId,
          userName,
          UserEmail,
          amount,
          currency,
          paymentIntent,
          checkoutSessionId,
          paymentStatus,
          transactionDate,
          createdAt: new Date(),
        };

        const result = await fundingCollection.insertOne(funding);
        return res.status(200).json({
          success: true,
          message: "Funding saved successfully",
          result
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: error.message || "Failed to save funding."
        });
      }
    });

    app.get("/funding", async (req, res) => {
      const result = await fundingCollection.find().toArray();
      res.json(result);
    });

    app.get("/donation-requests", async (req, res) => {
      const result = await donationRequestCollection.find().toArray();
      res.json(result);
    });


    app.get("/donation-requests/:id", async (req, res) => {
      const id = req.params.id;
      const result = await donationRequestCollection.findOne({ _id: new ObjectId(id) });
      res.json(result);
    });

    app.patch("/donation-requests/:id", async (req, res) => {
      const id = req.params.id;
      const result = await donationRequestCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: req.body },
      );
      res.json(result);
    });

    app.patch("/public-donation-requests/:id", async (req, res) => {
      const id = req.params.id;
      const result = await donationRequestCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: req.body },
      );
      res.json(result);
    });

    app.delete("/donation-requests/:id", async (req, res) => {
      const id = req.params.id;
      const result = await donationRequestCollection.deleteOne({ _id: new ObjectId(id) });
      res.json(result);
    });

    app.get("/my-donation-requests/:userId", async (req, res) => {
      const { userId } = req.params;
      const query = {
        userId: userId,
      };

      const myRequests = await donationRequestCollection.find(query).toArray();
      res.json(myRequests);
    });



    // Search donors by blood group, district, upazila
    app.get("/search-donors", async (req, res) => {
      const { bloodGroup, district, upazila } = req.query;

      const query = {
        bloodGroup,
        district,
        upazila,
        role: "donor",
      };
      const donors = await usersCollection.find(query).toArray();
      res.json(donors);
    });

    //for admin
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.json(result);
    });

    app.patch("/users/:id", async (req, res) => {
      const id = req.params.id;
      const result = await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: req.body },
      );
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
