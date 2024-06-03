const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const app = express();
const port = 3000;
const cors = require("cors");
require("dotenv").config();

// use all the middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7aech.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    const servicesCollection = client
      .db("STRIED-REVIVE")
      .collection("services");
    const usersCollection = client.db("STRIED-REVIVE").collection("users");
    await client.connect();

    // Custome Middleware
    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "Forbidden Access" });
      }
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
        if (error) {
          return res.status(403).send({ message: "Forbidden Access" });
        }
        req.decoded = decoded;
        next();
      });
    };

    // jwt related api
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ token });
    });

    app.post("/services", async (req, res) => {
      const data = req.body;
      const result = await servicesCollection.insertOne(data);
      res.send(result);
    });

    // service related api start
    app.get("/services", async (req, res) => {
      const result = await servicesCollection.find().toArray();
      res.send(result);
    });

    app.get("/services/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await servicesCollection.findOne(query);
      res.send(result);
    });

    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await servicesCollection.deleteOne(query);
      // console.log(result);
      res.send(result);
    });

    app.put("/services/:id", async (req, res) => {
      const { id } = req.params;
      const { title, name, price, description, image } = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          title,
          name,
          price,
          description,
        },
      };
      const result = await servicesCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // service related api end

    // Users related api start
    app.post("/users", async (req, res) => {
      const data = req.body;
      const result = await usersCollection.insertOne(data);
      res.send(result);
    });

    app.get("/users", verifyToken, async (req, res) => {
      const email = req.query.email;
      const query = { email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    app.get("/users/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.findOne(query);
      console.log(result);
      res.send(result);
    });

    app.put("/users/:id", verifyToken, async (req, res) => {
      const { id } = req.params;
      const {
        aboutYourSelf,
        bloodGroup,
        date,
        email,
        maritalStatus,
        name,
        permanentAddress,
        phoneNumber,
        presentAddress,
        image,
      } = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name,
          email,
          aboutYourSelf,
          bloodGroup,
          date,
          maritalStatus,
          permanentAddress,
          phoneNumber,
          presentAddress,
          image,
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log(result);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Stried Practice Side!");
});

app.listen(port, () => {
  console.log(`Stride Practice ${port}`);
});
