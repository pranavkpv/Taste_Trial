const { default: mongoose } = require("mongoose")

const categoryschema=new mongoose.Schema({
  categoryname:{
      type:String,
      require:true
    },
  image:{
    type:String,
    required:true
  },
  offer:{
    type:Number,
    required:true
  },
  expiry_date:{
    type:Date,
    validate: {
      validator: function (value) {
        return value > new Date(); // Ensures expiry_date is a future date
      },
      message: 'Expiry date must be in the future',
    },
  },
  isdeleted: {
    type: Boolean,
    required: true,
    default: false, // Optional: You can set a default value
  }
})
module.exports=mongoose.model("category",categoryschema)