
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
const categoryschema = require('../../model/categoryschema')
const couponschema = require('../../model/couponschema')
const walletschema=require('../../model/walletSchema')
const ObjectId = mongoose.Types.ObjectId;

const dashboard = async (req, res) => {
   try {
      const userid = req.session.user
      res.render('user/dashboard', { userid, searchmessage: "", searcheditemname: "" })
   } catch (error) {
      console.log(error)
   }
}

const address = async (req, res) => {
   try {
      const successmessage = req.flash('success')
      const userid = req.session.user
      const addressess = await addressSchema.find({ user_id: userid })
      res.render('user/address', { userid, successmessage, addressess, searchmessage: "", searcheditemname: "" })
   } catch (error) {
      console.log(error)
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
      res.redirect(`/user/address`)

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
      res.redirect(`/user/address/`)
   } catch (error) {
      console.log(error)
   }
}

const deleteAddress = async (req, res) => {
   try {
      const { deleteid, userid } = req.body
      await addressSchema.findByIdAndDelete({ _id: deleteid })
      req.flash('success', 'Address Deleted Successfully')
      res.redirect(`/user/address`)
   } catch (error) {
      console.log(console.error)
   }
}



const changeAccount = async (req, res) => {
   try {
      const successmessage = req.flash("success")
      const userid = req.session.user
      const users = await userschema.findOne({ _id: userid })
      res.render('user/changeAccount', { userid, users, successmessage, searchmessage: "", searcheditemname: "" })
   } catch (error) {
      console.log(error)
   }
}

const updateAction = async (req, res) => {
   try {
      const { fname, lname, phone, email, userid } = req.body
      await userschema.updateOne({ email: email }, {
         firstname: fname,
         lastname: lname,
         phonenumber: phone,
         email: email
      })
      req.flash('success', "Updated Successfully")
      res.redirect(`/user/changeAccount`)
   } catch (error) {
      console.log(error)
   }
}


const order = async (req, res) => {
   try {
      const userid = req.session.user;
      const successmessage = req.flash('success')
      const limit=2
      const selectedPage=req.query.page ||1
      const skip=(selectedPage-1)*limit
      // Fetch orders for the user, including populated items.rate_id and food_id
      const orders = await orderschema.aggregate([{ $match: { user_id: new ObjectId(userid) } }, { $unwind: "$items" }
         , {
            $lookup: {
               from: "rates",
               localField: "items.rate_id",
               foreignField: "_id",
               as: "rateDetails"
            }
      },
      {
         $lookup: {
            from: "foods",
            localField: 'rateDetails.food_id',
            foreignField: "_id",
            as: "foodDetails"
         }
      },{$sort:{createdAt:-1}},{$skip:skip},{$limit:limit}
      ])
      console.log(orders)


      orders.forEach(order => {
         order.createdAtFormatted = order.createdAt
            ? new Date(order.createdAt).toISOString().split('T')[0]
            : null;

      })
      const orderss=await orderschema.aggregate([{$match:{user_id: new ObjectId(userid)}},{$unwind:"$items"}])
      const page=Math.ceil(orderss.length/limit)


      // Render the orders page
      res.render('user/order', { userid, orders,selectedPage, successmessage, searchmessage: "", searcheditemname: "",page });
   } catch (error) {
      console.error('Error in fetching orders:', error);
      res.status(500).send("An error occurred while fetching orders.");
   }
};


const orderCancel = async (req, res) => {
   try {

      const userId=req.session.user
      const numQty = parseInt(req.body.qty);
      const rates = await rateschema.findOne({ _id: req.body.rateId })
      const orders = await orderschema.findOne({ _id: req.body.orderid })
      await rateschema.findByIdAndUpdate({ _id: req.body.rateId }, { $inc: { stock: numQty } });
      
      const x = await orderschema.findOne({ _id: req.body.orderid })
      const result = x.items.filter(val => val.rate_id == req.body.rateId)
      const minusAmount = result[0].quantity * (result[0].rate + result[0].rate * result[0].gst_per / 100 +
         result[0].rate * result[0].packing_per / 100 + result[0].rate * result[0].delivery_per / 100)
      const minusOffer = result[0].quantity * result[0].rate * result[0].offer_per / 100
      await orderschema.updateOne(
         {
            _id: req.body.orderid,
            "items.rate_id": req.body.rateId,  // Search for the matching rate_id inside the items array
            "items.status": { $in: ["processing", "packing", "onTheWay"] }
         },
         {
            $set: {
               "items.$.status": "cancelled"  // Use $ to target the matching element
            }
         }
      );
      await orderschema.updateOne({_id:req.body.orderid},{$inc:{totalAmount:-minusAmount,totalOffer:-minusOffer}})
      const newWallet = new walletschema({
         desription:"Order Cancel",
         type:"Credit",
         amount:minusAmount-minusOffer,
         userId:userId
      })
      await newWallet.save()
      req.flash('success', "The order was cancelled successfully.");
      res.redirect('/user/order');
   } catch (error) {
      console.error(error);

      if (error instanceof mongoose.Error || error.name === "BSONError") {
         req.flash('error', "An error occurred due to invalid input data.");
      } else {
         req.flash('error', "An error occurred while canceling the order.");
      }

      res.status(500).redirect('/user/order'); // Redirect with a status message
   }
};


const orderDetails = async (req, res) => {
   try {
      const userid = req.session.user
      const orderid = req.query.orderId
      const rateid = req.query.rateid
      const rates = await rateschema.findOne({ _id: rateid })
      const foods = await foodschema.findOne({ _id: rates.food_id })
      const hotels= await hotelschema.findOne({_id:rates.hotel_id})
      const categories = await categoryschema.findOne({ _id: foods.category_id })
      const varients = await varientschema.findOne({ _id: rates.varient_id })
      const users = await userschema.findOne({ _id: userid })
      const orders = await orderschema.findOne({ _id: orderid })
      const addresses = await addressSchema.findOne({ _id: orders.address_id })
      const date = orders.createdAt
      const formattedDate = date.toISOString().split('T')[0];
      let Quantity = 0
      for (let i = 0; i < orders.items.length; i++) {
         if (orders.items[i].rate_id.toString() == new ObjectId(req.query.rateid)) {
            Quantity = orders.items[i].quantity
         }
      }
      const items=orders.items.filter((element)=>element.rate_id==rateid)
      res.render('user/orderDetails', {hotels,items, userid, searchmessage: "", formattedDate, searcheditemname: "", rates, foods, varients, users, addresses, orders, Quantity, categories })
   } catch (error) {
      console.log(error)
   }
}


const orderReturn = async (req, res) => {
   try {
   
      const { orderId, rateId } = req.body
      console.log("orderReturn-",req.body)
      await orderschema.updateOne(
         {
            _id: orderId,
            "items.rate_id": rateId,  // Search for the matching rate_id inside the items array
            "items.status": { $in: ["delivered"] }
         },
         {
            $set: {
               "items.$.status": "waiting for approval"  // Use $ to target the matching element
            }
         }
      );
      req.flash('success', "waiting for approval")
      res.redirect('/user/order')
   } catch (error) {
      console.log(error)
   }
}





module.exports = {
   dashboard, address, addAddress, editAddress, deleteAddress,
   changeAccount, order, orderCancel, updateAction, orderDetails,
   orderReturn
}