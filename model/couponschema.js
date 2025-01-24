const { default: mongoose } = require("mongoose")
const couponSchema = new mongoose.Schema({
  couponCode: {
    type: String,
    required: true
  },
  discount_per: {
    type: Number,
    required: true
  },
  expiryDate: {
    type: Date,
    validate: {
      validator: function (value) {
        return value > new Date(); // Ensures expiry_date is a future date
      },
      message: 'Expiry date must be in the future',
    },
  }
})
module.exports = mongoose.model("coupon", couponSchema)