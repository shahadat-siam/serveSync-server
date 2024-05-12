const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

//------ middlewere ----
const corsOptions = {
    origin:['http://localhost:5173','http://localhost:5174'],
    credentials: true,
    optionSuccessStatus:200, 
}
app.use(cors(corsOptions))
app.use(express.json())

 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ot34xl4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
 
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
    
    const volunteerCollection = client.db('ServeSync').collection('volunteerNeed')
    const beVolunteerCollection = client.db('ServeSync').collection('beVolunteer')
    
    
    // get all data from db
    app.get('/volunteer', async (req,res) => {
        const result = await volunteerCollection.find().toArray()
        res.send(result)
    })

    // save add volunteer post data
    app.post('/volunteer', async(req,res) => {
      const volunteerData = req.body
      const result = await volunteerCollection.insertOne(volunteerData)
      res.send(result)
  })

  // get data by email
  app.get('/volunteer/:email', async (req,res) => {
    const email = req.params.email
    const query = { email : email}
    const result = await volunteerCollection.find(query).toArray()
    res.send(result) 
  })

  // save Be a volunteer data 
  app.post('/beAVolunteer', async(req,res) => {
    const volunteerData = req.body
    const result = await beVolunteerCollection.insertOne(volunteerData)
    res.send(result)
  })

  // get specific data from database 
  app.get('/volunteer/:id', async (req,res) => {
    const id = req.params.id
    const query = {_id: new ObjectId(id)}
    const result = await volunteerCollection.findOne(query)
    res.send(result)
  }) 

  // delete data from databage
  app.delete('/volunteer/:id', async (req,res) => {
    const id = req.params.id
    const query = {_id : new ObjectId(id)}
    const result = await volunteerCollection.deleteOne(query)
    res.send(result)
  })

  // // update data
  // app.put('/volunteer/:id', async (req, res) => {
  //   const id = req.params.id
  //   const Data = req.body
  //   const query = {_id : new ObjectId(id)}
  //   const option = {upsert:true}
  //   const updateDoc = {
  //       $set:{
  //           ...Data
  //       }
  //   }
  //   const result = await volunteerCollection.updateOne(query, updateDoc, option)
  //   res.send(result)
  // })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
     
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('We are going to make an ServeSync.')
})

app.listen(port, () => {
    console.log(`ServeSync running on port ${port}`)
})