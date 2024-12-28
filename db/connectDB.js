const mongoose=require('mongoose')
const connectDB=async()=>{
   try {
      const connect=await mongoose.connect("mongodb://localhost:27017/tastetrial")
      console.log("connect database")
   } catch (error) {
      console.log("Error")
   }
   
}
module.exports=connectDB