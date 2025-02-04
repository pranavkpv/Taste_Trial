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
         offer_per:{type:Number,required:true}
      }
   ],
   address_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'address'
   },
   paymentmethod: {
      type: String,
      enum: ["COD", "razorpay", "wallet","failedRazorpay"]
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
   },   
    deliveryAmount:{
      type:Number,
      required:true
    },
   paidStatus:{
      type:String,
      enum:["pending","completed","failed"],
      default:"pending"
   }
}, { timestamps: true })
module.exports = mongoose.model("order", orderSchema)