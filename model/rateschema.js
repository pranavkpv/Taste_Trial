const { default: mongoose } = require("mongoose")

const rateSchema=new mongoose.Schema({
  hotel_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'hotel',
      required:true
  },
  food_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'food',
      required:true
  },
  varient_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'hotel',
    required:true
  },
  rate:{
   type:Number,
   required:true
  },
  gst_per:{
   type:Number,
   required:true
  },
  packing_per:{
   type:Number,
   required:true
  },
  delivery_per:{
   type:Number,
   required:true
  },
  images:{
    type:[String],
    required:true
  },
  delivery_time:{
    type:Number,
    required:true
  },
  stock:{
    type:Number,
    requitred:true
  },
  files:{
    type:[String],
    required:true
  }
})
module.exports=mongoose.model("rate",rateSchema)