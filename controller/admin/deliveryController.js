const locationSchema=require('../../model/locationSchema')

const delivery = async(req,res)=>{
   try {
      const location = req.query.location
      const selectedPage = req.query.page || 1;
      const skip = (selectedPage-1)*5
      const limit=5
      let locations
      let addLocation
      if(location){
         locations=await locationSchema.find({location:{$regex:location,$options:"i"}}).skip(skip).limit(5) 
         addLocation=await locationSchema.find({location:{$regex:location,$options:"i"}})     
      }else{
         locations = await locationSchema.find().skip(skip).limit(5) 
         addLocation=await locationSchema.find()     
      }
       
      const successmessage=req.flash('success')
      const pages=Math.ceil(addLocation.length/limit);
     const selectedIndex=skip+1
      res.render('admin/deliveryFeeManage',{locations,successmessage,location,pages,selectedIndex,selectedPage})
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
      const existlocation=await locationSchema.findOne({location:{$regex:location,$options:"i"}})
      if(existlocation){
         return res.json({existError:"The Product Already Exist"})
      }
      const newLocation = new locationSchema({
         location:location,
         deliveryCharge:deliveryCharge
      })
      await newLocation.save()
      res.json({success:"SuccessFully Added"})
    
   } catch (error) {
      console.log(error)
   }
}

const editLocation=async(req,res)=>{
   try {
      const {location,deliveryCharge,Id}=req.body
      const existLocation=await locationSchema.find({_id:{$ne:Id},location:{$regex:location,$options:"i"}})
      if(existLocation.length>0){
      return res.json({exist:"Location is Already Exist"})
      }else{
         await locationSchema.findByIdAndUpdate({_id:Id},{location,deliveryCharge})
         return res.json({success:"SuccessFully Updated The Data"})
      }
      
   } catch (error) {
      console.log(error)
   }
}


const deleteLocation=async(req,res)=>{
   try {
      const {locationId}=req.body
      await locationSchema.findByIdAndDelete({_id:locationId})
       req.flash('success',"SuccessFully Delete The Data")
       res.redirect('/admin/delivery')
   } catch (error) {
      console.log(error)
   }
}




module.exports={delivery,addLocation,editLocation,deleteLocation}