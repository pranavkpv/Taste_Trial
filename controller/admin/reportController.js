const orderschema = require('../../model/orderschema')

const salesReport = async (req, res) => {
   try {
      const { fromdate, todate, month, year } = req.query
       // Parse the dates and ensure proper validation
       const fromDate = fromdate ? new Date(fromdate) : null;
       const toDate = todate ? new Date(todate) : null;
       const targetMonth = month ? parseInt(month, 10) : null;
       const targetYear = year ? parseInt(year, 10) : null;

       // Build the match filter dynamically
       const matchFilter = {};
       if (fromDate) matchFilter.createdAt = { $gte: fromDate };
       if (toDate) matchFilter.createdAt = { ...matchFilter.createdAt, $lte: toDate };
       if (targetMonth) matchFilter['$expr'] = { $eq: [{ $month: "$createdAt" }, targetMonth] };
       if (targetYear) matchFilter['$expr'] = { ...matchFilter['$expr'], $eq: [{ $year: "$createdAt" }, targetYear] };

      const orders = await orderschema.aggregate([
         {$match:matchFilter},
         {
         $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "userDetails"
         }
      },
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
            from: "varients",
            localField: "rateDetails.varient_id",
            foreignField: "_id",
            as: "varientDetails"
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
         $lookup: {
            from: "coupons",
            localField: "couponId",
            foreignField: "_id",
            as: "couponDetails"
         }
      },
     
      ])
      const couponSum = orders.reduce((sum, element) => {
         if (element.couponDetails.length > 0) {
            sum = sum + ((element.totalAmount - element.totalOffer) * element.couponDetails[0].discount_per / 100)
         }
         return sum
      }, 0)
      orders.forEach(element => {
         const day = String(element.createdAt.getDate()).padStart(2, '0');
         const month = String(element.createdAt.getMonth() + 1).padStart(2, '0');
         const year = element.createdAt.getFullYear();
         const formattedDate = `${ day }-${ month }-${ year }`;
         element.formattedCreatedAt = formattedDate;
      })
      const sum = await orderschema.aggregate([{ $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } }])
      const offersum = await orderschema.aggregate([{ $group: { _id: null, totalOffer: { $sum: "$totalOffer" } } }])
      res.render('admin/salesReport', { orders, sum, offersum, couponSum ,fromdate,todate,month,year})
   } catch (error) {
      console.log(error)
   }
}

module.exports = { salesReport }