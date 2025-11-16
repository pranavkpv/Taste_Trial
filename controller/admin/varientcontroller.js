const foodschema = require("../../model/foodschema")
const varientschema = require("../../model/varientschema")
const { ObjectId }=require('mongodb')

const varient = async (req, res) => {
   try {
      const selectedfoodname = req.query.food
      const searchedvarientname = req.query.varient || ''; 
      const selectedpage = Number(req.query.pagenumber) || 1; 
      const limit = 5; 
      const skip = (selectedpage - 1) * limit; 
      

      // Search filter
      const searchFilter = searchedvarientname
         ? { varientname: { $regex: searchedvarientname, $options: 'i' } }
         : {};
      
      const foodnameFilter = selectedfoodname 
      ? {food_id: new ObjectId(selectedfoodname)} :{};

      const totalFilter = {...searchFilter,...foodnameFilter}

      // Get filtered data count
      const totaldata = await varientschema.countDocuments(totalFilter);
      const page = Math.ceil(totaldata / limit);
      const startIndex=skip+1

      // Get filtered and paginated data

      const existmessage = req.flash('exist')
      const successmessage = req.flash('success')
      const errormessage = req.flash('error')
      const editexistmessage = req.flash('editexist')
      const foods = await foodschema.find({is_blocked:false})
      const varients = await varientschema.aggregate([{
         $lookup: {
            from: "foods",
            localField: "food_id",
            foreignField: "_id",
            as: "foodDetails"
         }
         
      },{
         $match:{...totalFilter}
      },{$skip:skip},{$limit:limit}])

      if(selectedfoodname && selectedfoodname != "both"){
         var varientss=varients.filter((element)=>element.foodDetails[0]._id==selectedfoodname)
         var foodss=await foodschema.findOne({_id:selectedfoodname})
      }else{
         var varientss=varients
         var foodss="All"
      }
   
      
      res.render('admin/varient', { varientss, foodss,
         foods, existmessage, selectedfoodname,selectedpage,
         successmessage, errormessage, editexistmessage, page, searchedvarientname,startIndex })
   } catch (error) {
         console.log(error)
   }
}

const addvarient = async (req, res) => {
   try {
      const { food_id, varientname } = req.body
      const existvarient = await varientschema.findOne({ food_id, varientname:{$regex:varientname,$options:"i"} })
      if (existvarient) {
         req.flash('exist', "Varient Already Exist in that foodname")
         res.redirect('/admin/varient')
      } else {
         const newvarient = new varientschema({
            food_id,
            varientname
         })
         newvarient.save()
         req.flash('success', "Varient Saved Successfully")
         res.redirect('/admin/varient')
      }
   } catch (error) {
      console.log(error)
      req.flash('error', "An Error Occured")
      res.render('/admin/varient')
   }
}

const editvarient = async (req, res) => {
   try {
      const { food_id, varientname, editid } = req.body
      const existvarient = await varientschema.find({ _id: { $ne: editid } });
      const countDocument = await varientschema.countDocuments() - 1;
      let existdata = 0
      for (let i = 0; i < countDocument; i++) {
         if (existvarient[i].food_id == food_id && existvarient[i].varientname == varientname) {
            existdata++
         }
      }
      if (existdata > 0) {
         req.flash('editexist', "Food Already Exist");
         res.redirect('/admin/varient');
      } else {
         await varientschema.findByIdAndUpdate({ _id: editid }, { food_id, varientname })
         req.flash('success', "Varient Updated Successfully");
         res.redirect('/admin/varient');
      }
   } catch (error) {
      req.flash('error', "An Error Occured");
      res.redirect('/admin/varient');
   }
}

const blockvarient = async (req, res) => {
   try {
      const { hideid } = req.body
      await varientschema.findByIdAndUpdate({ _id: hideid }, { is_blocked: true })
      req.flash('success', "Varient Hide Successfully")
      res.redirect('/admin/varient')
   } catch (error) {
      console.log(error)
      req.flash('error', "An Error Occured")
      res.redirect('/admin/varient')
   }
}

const unblockvarient = async (req, res) => {
   try {
      const { unhideid } = req.body
      await varientschema.findByIdAndUpdate({ _id: unhideid }, { is_blocked: false })
      req.flash('success', "Varient Unhide Successfully")
      res.redirect('/admin/varient')
   } catch (error) {
      console.log(error)
      req.flash('error', "An Error Occured")
      res.redirect('/admin/varient')
   }
}

const deletevarient = async (req, res) => {
   try {
      const { deleteid } = req.body
      await varientschema.findByIdAndDelete({ _id: deleteid })
      req.flash('success', "Varient Deleted Successfully")
      res.redirect('/admin/varient')
   } catch (error) {
      console.log(error)
      req.flash('error', "An Error Occured")
      res.redirect('/admin/varient')
   }
}

module.exports = {
   varient, addvarient, editvarient, blockvarient, unblockvarient, deletevarient
}