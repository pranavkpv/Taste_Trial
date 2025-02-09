const session=require('express-session')

const adminLog=(req,res)=>{
   try {
      if(req.session.admin){
         res.render('admin/dashboard')
      }else{
         res.redirect('/admin/login')
      }
   } catch (error) {
      console.log(error)
   }
}

module.exports={adminLog}

