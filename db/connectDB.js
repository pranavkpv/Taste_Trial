const mongoose = require('mongoose')
const mongoUrl = process.env.MONGODB_URL
const food=require('../model/foodschema')
const category=require('../model/categoryschema')
async function updateOffer(){
   const now=new Date();
   try {
      await food.updateMany(
         {expiry_date:{$lt:now}},
         {$set:{offer:0}}
      )
      await category.updateMany(
         {expiry_date:{$lt:now}},
         {$set:{offer:0}}
      )
   } catch (error) {
      console.error("Error updating expired offers:", error);
   }
}


const connectDB=async()=>{
   try {
      await mongoose.connect(mongoUrl)
      console.log("connect database")
      updateOffer()
   } catch (error) {
      console.log("Error",error)
   }
   
}
module.exports=connectDB