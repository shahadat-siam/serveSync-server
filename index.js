const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieParser =  require('cookie-parser')
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
app.use(cookieParser())

 // verify jwt  middlewere
 const verifyToken = (req,res,next) => {
    const token = req.cookies?.token
        // console.log(token)
        if(!token) return res.status(401).send({message:'unauthorized access'})
        if(token) {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if(err){
                   return  res.status(401).send({message:'unauthorized access'})
                }
                console.log(decoded)
                req.user = decoded 
                next()
            })
        } 
 }

 
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
    
      // jwt token genarate
      app.post('/jwt', async (req, res) => {
        const user = req.body
        const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'365d'})
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        }).send({success: true})
     })

      // clear token on logout
      app.get('/logout', (req,res) => {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge:0,
        }).send({success: true})
     })
    
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
  app.get('/volunteer/:email', verifyToken, async (req,res) => {
    const tokenEmail = req.user.email 
    const email = req.params.email
    if(tokenEmail !== email) {
      return res.status(403).send({message:'forbidden access'})
    }
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

  app.get('/beAVolunteer', async (req,res) => {
    const result = await beVolunteerCollection.find().toArray()
    res.send(result)
  })
 
 
  app.get('/beAVolunteermail/:email', verifyToken, async (req,res) => {
    const tokenEmail = req.user.email 
    const email = req.params.email
    if(tokenEmail !== email) {
      return res.status(403).send({message:'forbidden access'})
    }
    const query = { email }
    const result = await beVolunteerCollection.find(query).toArray()
    res.send(result) 
  })

   // get specific data from database 
   app.get('/volunteersingle/:id', async (req,res) => {
    const id = req.params.id 
    const query = {_id: new ObjectId(id)}
    const result = await volunteerCollection.findOne(query)
    res.send(result)
  }) 

  //  app.get('/beAVolunteer/:id', async (req,res) => {
  //   const id = req.params.id 
  //   const query = {_id: new ObjectId(id)}
  //   const result = await beVolunteerCollection.findOne(query)
  //   res.send(result)
  // }) 

  app.delete('/beAVolunteer/:id', async (req,res) => {
    const id = req.params.id
    const query = {_id : new ObjectId(id)}
    const result = await beVolunteerCollection.deleteOne(query)
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
  app.put('/volunteer/:id', async (req, res) => {
    const id = req.params.id
    const Data = req.body
    const query = {_id : new ObjectId(id)}
    const option = {upsert:true}
    const updateDoc = {
        $set:{
            ...Data
        }
    }
    const result = await volunteerCollection.updateOne(query, updateDoc, option)
    res.send(result)
  })

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