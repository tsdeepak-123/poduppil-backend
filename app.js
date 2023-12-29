const express=require('express')
const app=express()
const path=require('path')
const cors=require('cors')
require("dotenv").config()
const userRoute=require('./Routes/user')
const adminRoute = require('./Routes/Admin')

require('./config/connection')



app.use(express.urlencoded({extended:false}));
app.use(express.json())


// app.use(cors({
//   origin: ["https://www.poduppilconstructions.com"],
//   methods: ['GET', 'POST', 'PATCH', 'DELETE'],
//   credentials: true,
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://www.poduppilconstructions.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});


app.use('/',userRoute)
app.use('/admin',adminRoute)


app.listen(5001,()=>{
    console.log("server connected");
})



