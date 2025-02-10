

const noUser=async(req,res,next)=>{
   try {
      if(req.session.user){
        next()
      }else{
         req.flash("notExist","Please Login To Continue")
         res.redirect('/user/load')
      }

   } catch (error) {
      console.log(error)
   }
}
module.exports={
   noUser
}