const express=require('express')
const app=express()
const path=require('path')
const cors=require('cors')
const userRoute=require('./Routes/user')
const adminRoute = require('./Routes/Admin')

require('./config/connection')
require("dotenv").config();


app.use(express.urlencoded({extended:false}));
app.use(express.json())


app.use(cors({
    origin: ["https://poduppilconstructions.com"],
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

app.use('/',userRoute)
app.use('/admin',adminRoute)


app.listen(5001,()=>{
    console.log("server connected");
})



