const { default: mongoose } = require("mongoose")

const varientSchema=new mongoose.Schema({
    food_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required:true
    },
    varientname:{
      type:String,
      required:true
    },
  is_blocked:{
    type:Boolean,
    requred:true,
    default:false
  } 
},{ timestamps: true })
module.exports=mongoose.model("varient",varientSchema)