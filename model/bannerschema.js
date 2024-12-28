const { default: mongoose } = require("mongoose");

const bannerschema = new mongoose.Schema(
   {
      image: {
         type: String,
         required: true,
      },
      title: {
         type: String,
         required: true,
      },
      created_at: {
         type: Date,
         required: true,
         default: Date.now, 
      },
   }
);

module.exports = mongoose.model("banner", bannerschema);
