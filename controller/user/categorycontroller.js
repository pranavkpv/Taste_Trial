const rateschema=require('../../model/rateschema')

const category = async (req, res) => {
   try {
      const userId=req.session.user
      const rates=await rateschema.aggregate([{
        $lookup:{
         from:"foods",
         localField:"food_id",
         foreignField:"_id",
         as:"foodDetails"
        }
      },{
         $lookup:{
            from:"hotels",
            localField:"hotel_id",
            foreignField:"_id",
            as:"hotelDetails"
         }
      },
      {
         $lookup:{
            from:"varients",
            localField:"varient_id",
            foreignField:"_id",
            as:"varientDetails"
         }
      }
   ])


      res.render('user/category',{rates,searchmessage:"",searcheditemname:"",userId})
   } catch (error) {
      console.log(error)
   }
}


module.exports = { category }