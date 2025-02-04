const locationSchema=require('../../model/locationSchema')
const delivery = async(req,res)=>{
   try {
      const locations=await locationSchema.find()
      res.render('admin/deliveryFeeManage',{locations})
   } catch (error) {
      console.log(error)
   }
}

const addLocation = async(req,res)=>{
   try {
      const {location,deliveryCharge}=req.body
      if(!location && location===""){
        return res.json({needLocation:"Required Location"})
      }
      const newLocation = new locationSchema({
         location:location,
         deliveryCharge:deliveryCharge
      })
      await newLocation.save()
      res.json({success:"SuccessFully Added"})
      res.redirect('/admin/location')
   } catch (error) {
      console.log(error)
   }
}


module.exports={delivery,addLocation}