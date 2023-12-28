const mongoose=require('mongoose')
require("dotenv").config()


// mongoose.connect('mongodb://127.0.0.1:27017/poduppil').then(()=>{
//     console.log("DB connected");
mongoose.connect("mongodb+srv://DEEPAKTS:Tsdeepak589@loodieefasion.s7obwlv.mongodb.net/?retryWrites=true&w=majority").then(()=>{
    console.log("DB connected");
})
.catch(()=>{
    console.log("DB not connected");
})