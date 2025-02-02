const orderschema = require('../../model/orderschema')
const userschema = require('../../model/usershema')

const dashboard = async (req, res) => {
   try {
      const orders = await orderschema.find({})
      const fromDate = req.query.fromDate;
      const toDate = req.query.toDate;
      const month = req.query.month;
      const year =req.query.year;
  
      
      let months=["January","February","March","April","May","June","July","August","September","October","November","December"]
      const corrMonth=months[Number(month)-1]
      
      const wantfromDate = fromDate && !isNaN(Date.parse(fromDate)) ? new Date(fromDate) : new Date();
      const wanttoDate = toDate && !isNaN(Date.parse(toDate)) ? new Date(toDate) : new Date();
      
      const fromday = wantfromDate.getDate()
      const todays = wanttoDate.getDate()
      let arrayDate = []
      let sumofSale = []
      const order = await orderschema.aggregate([
         {
            $lookup: {
               from: "coupons",
               localField: "couponId",
               foreignField: "_id",
               as: "couponDetails"
            }
         },
         {
            $match: {
               createdAt: { $gt: wantfromDate, $lt: wanttoDate },
               totalAmount: { $gt: 0 }
            }
         },
         {
            $addFields: {
               month: { $month: "$createdAt" },
               year: { $year: "$createdAt" }
            }
         },
         {
            $match: {
               $expr: {
                  $and: [
                     { $eq: ["$month", { $month: wantfromDate }] },
                     { $eq: ["$year", { $year: wantfromDate }] }
                  ]
               }
            }
         }
      ]);
      
      const couponSum = order.reduce((sum, element) => {
         if (element.couponDetails.length > 0) {
            sum = sum + ((element.totalAmount - element.totalOffer) * element.couponDetails[0].discount_per / 100)
         }
         return sum
      }, 0)




      if (wantfromDate.getMonth() == wanttoDate.getMonth()) {
         for (let i = fromday; i <= todays; i++) {
            const tempDate = new Date(wantfromDate)
            tempDate.setDate(i)
            let totalOrder = await orderschema.find({
               createdAt: {
                  $gte: tempDate,
                  $lt: new Date(tempDate.getTime() + 24 * 60 * 60 * 1000) // Add one day
               }
            })
            let sumofAmount = totalOrder.reduce((sum, element) => {
               return sum += element.totalAmount
            }, 0)
            arrayDate.push(tempDate.toISOString().split('T')[0])
            sumofSale.push(sumofAmount)
         }
      } else {
         console.log("error")
      }


      const orderProduct = await orderschema.aggregate([
         { $unwind: "$items" },
         { 
            $addFields: { 
               month: { $month: "$createdAt" }, 
               year: { $year: "$createdAt" } 
            } 
         },
         { 
            $match: {
               $expr: {
                  $and: [
                     { $eq: ["$month", { $month: wantfromDate }] },
                     { $eq: ["$year", { $year: wantfromDate }] }
                  ]
               },
               "items.status": { $nin: ["returned", "cancelled"] },
               createdAt: { $gt: wantfromDate, $lt: wanttoDate }
            }
         },
         {
            $lookup: {
               from: "rates",
               localField: "items.rate_id",
               foreignField: "_id",
               as: "rateDetails"
            }
         },
         { $unwind: "$rateDetails" },  // Ensure it's an object, not an array
         {
            $lookup: {
               from: "foods",
               localField: "rateDetails.food_id",
               foreignField: "_id",
               as: "foodDetails"
            }
         },
         { $unwind: "$foodDetails" },  // Ensure we can access foodname
         {
            $group: {
               _id: "$foodDetails.foodname",
               countofEachfood: { $sum: "$items.quantity" }
            }
         },
         { $limit: 10 }
      ]);
      



      const orderCategory = await orderschema.aggregate([
         { $unwind: "$items" },
         { 
            $addFields: { 
               month: { $month: "$createdAt" }, 
               year: { $year: "$createdAt" } 
            } 
         },
         { 
            $match: {
               $expr: {
                  $and: [
                     { $eq: ["$month", { $month: wantfromDate }] },
                     { $eq: ["$year", { $year: wantfromDate }] }
                  ]
               },
               "items.status": { $nin: ["returned", "cancelled"] },
               createdAt: { $gt: wantfromDate, $lt: wanttoDate }
            }
         },
         {
            $lookup: {
               from: "rates",
               localField: "items.rate_id",
               foreignField: "_id",
               as: "rateDetails"
            }
         },
         { $unwind: "$rateDetails" },
         {
            $lookup: {
               from: "foods",
               localField: "rateDetails.food_id",
               foreignField: "_id",
               as: "foodDetails"
            }
         },
         { $unwind: "$foodDetails" },
         {
            $lookup: {
               from: "categories",
               localField: "foodDetails.category_id",
               foreignField: "_id",
               as: "categoryDetails"
            }
         },
         { $unwind: "$categoryDetails" },
         {
            $group: {
               _id: "$categoryDetails.categoryname",
               countofEachcategory: { $sum: "$items.quantity" }
            }
         },
         { $limit: 10 }
      ]);
      


      const orderHotel = await orderschema.aggregate([
         { $unwind: "$items" },
         { $addFields: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } } },
         {
           $match: { 
             "items.status": { $nin: ["returned", "cancelled"] }, 
             createdAt: { $gt: wantfromDate, $lt: wanttoDate },
             month: parseInt(month),  // Corrected reference to the month field
             year: parseInt(year)     // Corrected reference to the year field
           }
         },
         {
           $lookup: {
             from: "rates",
             localField: "items.rate_id",
             foreignField: "_id",
             as: "rateDetails"
           }
         },
         {
           $lookup: {
             from: "hotels",
             localField: "rateDetails.hotel_id",
             foreignField: "_id",
             as: "hotelDetails"
           }
         },
         {
           $group: { 
             _id: "$hotelDetails.hotelname", 
             countofEachhotel: { $sum: "$items.quantity" }
           }
         },
         { $limit: 10 }
       ]);
       




      const arrayOforder = orderProduct.map((element) => {
         return element.countofEachfood
      })
      const arratOfproduct = orderProduct.map((element) => {
         return element._id[0]
      })

      const arraycategoryCount = orderCategory.map((element) => {
         return element.countofEachcategory
      })

      const arrayofCategory = orderCategory.map((element) => {
         return element._id[0]
      })

      const arrayorderHotel = orderHotel.map((element) => {
         return element.countofEachhotel
      })
      const arrayOfHotel = orderHotel.map((element) => {
         return element._id[0]
      })

      const usersCount = await userschema.countDocuments({createdAt:{$gt:wantfromDate,$lt:wanttoDate}})
      const blockUserCount = await userschema.countDocuments({ is_blocked: true,createdAt:{$gt:wantfromDate,$lt:wanttoDate }})
      const unblockUserCount = await userschema.countDocuments({ is_blocked: false,createdAt:{$gt:wantfromDate,$lt:wanttoDate } })
      const orderNumber = await orderschema.find({createdAt:{$gt:wantfromDate,$lt:wanttoDate},totalAmount:{$gt:0}})
      const totalOrderAmount = orderNumber.reduce((sum, element) => {
         return sum += element.totalAmount
      }, 0)

      const totalOfferAmount = orderNumber.reduce((sum, element) => {
         return sum += element.totalOffer
      }, 0)


      const statusOrders=await orderschema.aggregate([{
         $unwind:"$items"
      }])
      let pendingCount=0
      let deliveredCount=0
      let returnedCount=0
      for(let i=0;i<statusOrders.length;i++){
         if(statusOrders[i].items.status=="pending"){
            pendingCount++
         }
      }
      for(let i=0;i<statusOrders.length;i++){
         if(statusOrders[i].items.status=="delivered"){
            deliveredCount++
         }
      }
      for(let i=0;i<statusOrders.length;i++){
         if(statusOrders[i].items.status=="returned"){
            returnedCount++
         }
      }





      res.render('admin/dashboard', {
         orderNumber, totalOrderAmount, totalOfferAmount, couponSum,
         usersCount, blockUserCount, unblockUserCount, arrayDate: JSON.stringify(arrayDate), fromDate, toDate,
         sumofSale: JSON.stringify(sumofSale), arrayOforder: JSON.stringify(arrayOforder), arratOfproduct: JSON.stringify(arratOfproduct),
         arraycategoryCount: JSON.stringify(arraycategoryCount), arrayofCategory: JSON.stringify(arrayofCategory),
         arrayorderHotel: JSON.stringify(arrayorderHotel), arrayOfHotel: JSON.stringify(arrayOfHotel),pendingCount,deliveredCount,
         returnedCount,month,year,corrMonth
      })
   } catch (error) {
      console.log(error)
   }
}

module.exports = { dashboard }