const orderschema = require('../../model/orderschema')
const order = async (req, res) => {
   try {
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
         },{
            $lookup:{
               from :"foods",
               localField:"rateDetails.food_id",
               foreignField:"_id",
               as:"foodDetails"
            }
         }
      ]);
      console.log(orders)


      orders.forEach(order => {
         order.createdAtFormatted = order.createdAt
            ? new Date(order.createdAt).toISOString().split('T')[0]
            : null;

      })

      res.render('admin/order', { orders });
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



module.exports = { order, updateStatus };
