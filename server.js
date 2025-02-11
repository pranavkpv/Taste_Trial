const express=require('express')
const app=express()
const path=require('path')
const adminRouter=require('./routes/admin')
const userRouter=require('./routes/user')
const connectDB=require("./db/connectDB")
const userschema=require("./model/usershema")
const adminschema=require("./model/adminschema")
const categoryschema=require("./model/categoryschema")
const hotelSchema=require("./model/hotelschema")
const foodSchema=require("./model/foodschema")
const bannerschema=require('./model/bannerschema')
const varientSchema=require('./model/varientschema')
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const passport = require('passport')
const foodschema = require('./model/foodschema')
const rateSchema = require('./model/rateschema')
const addressSchema=require('./model/addressschema')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const orderSchema=require('./model/orderschema')
const wishlistSchema=require('./model/wishlistschema')
const couponSchema=require('./model/couponschema')
const paymentRoute=require('./routes/payment')
const walletSchema=require('./model/walletSchema')
const locationSchema=require('./model/locationSchema')
require('dotenv').config(); // Load environment variables

const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Load from .env
  key_secret: process.env.RAZORPAY_KEY_SECRET, // Load from .env
});




app.use(flash());
app.use(session({
   secret: 'your_secret_key', // Replace with a secure secret key
   resave: false, // Do not force save the session if it was not modified
   saveUninitialized: true, // Save a session that is uninitialized
   cookie: { 
    maxAge: 24 * 60 * 60 * 1000 * 1400000, 
     secure: false // Make this true if using HTTPS
   }
}));

app.use((req, res, next) => {
   req.session.save(next);  // Force the session to be saved
 });

 app.use(passport.initialize());
 app.use(passport.session());
 passport.use(new GoogleStrategy({
  clientID : process.env.GOOGLE_CLIENT_ID,
  clientSecret : process.env.GOOGLE_CLIENT_SECRET,
  // callbackURL : "http://localhost:3000/auth/google/callback"
  callbackURL:"http://tastetrial.info/auth/google/callback"
 },

 async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if the user exists in the database based on their Google email
    let user = await userschema.findOne({ email: profile.emails[0].value });
    
    if (!user) {
      // If the user does not exist, create a new user
      user = new userschema({
        firstname: profile.name.givenName,
        lastname: profile.name.familyName,
        email: profile.emails[0].value,
        password: 'googleOAuthPassword', // You could generate a random password, or leave it empty
        phonenumber: "000000000", // Set a default value or leave null
      });

      // Save the new user to the database
      await user.save();
    }
    
    // Pass the user profile to the done function (which will be used for session management)
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
  console.log(req.session.user)
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
app.listen(3000)