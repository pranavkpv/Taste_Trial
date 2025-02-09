const orderschema = require('../../model/orderschema')
const rateschema = require('../../model/rateschema')
const foodschema = require('../../model/foodschema')
const varientschema = require('../../model/varientschema')
const userschema = require('../../model/usershema')
const addressschema = require('../../model/addressschema')
const categoryschema = require('../../model/categoryschema')
const hotelschema = require('../../model/hotelschema')
const { ObjectId } = require('mongodb');
const couponschema =require('../../model/couponschema')
const locationSchema = require('../../model/locationSchema')

const order = async (req, res) => {
   try {
      const searchedinvoice = req.query.invoice || ''; // Get the search query
      const selectedpage = Number(req.query.pagenumber) || 1; // Get the page number
      const limit = 5; // Number of categories per page
      const skip = (selectedpage - 1) * limit; // Calculate the skip value
      const selectedStatus=req.query.status

      // Search filter
      const searchFilter = searchedinvoice
         ? { _id: { $regex: searchedinvoice, $options: 'i' }, _id: req.query.orderid }
         : {};
      
   
         let selectedStatusFilter = {};
         if (selectedStatus && selectedStatus !== "All") {
            selectedStatusFilter = { "items.status": selectedStatus };
         }

      const totalFilter={...searchFilter,...selectedStatusFilter}

      // Get filtered data count
      const totaldata = await orderschema.countDocuments(totalFilter);
      const page = Math.ceil(totaldata / limit);

      // Get filtered and paginated data
      
      const startIndex = skip + 1
      const orders = await orderschema.aggregate([
         {
            $lookup: {
               from: "users",
               localField: "user_id",
               foreignField: "_id",
               as: "userDetails"
            }
         }, { $unwind: "$items" },
         {
            $lookup: {
               from: "rates",
               localField: "items.rate_id",
               foreignField: "_id",
               as: "rateDetails"
            }
         }, {
            $lookup: {
               from: "foods",
               localField: "rateDetails.food_id",
               foreignField: "_id",
               as: "foodDetails"
            }
         },
         {
            $lookup:{
               from:"categories",
               localField:"foodDetails.category_id",
               foreignField:"_id",
               as:"categoryDetails"
            }
         },{
            $lookup:{
               from:"coupons",
               localField:"couponId",
               foreignField:"_id",
               as:"couponDetails"
            }
         }
         ,{$match:{"items.status":{$ne:"waiting for approval"},paidStatus:{$ne:"failed"},...totalFilter}}, { $sort: { createdAt: -1 } },
         {$skip:skip},{$limit:limit}
      ]);


      orders.forEach(order => {
         order.createdAtFormatted = order.createdAt
            ? new Date(order.createdAt).toISOString().split('T')[0]
            : null;

      })

      


      res.render('admin/order', { orders, startIndex, page, selectedpage, searchedinvoice,selectedStatus });
   } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).send("Server Error");
   }
};

const updateStatus = async (req, res) => {

   try {
      const { orderId, itemId, newStatus } = req.body;
      console.log(req.body)
      const orders=await orderschema.findOne({_id:orderId})

      if(newStatus == "delivered" && orders.items.length == 1){
         await orderschema.updateOne(
            { _id: orderId, 'items._id': itemId },
            { $set: { 'items.$.status': newStatus} }
         );
         await orderschema.updateOne({_id:orderId},{$set:{paidStatus:"completed"}})
         return res.json({ success: true });
      }
      await orderschema.updateOne(
         { _id: orderId, 'items._id': itemId },
         { $set: { 'items.$.status': newStatus } }
      );
      res.json({ success: true });
   } catch (error) {
      console.error(error);
      res.json({ success: false, message: 'Error updating status' });
   }
};


const orderDetails = async (req, res) => {
   try {
      const {orderid,rateid}=req.query
      const orders = await orderschema.findOne({_id:orderid})
      console.log(orders)
      const rates = await rateschema.findOne({_id:rateid})
      const foods = await foodschema.findOne({_id:rates.food_id})
      const varients = await varientschema.findOne({_id:rates.varient_id})
      const users = await userschema.findOne({_id:orders.user_id})
      const addresses = await addressschema.findOne({_id:orders.address_id})
      const selectedData = orders.items.filter((element)=>{
        return  element.rate_id=rateid
      })
      const coupons = await couponschema.findOne({_id:orders.couponId})
      console.log(coupons)
      const locations = await locationSchema.findOne({_id:addresses.location_id})
     
      res.render('admin/orderDetails',{orders,rates,foods,varients,users,addresses,selectedData,coupons,locations})
      
   

   } catch (error) {
      console.log(error)
   }
}




module.exports = { order, updateStatus, orderDetails};
