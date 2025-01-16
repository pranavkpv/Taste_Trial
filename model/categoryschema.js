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
  isdeleted: {
    type: Boolean,
    required: true,
    default: false, // Optional: You can set a default value
  }
})
module.exports=mongoose.model("category",categoryschema)