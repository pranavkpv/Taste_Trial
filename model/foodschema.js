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

