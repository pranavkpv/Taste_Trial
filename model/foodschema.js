const mongoose = require('mongoose');
const { Schema } = mongoose;

const foodSchema = new Schema({
  foodname: {
    type: String,
    required: true,
    trim: true,
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  duration_time:{
    type:Number,
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
  is_blocked: {
    type: Boolean,
    required:true,
    default: false
  },
  image:{
    type: String,
    required:true
  },
  is_veg: {
    type: String,
    enum:['veg','non-veg'],
    default:'veg'
  }
}, { timestamps: true });

module.exports= mongoose.model('Food', foodSchema);

