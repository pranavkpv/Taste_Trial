const { default: mongoose } = require("mongoose")

const addressSchema=new mongoose.Schema({
    user_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required:true
    },
    city:{
      type:String,
      required:true
    },
    state:{
      type:String,
      required:true
    },
    pin_code:{
      type:String,
      required:true
    },
    landmark:{
      type:String,
      required:true
    },
    mobile_no:{
       type:String,
       required:true
    },
    alternative_no:{
      type:String
    },
    addresstype:{
      type:String,
      enum:["home","office","Other"],
      required:true
    }
    
},{timestamps:true})
module.exports=mongoose.model("address",addressSchema)