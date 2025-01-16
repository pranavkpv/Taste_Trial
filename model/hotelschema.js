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
  image:{
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
  food_items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food'
    },
  ],
  is_blocked:{
    type:Boolean,
    requred:true,
    default:false
  } 
},{ timestamps: true })
module.exports=mongoose.model("hotel",hotelSchema)