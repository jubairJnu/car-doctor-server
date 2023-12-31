const express = require('express')
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d8yzbln.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviceCollection = client.db("doctorCar").collection("services");
    const bookedCollection = client.db("doctorCar").collection('booked');

    app.get('/services', async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result= await serviceCollection.findOne(query);
      res.send(result);
    });


    // bookings

    app.get('/bookings', async(req,res)=>{
      let query = {};
      if(req.query?.email){
        query = {email: req.query.email}
      }
      const result = await bookedCollection.find(query).toArray();
      res.send(result);
    })

    app.post('/bookings', async(req, res) =>{
      const booking = req.body;
      const result = await bookedCollection.insertOne(booking);
      res.send(result);
      
    })

    app.patch('/bookings/:id', async(req, res) =>{
      const id = req.params.id;
      const updatedBookings = req.body;
      const query ={_id: new ObjectId(id)}
      const updateDoc = {
        $set: {
          status:updatedBookings.status
        },
      };
      const result = await bookedCollection.updateOne(query,updateDoc)
      res.send(result)
      console.log(updatedBookings);
    })

    app.delete('/bookings/:id',async(req,res)=>{
      const id = req.params.id;
      const query ={_id: new ObjectId(id)}
      const result = await bookedCollection.deleteOne(query)
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('doctor is comming')
})


app.listen(port, () => {
  console.log(`server is running on port ${port}`)
})