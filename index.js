const express = require('express')
const app = express()
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ph7tdpg.mongodb.net/?retryWrites=true&w=majority`;

const jwtVerify = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: "unauthorized access" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.USER_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: 'unauthorized access' })
    }
    req.decoded = decoded;
    next();
  });
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const serviceCollection = client.db("dochouseDB").collection("services");
    const reviewCollection = client.db("dochouseDB").collection("reviews");
    const doctorCollection = client.db("dochouseDB").collection("doctors");
    const selectedCollection = client.db("dochouseDB").collection("selectedAppointment");


    // jwt
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.USER_TOKEN, { expiresIn: '1h' });
      res.send({ token })
    })

    // get service
    app.get('/services', async (req, res) => {
      const result = await serviceCollection.find().toArray();
      res.send(result)
    })

    // get reviews
    app.get('/reviews', async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result)
    })
    // get doctors
    app.get('/doctors', async (req, res) => {
      const result = await doctorCollection.find().toArray();
      res.send(result)
    })
    // get doctor by id
    app.get('/doctor/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await doctorCollection.findOne(query);
      res.send(result)
    })
    // create selected appointment
    app.post('/appointmentBook/:email', async (req, res) => {
      const appointmentBook = req.body;
      const result = await selectedCollection.insertOne(appointmentBook);
      res.send(result);
    })
    // get selected appointment
    app.get('/appointmentBook/:email', async (req, res) => {
      const appointmentBook = req.params.email;

      // res.send(result);
    })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})