const { default: mongoose } = require("mongoose")

const cartSchema=new mongoose.Schema({
    user_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required:true
    },
    rate_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'rate',
      required:true
    },
    number:{
      type:Number,
      required:true
    }
    
},{timestamps:true})
module.exports=mongoose.model("cart",cartSchema)