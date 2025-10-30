const mongoose = require('mongoose')

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
      await mongoose.connect("mongodb://localhost:27017/tastetrial")
      // const connect=await mongoose.connect("mongodb+srv://User:User%40123@cluster0.xholv.mongodb.net/tastetrial"
      updateOffer()
   } catch (error) {
      console.log("Error",error)
   }
   
}
module.exports=connectDB