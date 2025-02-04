const { default: mongoose } = require("mongoose")

const locationSchema=new mongoose.Schema({
    location:{
      type:String,
      required:true
    },
    deliveryCharge:{
      type:Number,
      required:true
    }
},{timestamps:true})
module.exports=mongoose.model("locations",locationSchema)