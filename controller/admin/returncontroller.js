
const orderschema = require("../../model/orderschema")
const rateschema = require("../../model/rateschema")
const walletschema=require("../../model/walletSchema")


const returndata = async (req, res) => {
   try {
      const searchedinvoice = req.query.invoice || ''; // Get the search query
      const selectedpage = Number(req.query.pagenumber) || 1; // Get the page number
      const limit = 5; // Number of categories per page
      const skip = (selectedpage - 1) * limit; // Calculate the skip value

      // Search filter
      const searchFilter = searchedinvoice
         ? { title: { $regex: searchedinvoice, $options: 'i' }, _id: req.query.orderid }
         : {};


   

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
            $lookup: {
               from: "categories",
               localField: "foodDetails.category_id",
               foreignField: "_id",
               as: "categoryDetails"
            }
         }
         , { $match: { "items.status": "waiting for approval" } }, { $sort: { createdAt: -1 } }
      ]);
      orders.forEach(order => {
         order.createdAtFormatted = order.createdAt
            ? new Date(order.createdAt).toISOString().split('T')[0]
            : null;

      })
      const totaldata=orders.length
      const page = Math.ceil(totaldata / limit);
      const successmessage = req.flash('success')
      res.render('admin/returndata', { orders, startIndex, page, selectedpage, searchedinvoice, successmessage });

   } catch (error) {
      console.log(error)
   }
}


const approveReturn = async (req, res) => {
   try {
      const { orderId, rateId, quantity } = req.body
      const rates = await orderschema.findOne({ _id: rateId })
      const x = await orderschema.findOne({ _id: orderId })
      const result = x.items.filter(val => val.rate_id == rateId)
      const minusAmount = result[0].quantity * (result[0].rate + result[0].rate * result[0].gst_per / 100 +
      result[0].rate * result[0].packing_per / 100 + result[0].rate  )
      const minusOffer=result[0].quantity*result[0].rate * result[0].offer_per / 100

      if(x.items.length==1){

         await orderschema.updateOne({ _id: orderId, "items.rate_id": rateId },
            { $set: { 'items.$.status': "returned" } }
         )
         await orderschema.updateOne({_id:orderId},{$inc:{totalAmount:-minusAmount,totalOffer:-minusOffer}})
         await orderschema.updateOne({_id:orderId},{$set:{paidStatus:"completed"}})
         await orderschema.findByIdAndUpdate({_id:orderId},{deliveryAmount:0})

         const newWallet=new walletschema({
            desription:"Order Return",
            type:"Credit",
            amount:minusAmount-minusOffer,
            userId:x.user_id
         })
         await newWallet.save()
         req.flash('success', "Approved SuccessFully")
         res.redirect('/admin/returndata')
      }else{
         await orderschema.updateOne({ _id: orderId, "items.rate_id": rateId },
            { $set: { 'items.$.status': "returned" } }
         )
         await orderschema.updateOne({_id:orderId},{$inc:{totalAmount:-minusAmount,totalOffer:-minusOffer}})
         await orderschema.updateOne({_id:orderId},{$set:{paidStatus:"completed"}})
         const newWallet=new walletschema({
            desription:"Order Return",
            type:"Credit",
            amount:minusAmount-minusOffer,
            userId:x.user_id
         })
         await newWallet.save()
         req.flash('success', "Approved SuccessFully")
         res.redirect('/admin/returndata')
      }
      
   } catch (error) {
      console.log(error)
   }
}

const rejectReturn = async (req, res) => {
   try {
      const { orderId, rateId, quantity } = req.body
      await orderschema.updateOne({ _id: orderId, "items.rate_id": rateId },
         { $set: { 'items.$.status': "delivered" } }
      )
      req.flash('success', "Rejected SuccessFully")
      res.redirect('/admin/returndata')
   } catch (error) {
      console.log('error')
   }
}

module.exports = { returndata, approveReturn, rejectReturn }