const foodschema = require('../../model/foodschema')
const categoryschema = require('../../model/categoryschema')


const food = async (req, res) => {
   try {
      const category = req.query.category || ''
      const searchedfoodname = req.query.food || ''
      const selectedpage = Number(req.query.pagenumber) || 1
      const limit = 5
      const skip = (selectedpage - 1) * limit
      const startIndex = skip + 1

      const errormessage = req.flash('error')[0] || ''
      const successmessage = req.flash('success')[0] || ''
      const existmessage = req.flash('exist')[0] || ''
      const editexistmessage = req.flash('editexist')[0] || ''

      let foodData = await foodschema.aggregate([
         { $match: { foodname: { $regex: searchedfoodname, $options: 'i' } } },
         {
            $lookup: {
               from: "categories",
               localField: "category_id",
               foreignField: "_id",
               as: "categoryDetails"
            }
         },
         { $unwind: "$categoryDetails" },
         { $match: { "categoryDetails.isdeleted": false } },
         { $skip: skip },
         { $limit: limit }
      ])

      let matchFood = await foodschema.aggregate([
         { $match: { foodname: { $regex: searchedfoodname, $options: 'i' } } },
         {
            $lookup: {
               from: "categories",
               localField: "category_id",
               foreignField: "_id",
               as: "categoryDetails"
            }
         },
         { $unwind: "$categoryDetails" },
         { $match: { "categoryDetails.isdeleted": false } }
      ])

      let formattedFoods = foodData.map(food => {
         if (food.expiry_date) {
            food.formattedExpiryDate = new Date(food.expiry_date)
               .toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
               .split("/")
               .join("-")
         }
         return food
      })


      let formattedData = []
      let totalData = 0
      let selectedCategory = []
      if (category == "") {
         selectedCategory = "All"
         totalData = matchFood.length
         formattedData = formattedFoods

      }else {
         formattedData = matchFood.filter(el => String(el.categoryDetails._id) === String(category))
         selectedCategory = await categoryschema.findOne({ _id: category })
         totalData = matchFood.filter(el => String(el.categoryDetails._id) === String(category)).length
      }

      const categories = await categoryschema.find({ isdeleted: false })
      const page = Math.ceil(totalData / limit)
      res.render('admin/food', {
         foodss: formattedData,
         categories,
         errormessage,
         successmessage,
         existmessage,
         editexistmessage,
         searchedfoodname,
         startIndex,
         page,
         category,
         selectedCategory,
         selectedpage
      })
   } catch (error) {
      console.log(error)
      req.flash('error', "An Error Occurred")
      res.redirect('/admin/food')
   }
}


const addFood = async (req, res) => {
   try {
      const { foodname, category_id, isveg, duration_time, offer, expirydate } = req.body;
      const file = req.file;
      const existFood = await foodschema.findOne({ foodname: { $regex: foodname, $options: "i" } })
      if (existFood) {
         req.flash('exist', "Food Is Already Exist");
         res.redirect('/admin/food');
      } else {
         if (offer == 0 && expirydate == "") {
            const image = `/uploads/${ file.filename }`
            const newFoods = new foodschema({
               foodname,
               category_id,
               is_veg: isveg,
               image,
               duration_time,
               offer
            })
            await newFoods.save()
            req.flash('success', "Food Is Saved SuccessFully");
            res.redirect('/admin/food');
         }
         const image = `/uploads/${ file.filename }`
         const newFood = new foodschema({
            foodname,
            category_id,
            is_veg: isveg,
            image,
            duration_time,
            offer,
            expiry_date: expirydate
         })
         await newFood.save()
         req.flash('success', "Food Is Saved SuccessFully");
         res.redirect('/admin/food');
      }


   } catch (error) {
      console.log(error)
   }

};


const editFood = async (req, res) => {
   try {
      const {
         foodname,
         category_id,
         is_veg,
         editid,
         duration_time,
         Offer,
         expirydate
      } = req.body;
      const file = req.file;
      const existfood = await foodschema.findOne({ _id: { $ne: editid }, foodname: { $regex: foodname, $options: "i" } });
      if (existfood) {
         req.flash('editexist', "Food Already Exist");
         res.redirect('/admin/food');
      } else {
         if (!file) {
            await foodschema.findByIdAndUpdate({ _id: editid }, { foodname, category_id, is_veg, duration_time, offer: Offer, expiry_date: expirydate });
            req.flash('success', "Food Updated Successfully");
            res.redirect('/admin/food');
         } else {
            const image = `/uploads/${ file.filename }`
            await foodschema.findByIdAndUpdate({ _id: editid }, { foodname, category_id, is_veg, duration_time, image, offer: Offer, expiry_date: expirydate });
            req.flash('success', "Food Updated Successfully");
            res.redirect('/admin/food');
         }
      }
   } catch (error) {
      console.error(error);
      req.flash('error', "An Error Occurred");
      return res.redirect('/admin/food');
   }
}


const blockFood = async (req, res) => {
   try {
      const { hideid } = req.body
      await foodschema.findByIdAndUpdate({ _id: hideid }, { is_blocked: true })
      req.flash('success', "Food Is Hide Successfully")
      res.redirect('/admin/food')
   } catch (error) {
      req.flash('error', "An Error Occured")
      res.redirect('/admin/food')
   }
}

const unblockFood = async (req, res) => {
   try {
      const { unhideid } = req.body
      await foodschema.findByIdAndUpdate({ _id: unhideid }, { is_blocked: false })
      req.flash('success', "Food Is Unhide Successfully")
      res.redirect('/admin/food')
   } catch (error) {
      req.flash('error', "An Error Occured")
      res.redirect('/admin/food')
   }

}

const deleteFood = async (req, res) => {
   try {
      const { deleteid } = req.body
      await foodschema.findByIdAndDelete({ _id: deleteid })
      req.flash('success', "Food Is Deleted Successfully")
      res.redirect('/admin/food')
   } catch (error) {
      req.flash('error', "An Error Occured")
      res.redirect('/admin/food')
   }
}


module.exports = {
   addFood,
   editFood, blockFood, unblockFood, food, deleteFood
}