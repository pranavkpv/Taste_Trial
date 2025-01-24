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
   items: [
      {
         rate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'rate', required: true },
         quantity: { type: Number, required: true },
         status: {
            type: String,
            enum: ["cancelled", "delivered", "processing", "packing", "onTheWay","returned","waiting for approval"],
            default: "processing"
         },
         rate:{type:Number,require:true},
         gst_per:{type:Number,required:true},
         packing_per:{type:Number,required:true},
         delivery_per:{type:Number,required:true},
         offer_per:{type:Number,required:true}
      }
   ],
   address_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'address'
   },
   paymentmethod: {
      type: String,
      enum: ["COD", "razorpay", "wallet"]
   },
   couponId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'coupon'
   },
   totalAmount:{
      type:Number,
      required:true
   },
   totalOffer:{
      type:Number,
      required:true
   }
}, { timestamps: true })
module.exports = mongoose.model("order", orderSchema)