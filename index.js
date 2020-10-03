const express = require('express')
const app = express()
const port = 5000
const bodyParser= require('body-parser');
const cors= require('cors');
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;

require('dotenv').config()


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jolmh.mongodb.net/burjhAlArab?retryWrites=true&w=majority`;

app.use(cors());
app.use(bodyParser.json());





var serviceAccount = require("./configs/burjh-al-arab-firebase-adminsdk-f80mw-7ef77bac03.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB
});




const client = new MongoClient(uri, { useNewUrlParser: true,useUnifiedTopology: true });
client.connect(err => {
  const bookings = client.db("burjhAlArab").collection("bookings");
  
/*   console.log('db connection successfully'); */
app.post("/addBooking",(req,res) =>{
  const newBooking =req.body;
  bookings.insertOne(newBooking)
  .then(result=>{
    /* console.log(result); */
  res.send(result.insertedCount > 0);
  })
  /* console.log(newBooking); */


})
//get load data
app.get('/bookings',(req, res)=>{
  const bearer=req.headers.authorization;
  if(bearer && bearer.startsWith('Bearer ')){
    const idToken = bearer.split(' ')[1];
    console.log({idToken});
        // idToken comes from the client app
            admin.auth().verifyIdToken(idToken)
            .then(function(decodedToken) {
              const tokenEmail = decodedToken.email;
              const queryEmail = req.query.email;
             // console.log(tokenEmail, queryEmail);

          if(tokenEmail== queryEmail) {
              bookings.find({email: queryEmail})
                  .toArray((err,documents)=>{
                   res.status(200).send(documents);
        })
          }
          else{
            res.status(401).send('un authorized access')
          }
             
            }).catch(function(error) {        
              // Handle error
            });
  }
  else{
    res.status(401).send('un authorized access')
  }



  /* bookings.find({email: req.query.email})
  .toArray((err,documents)=>{
    res.send(documents);
  }) */
})

});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port)