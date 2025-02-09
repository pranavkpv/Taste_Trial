const couponschema = require('../../model/couponschema')
const coupon = async (req, res) => {
   try {
      const searchedCoupon=req.query.coupon || "";
      const selectedPage=req.query.page || 1;
      const skip=(selectedPage-1)*6
      const coupons = await couponschema.find({couponCode:{$regex:searchedCoupon,$options:"i"}}).skip(skip).limit(6)
      const formattedCoupons = coupons.map((element) => {
         return {
            ...element.toObject(), // Convert Mongoose document to plain object if necessary
            expiryDate: element.expiryDate.toLocaleDateString("en-GB", {
               day: "2-digit",
               month: "2-digit",
               year: "numeric",
            }),
         };
      });
      let count=[]
      if(searchedCoupon){
         count=await couponschema.find({couponCode:{$regex:searchedCoupon,$options:"i"}})
      }else{
         count=await couponschema.find()
      }
      const selectedIndex=skip+1
      const totalPage=Math.ceil(count.length/6)
      const existmessage=req.flash('exist')
      const successmessage = req.flash('success')
      const editExistmessage = req.flash('editExist')
      res.render('admin/coupon', { successmessage, formattedCoupons,existmessage,selectedPage,editExistmessage,searchedCoupon,totalPage ,selectedIndex})
   } catch (error) {
      console.log(error)
   }
}

const addcoupon = async (req, res) => {
   try {
      const { couponCode, discount, expirydate } = req.body
      const existCoupon=await couponschema.findOne({couponCode})
      if(existCoupon){
         req.flash('exist',"The Coupon is Already Addedd")
         res.redirect('/admin/coupon')
      }else{
         const newCoupon = new couponschema({
            couponCode,
            discount_per: discount,
            expiryDate: expirydate
         })
         await newCoupon.save()
         req.flash('success', "SuccessFully Addedd Coupon")
         res.redirect('/admin/coupon')
      }
   } catch (error) {
      console.log(error)
   }
}

const editCoupon = async(req,res)=>{
   try {
      const {couponId,couponCode,discount,expirydate}=req.body
      const existCoupon=await couponschema.findOne({_id:{$ne:couponId},couponCode:couponCode})
      if(existCoupon){
        req.flash('editExist',"The Coupon Is Already Exist")
        res.redirect('/admin/coupon')
      }else{
         await couponschema.findByIdAndUpdate({_id:couponId},
            {couponCode,
            discount_per:discount,
            expiryDate:expirydate
         })
         req.flash('success',"Successfully Edited The coupon Details")
         res.redirect('/admin/coupon')
      }
   } catch (error) {
      console.log(error)
   }
}


const deleteCoupon=async(req,res)=>{
   try {
      const {deleteid}=req.body
      await couponschema.findByIdAndDelete({_id:deleteid})
      req.flash('success',"Successfully Deleted the data")
      res.redirect('/admin/coupon')
   } catch (error) {
      console.log(error)
   }
}
module.exports = { coupon, addcoupon,editCoupon,deleteCoupon }