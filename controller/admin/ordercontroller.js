const orderschema = require('../../model/orderschema')
const rateschema = require('../../model/rateschema')
const foodschema = require('../../model/foodschema')
const varientschema = require('../../model/varientschema')
const userschema = require('../../model/usershema')
const addressschema = require('../../model/addressschema')
const categoryschema = require('../../model/categoryschema')
const { ObjectId } = require('mongodb');

const order = async (req, res) => {
   try {
      const searchedinvoice = req.query.invoice || ''; // Get the search query
      const selectedpage = Number(req.query.pagenumber) || 1; // Get the page number
      const limit = 5; // Number of categories per page
      const skip = (selectedpage - 1) * limit; // Calculate the skip value

      // Search filter
      const searchFilter = searchedinvoice
         ? { title: { $regex: searchedinvoice, $options: 'i' }, _id: req.query.orderid }
         : {};

      // Get filtered data count
      const totaldata = await orderschema.countDocuments(searchFilter);
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
         }
         ,{$match:{"items.status":{$ne:"waiting for approval"}}}, { $sort: { createdAt: -1 } }
      ]);


      orders.forEach(order => {
         order.createdAtFormatted = order.createdAt
            ? new Date(order.createdAt).toISOString().split('T')[0]
            : null;

      })

      res.render('admin/order', { orders, startIndex, page, selectedpage, searchedinvoice });
   } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).send("Server Error");
   }
};

const updateStatus = async (req, res) => {

   try {
      const { orderId, itemId, newStatus } = req.body;
      console.log(req.body)
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
      const orders = await orderschema.findOne({ _id: new ObjectId(req.query.orderid) })
      const rates = await rateschema.findOne({ _id: new ObjectId(req.query.rateid) })
      const foods = await foodschema.findOne({ _id: rates.food_id })
      const categories = await categoryschema.findOne({_id:foods.category_id})
      const varients = await varientschema.findOne({ _id: rates.varient_id })
      const users = await userschema.findOne({ _id: new ObjectId(req.query.userid) })
      const addresses = await addressschema.findOne({ _id: orders.address_id })
      const date = orders.createdAt
      const formattedDate = date.toISOString().split('T')[0];
      let Quantity=0
      for(let i=0;i<orders.items.length;i++){
         if(orders.items[i].rate_id.toString()==new ObjectId(req.query.rateid)){
              Quantity=orders.items[i].quantity
         }
      }
      res.render('admin/orderDetails', { rates, foods, varients, users, addresses, formattedDate, orders,Quantity,categories })

   } catch (error) {
      console.log(error)
   }
}




module.exports = { order, updateStatus, orderDetails};
