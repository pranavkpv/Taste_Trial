const { default: mongoose } = require("mongoose")

const hotelSchema=new mongoose.Schema({
  hotelname:{
      type:String,
      require:true
  },
  hoteladdress:{
    type:String,
    require:true
  },
  photo:{
    type:String,
    require:true
  },
  contact_no:{
    type:Number,
    require:true
  },
  alternative_no:{
    type:Number,
    require:true
  },
  created_at:{
    type:Date,
    default:Date.now()
  },
  is_blocked:{
    type:Boolean,
    requred:true,
    default:false
  } 
})
module.exports=mongoose.model("hotel",hotelSchema)