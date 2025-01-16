const { default: mongoose } = require("mongoose")

const userschema=new mongoose.Schema({
    firstname:{
      type:String,
      require:true
    },
    lastname:{
      type:String,
      required:true
    },
    email:{
      type:String,
      required:true
    },
    password:{
      type:String,
      require:true
    },
    phonenumber:{
      type:String,
      default:null
    },
    is_blocked:{
      type:Boolean,
      enum:[true,false],
      default:false
    }
})
module.exports=mongoose.model("user",userschema)