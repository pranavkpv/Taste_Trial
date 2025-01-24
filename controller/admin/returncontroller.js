const orderschema=require("../../model/orderschema")
const rateschema=require("../../model/rateschema")


const returndata = async(req,res)=>{
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
         ,{$match:{"items.status":"waiting for approval"}}, { $sort: { createdAt: -1 } }
      ]);
      orders.forEach(order => {
         order.createdAtFormatted = order.createdAt
            ? new Date(order.createdAt).toISOString().split('T')[0]
            : null;

      })
      const successmessage = req.flash('success')
      res.render('admin/returndata', { orders, startIndex, page, selectedpage, searchedinvoice,successmessage });

 } catch (error) {
   console.log(error)
 }
}


const approveReturn = async(req,res)=>{
   try {
      const {orderId,rateId,quantity}=req.body
      await orderschema.updateOne({_id:orderId,"items.rate_id":rateId},
         {$set:{'items.$.status':"returned"}}
      )
      await rateschema.findByIdAndUpdate({_id:rateId},{$inc:{stock:quantity}})
      req.flash('success',"Approved SuccessFully")
      res.redirect('/admin/returndata')
   } catch (error) {
      console.log(error)
   }
}

const rejectReturn = async(req,res)=>{
   try {
      const {orderId,rateId,quantity}=req.body
      await orderschema.updateOne({_id:orderId,"items.rate_id":rateId},
         {$set:{'items.$.status':"delivered"}}
      )
      req.flash('success',"Rejected SuccessFully")
      res.redirect('/admin/returndata')
   } catch (error) {
      console.log('error')
   }
}

module.exports={returndata,approveReturn,rejectReturn}