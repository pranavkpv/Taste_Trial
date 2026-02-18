const express=require('express')
const app=express()
const path=require('path')
const adminRouter=require('./routes/admin')
const userRouter=require('./routes/user')
const connectDB=require("./db/connectDB")
const userschema=require("./model/usershema")
const categoryschema=require("./model/categoryschema")
const bannerschema=require('./model/bannerschema')
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const passport = require('passport')
const foodschema = require('./model/foodschema')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const paymentRoute=require('./routes/payment')
require('dotenv').config(); 

const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Load from .env
  key_secret: process.env.RAZORPAY_KEY_SECRET, // Load from .env
});




app.use(flash());
app.use(session({
   secret: 'your_secret_key', 
   resave: false, 
   saveUninitialized: true, 
   cookie: { 
    maxAge: 24 * 60 * 60 * 1000 * 1400000, 
     secure: false 
   }
}));

app.use((req, res, next) => {
   req.session.save(next);  
 });

 app.use(passport.initialize());
 app.use(passport.session());
 passport.use(new GoogleStrategy({
  clientID : process.env.GOOGLE_CLIENT_ID,
  clientSecret : process.env.GOOGLE_CLIENT_SECRET,
  // callbackURL : "http://localhost:3000/auth/google/callback"
  callbackURL:"http://tastetrial.shop/auth/google/callback"
 },

 async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if the user exists in the database based on their Google email
    let user = await userschema.findOne({ email: profile.emails[0].value });
    
    if (!user) {
      user = new userschema({
        firstname: profile.name.givenName,
        lastname: profile.name.familyName,
        email: profile.emails[0].value,
        password: 'googleOAuthPassword', 
        phonenumber: "000000000", 
      });
      await user.save();
    }
    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
}));

app.use((req, res, next) => {
  req.xhr = req.headers['x-requested-with'] === 'XMLHttpRequest';
  next();
});


// Serialize user into session
passport.serializeUser((user, done) => {
  done(null, user.id); // store user ID in session
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await userschema.findById(id);
    done(null, user); // Add user details to the session
  } catch (err) {
    done(err, false);
  }
});

app.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/user/login', // Redirect to login if authentication fails
}), async (req, res) => {
  const users = await userschema.findById(req.user._id)
  const banners = await bannerschema.find({})
  const categories = await categoryschema.find({})
  const foods = await foodschema.find({})
  req.flash('success',"User Login SuccessFully")
  req.session.user=users._id
  res.redirect('/user/home'); 
});





app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine','ejs')
app.set('views',path.join(__dirname,"view"))


app.use(express.static(path.join(__dirname,"public")))

connectDB()

app.use("/admin",adminRouter)
app.use("/user",userRouter)
app.use("/pay",paymentRoute)
const PORT = process.env.PORT || 3000
app.listen(PORT,()=>console.log("server is running"))