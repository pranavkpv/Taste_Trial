const express=require('express')
const app=express()
const path=require('path')
const adminRouter=require('./routes/admin')
const userRouter=require('./routes/user')
const connectDB=require("./db/connectDB")
const userschema=require("./model/usershema")
const adminschema=require("./model/adminschema")
const categoryschema=require("./model/categoryschema")
const hotelSchema=require("./model/hotelschema")
const foodSchema=require("./model/foodschema")
const bannerschema=require('./model/bannerschema')



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine','ejs')
app.set('views',path.join(__dirname,"view"))


app.use(express.static(path.join(__dirname,"public")))

connectDB()

app.use("/admin",adminRouter)
app.use("/user",userRouter)
app.listen(3000)