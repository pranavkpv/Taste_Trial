const { default: mongoose } = require("mongoose")

const orderSchema = new mongoose.Schema({
   order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'order'
   },
   user_id:{
     type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
   },
   items: [{
      rate_id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'rate'
      },
      quantity:{
         type:Number

      },
      total_amount:{
         type:Number
      },
      status: {
        type: String,
        enum: ["cancelled", "delivered", "processing", "packing", "onTheWay"],
        default: "processing"
     }
   }],
   address_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'address'
   },
   paymentmethod: {
      type: String,
      enum: ["COD", "UPI", "Other"]
   }
}, { timestamps: true })
module.exports = mongoose.model("order", orderSchema)