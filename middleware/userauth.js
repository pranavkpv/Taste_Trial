const session=require('express-session')

const userlog=(req,res)=>{
   if(req.session.user){
      res.render('user/home')
   }else{
      res.redirect('/user/login')
   }
}

module.exports={
   userlog
}