const { default: mongoose } = require("mongoose")

const walletSchema=new mongoose.Schema({
   desription:{
      type:String,
      enum:['Order Payment','Order Return','Order Cancel']
   },
   type:{
      type:String,
      enum:['Credit','Debit']
   },
   amount:{
      type:Number
   },
   userId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'user',
   }
   },{ timestamps: true })
module.exports=mongoose.model("wallet",walletSchema)