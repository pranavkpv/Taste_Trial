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
  hotel_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true,
  },
  rate: {
    type: Number,
    required: true,
  },
  gst_per: {
    type: Number,
    required: true,
  },
  delivery_charge: {
    type: Number,
    required: true,
  },
  packing_charge: {
    type: Number,
    required: true,
  },
  duration_time: {
    type: Number,
    required: true,
  },
  offer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
  },
  is_blocked: {
    type: Boolean,
    required:true,
    default: false
  },
  is_veg: {
    type: Boolean,
    required:true
  },
  rating_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rating',
  },
}, { timestamps: true });

module.exports= mongoose.model('Food', foodSchema);

