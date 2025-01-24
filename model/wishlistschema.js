const { default: mongoose } = require("mongoose")

const wishlistSchema=new mongoose.Schema({
    rate_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'rate',
        required:true
    },
    user_id:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'user',
      required:true
    }
   },{ timestamps: true })
module.exports=mongoose.model("wishlist",wishlistSchema)