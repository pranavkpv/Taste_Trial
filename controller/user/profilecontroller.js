
const addressSchema = require('../../model/addressschema')
const cartSchema = require('../../model/cartschema')
const varientschema = require('../../model/varientschema')
const userschema = require('../../model/usershema')
const rateschema = require('../../model/rateschema')
const hotelschema = require("../../model/hotelschema")
const foodschema = require('../../model/foodschema')
const cartschema = require('../../model/cartschema')
const mongoose = require('mongoose');
const orderschema = require('../../model/orderschema')
const ObjectId = mongoose.Types.ObjectId;

const dashboard = async (req, res) => {
   try {
      const userid=req.session.user
      res.render('user/dashboard',{userid,searchmessage:"",searcheditemname:""})
   } catch (error) {
      console.log(error)
   }
}

const address = async (req, res) => {
   try {
      const successmessage = req.flash('success')
      const userid = req.params.id
      const addressess = await addressSchema.find({ user_id: userid })
      res.render('user/address', { userid, successmessage, addressess })
   } catch (error) {

   }
}

const addAddress = async (req, res) => {
   try {

      const { userid, addresstype, city, state, pincode, landmark, mobilenumber, alternativenumber } = req.body
      const newaddress = new addressSchema({
         user_id: userid,
         city,
         state,
         pin_code: pincode,
         landmark,
         mobile_no: mobilenumber,
         alternative_no: alternativenumber,
         addresstype
      })

      await newaddress.save()
      req.flash('success', "Address Added Successfully")
      res.redirect(`/user/address/${ userid }`)

   } catch (error) {
      console.log(error)
   }
}


const editAddress = async (req, res) => {
   try {
      const { userid, editid, addresstype, city, state, pincode, landmark, mobilenumber, alternativenumber } = req.body
      await addressSchema.findByIdAndUpdate({ _id: editid }, {
         city,
         state,
         pin_code: pincode,
         landmark,
         mobile_no: mobilenumber,
         alternative_no: alternativenumber,
         addresstype
      })
      req.flash('success', 'Address Edited Successfully')
      res.redirect(`/user/address/${ userid }`)
   } catch (error) {
      console.log(error)
   }
}

const deleteAddress = async (req, res) => {
   try {
      const { deleteid, userid } = req.body
      await addressSchema.findByIdAndDelete({ _id: deleteid })
      req.flash('success', 'Address Deleted Successfully')
      res.redirect(`/user/address/${ userid }`)
   } catch (error) {
      console.log(console.error)
   }
}



const changeAccount = async (req, res) => {
   try {
      const successmessage = req.flash("success")
      const userid = req.params.id
      const users = await userschema.findOne({ _id: userid })
      res.render('user/changeAccount', { userid, users, successmessage })
   } catch (error) {
      console.log(error)
   }
}

const order = async (req, res) => {
   try {
      const userid = req.params.id;
      console.log(userid)

      const successmessage = req.flash('success')

      // Fetch orders for the user, including populated items.rate_id and food_id
      const orders = await orderschema
         .find({ user_id: new mongoose.Types.ObjectId(userid) })
         .populate({
            path: 'items.rate_id',
            populate: {
               path: 'food_id',
               model: 'Food', // Ensure this is populated correctly with the Food model
            },
         })
         .lean(); // .lean() returns plain JavaScript objects, which is fine for rendering

      // Log the orders to check if the data is being populated properly
      console.log(orders);

      // Add necessary details for rendering
      orders.forEach(order => {
         order.items.forEach(item => {
            // Check if rate_id and food_id exist before trying to access their properties
            if (item.rate_id && item.rate_id.food_id) {
               item.food_image = item.rate_id.food_id.image || "default_image_url"; // Fallback if image doesn't exist
               item.food_name = item.rate_id.food_id.foodname || "Unknown Food"; // Fallback if food name doesn't exist
               item.rate = item.rate_id.rate || 0; // Fallback if rate doesn't exist
               item.quantity = item.quantity || 0; // Fallback if quantity is missing
               item.total = item.total_amount || 0; // Fallback if total_amount is missing
            } else {
               // If rate_id or food_id is missing, provide fallback data
               item.food_image = "default_image_url";
               item.food_name = "Unknown Food";
               item.rate = 0;
               item.quantity = 0;
               item.total = 0;
            }
         });
      });

      orders.forEach(order => {
         order.createdAtFormatted = order.createdAt
            ? new Date(order.createdAt).toISOString().split('T')[0]
            : null;

      })

      // Render the orders page
      res.render('user/order', { userid, orders, successmessage });
   } catch (error) {
      console.error('Error in fetching orders:', error);
      res.status(500).send("An error occurred while fetching orders.");
   }
};


const orderCancel = async (req, res) => {
   try {
      const { rateId, qty, userid, orderid,status } = req.body;
      const numQty = parseInt(qty);
      // Update the stock for the given rateId
      const rateIdObject = new mongoose.Types.ObjectId(rateId);
      await rateschema.updateOne({ _id: rateIdObject }, { $inc: { stock: numQty } })
      await orderschema.updateOne(
         {
            _id: orderid,
            "items.rate_id": rateIdObject,  // Search for the matching rate_id inside the items array
            "items.status":{$in:["processing","packing","onTheWay"]}
         },
         {
            $set: {
               "items.$.status": "cancelled"  // Use $ to target the matching element
            }
         }
      );
      req.flash('success', "The Order cancelled SuccessFully")
      // Redirect to the user's order page
      res.redirect(`/user/order/${ userid }`);
   } catch (error) {
      console.log(error);
      res.status(500).send("An error occurred while canceling the order.");
   }
};

// update profile
const updateAction = async (req, res) => {
   try {
      const { fname, lname, phone, email, password, userid } = req.body
      await userschema.updateOne({ email: email }, {
         firstname: fname,
         lastname: lname,
         phonenumber: phone,
         email: email,
         password: password
      })
      req.flash('success', "Updated Successfully")
      res.redirect(`/user/changeAccount/${ userid }`)
   } catch (error) {
      console.log(error)
   }
}




module.exports = {
   dashboard, address, addAddress, editAddress, deleteAddress,
   changeAccount, order, orderCancel, updateAction
}