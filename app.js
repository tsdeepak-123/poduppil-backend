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


app.use(cors({
  origin: ["https://main.d1cqvpag7aboy8.amplifyapp.com"],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// app.use(cors({
//   origin: ["http://localhost:3000"],
//   methods: ['GET', 'POST', 'PATCH', 'DELETE'],
//   credentials: true,
//   // allowedHeaders: ['Content-Type', 'Authorization'],
// }));



app.use('/',userRoute)
app.use('/admin',adminRoute)


app.listen(5001,()=>{
    console.log("server connected");
})



