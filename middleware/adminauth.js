const session=require('express-session')

const adminLog=(req,res,next)=>{
   try {
      if(req.session.admin){
         next()
      }else{
         req.flash('noAdmin',"Please login to continue")
         res.redirect('/admin/login')
      }
   } catch (error) {
      console.log(error)
   }
}

module.exports={adminLog}

