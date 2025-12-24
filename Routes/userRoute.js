const express=require("express");
// const UserModel = require("../models/UserModel");
// UserModel
const UserModel = require("../models/userModel");

const userRoute=express.Router()
require('dotenv').config()

const bcrypt = require('bcrypt');
const saltRounds = 9;
var jwt = require('jsonwebtoken');
// const nodemailer = require("nodemailer");

// send Email utility
// const sendEmail=require("../utils/sendEmail")





// for Google 

const passport = require('passport');
const BlacklistTokenModel = require("../models/blacklistTokenModel");
const BlacklistCheckMiddleware = require("../middelware/BlacklistCheckMiddleware");
const sendEmail = require("../utils/sendEmail");
const GoogleStrategy = require('passport-google-oauth20').Strategy;




userRoute.post("/signup", async (req, res) => {
  try {
    const { username, email, password,role } = req.body;
    // hash the raw password
    bcrypt.hash(password, saltRounds, async function (err, hash) {
      // Store hash in your password DB.
      if (err) {
        res.status(500).json({ message: "Something went wrong" });
      } else {
        // hash generated
        // console.log("rawpassword->", password,"hashed password-->",hash);
        // store this password in DB along with other userdata

       let user= await UserModel.create({ username, email, password: hash,role:role });
      
        const safeUser = {
  username: user.username,
  email: user.email,
  role: user.role
};

res.status(201).json({
  message: "Signup Success",
  user: safeUser
});
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});






userRoute.post("/login", async (req, res) => {
  /// email and password
  try {
    /// check whether user is present,
    const { email, password } = req.body;
    let user = await UserModel.findOne({ email });
    if (!user) {
      /// if no, send res as signup
      res.status(404).json({ message: "User Not Found, Please Signup"});
    } else {
      /// user found
      // if yes, comapare the password
      let hash = user.password; /// hashed - stored password from DB
      bcrypt.compare(password, hash).then(function (result) {
        // result == true
        
        ///console.log(result);
        if (result == true) {
          // if comparision true, then login success
          /// generate jwt and send along with the response
          var token = jwt.sign({userId: user._id,role:user.role},process.env.JWT_SECRET_KEY);
          //console.log(token)
       const safeUser = {
  username: user.username,
  email: user.email,
  role: user.role,
  loginId:user._id
};

          res.status(200).json({ message: "Login Sucesss", token,userdata:safeUser });
        } else {
          /// else wrong password
          res.status(403).json({ message: "Wrong Password" });
        }
      });
    }
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});




//For Google
// console.log("Google ID:", process.env.GOOGLE_CLIENT_ID);
// console.log("Google Secret:", process.env.GOOGLE_CLIENT_SECRET);



passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  function (accessToken, refreshToken, profile, done) {
    // console.log("Profile From Google:", profile);
    // यहां तुम DB logic लिख सकते हो (जैसे GitHub में किया था)
    return done(null, profile);
  }
));





// Step 1: Google login page पर redirect करने वाला route
userRoute.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);


userRoute.get('/auth/google/callback', 
  passport.authenticate('google', {session:false, failureRedirect: '/login' }),
  async function(req, res) {
    // Successful authentication, redirect home.
// console.log("hello this is res.user means isme id hogi",req.user)
// console.log(req.user.id)

const gooleUserId=req.user.id
const user=await UserModel.find({profileId:gooleUserId})

// console.log(user)
if(user.length==0){
  //user not found
  //store user into DB and genreate token

  // let newUser=UserModel.create({profileId:gooleUserId})
   let newUser = await UserModel.create({
          profileId: gooleUserId,
          username: req.user.displayName,
          email: req.user.emails[0].value,
         
        });
  let token =jwt.sign({userId:newUser._id ,role:newUser.role},process.env.JWT_SECRET_KEY)

    
        
  // res.status(200).json({"msg":"google Login successful",token})
        res.redirect(`${process.env.CLIENT_URL}/google-success?token=${token}&username=${newUser.username}&role=${newUser.role}&email=${newUser.email}&loginId=${newUser._id}`);
console.log(process.env.CLIENT_URL)
     
     
}else{
  console.log(process.env.CLIENT_URL)

let token=jwt.sign({userId:user[0]._id,role:user[0].role},process.env.JWT_SECRET_KEY)
  // res.status(200).json({"msg":"google Login successful",token})
       res.redirect(`${process.env.CLIENT_URL}/google-success?token=${token}&username=${user[0].username}&role=${user[0].role}&email=${user[0].email}&loginId=${user[0]._id}`);
}

  });





// forget Password

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com", /// Simple Mail Transport Protocol
//   port: 587,
//   secure: false, // true for 465, false for other ports
//   auth: {
//     /// We cannot directly use Google email and password
//     /// Google has security policy
//     /// Create An App in Google Account, use that app's password
//     user: process.env.GOOGLE_APP_EMAIL,
//     pass: process.env.GOOGLE_APP_PASSWORD,
//   },
// });


// ooptiion two 


// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false, // IMPORTANT
//   auth: {
//     user: process.env.GOOGLE_APP_EMAIL,
//     pass: process.env.GOOGLE_APP_PASSWORD,
//   },
//   tls: {
//     rejectUnauthorized: false, // Render fix
//   },
// });

// console.log(process.env.GOOGLE_APP_EMAIL)
// console.log("ha ye bhi deko "+ process.env.GOOGLE_APP_PASSWORD)

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: process.env.GOOGLE_APP_EMAIL,
//     pass: process.env.GOOGLE_APP_PASSWORD,
//   },
// });


// forgot-password

userRoute.post("/forgot-password", async (req, res) => {
  
  try {
    const { email } = req.body;

    console.log("Forgot password request for email:", email)
    let user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    let resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: 1200 }
    );

    let resetPasswordLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;


    const htmlBody = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Password Reset</title>
</head>
<body>
  <h2>Password Reset</h2>
  <p>Hello ${user.username},</p>
  <p>Click below to reset your password:</p>
  <a href="${resetPasswordLink}">Reset Password</a>
  <p>This link is valid for 20 minutes.</p>
</body>
</html>
`;


    await sendEmail({
      to:"devendrasingh20025@gmail.com",
      subject: "Password Reset Link",
      html: htmlBody
    });


    console.log(htmlBody)


    res.json({ message: "Password Reset Link Sent To Registered Email" });

  } catch (err) {
    console.error("Forgot-password error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});



// userRoute.post("/forgot-password", async (req, res) => {
//   try {
//     const { email } = req.body;

//     let user = await UserModel.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User Not Found" });
//     }

//     // token with expiry (12000 sec ≈ 3h 20m, tum 1200 (20min) bhi use kar sakte ho)
//     let resetToken = jwt.sign(
//       { userId: user._id },
//       process.env.JWT_SECRET_KEY,
//       { expiresIn: 1200 } // 20 minutes
//     );

//     // ⚠️ ye link FRONTEND ka hona chahiye, jahan tum reset page banaoge
//     // Example: http://localhost:5173/reset-password?token=...
//     let resetPasswordLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
//     console.log("Hello ji this is the chek or "+ process.env.CLIENT_URL)

//     console.log(process.env.GOOGLE_APP_EMAIL)
// console.log("ha ye bhi deko "+ process.env.GOOGLE_APP_PASSWORD)
//     const htmlBody = `
// <!doctype html>
// <html lang="en">
// <head>
//   <meta charset="utf-8" />
//   <title>Password Reset</title>
// </head>
// <body style="margin:0;padding:0;background:#f4f5fb;font-family:Arial,Helvetica,sans-serif;">
//   <div style="max-width:600px;margin:20px auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;">
//     <div style="background:#2563eb;color:#ffffff;padding:16px 20px;">
//       <h2 style="margin:0;font-size:20px;">Password Reset Request</h2>
//     </div>

//     <div style="padding:18px 20px;color:#111827;font-size:14px;line-height:1.6;">
//       <p style="margin:0 0 8px 0;">Dear <strong>${user.username}</strong>,</p>
//       <p style="margin:0 0 10px 0;">
//         We received a request to reset your account password. Click the button below to set a new password.
//         This link will be valid for <strong>20 minutes</strong>.
//       </p>

//       <div style="text-align:center;margin:18px 0;">
//         <a href="${resetPasswordLink}"
//            style="display:inline-block;padding:10px 18px;background:#2563eb;color:#ffffff;
//                   text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px;">
//           Reset Password
//         </a>
//       </div>

//       <p style="margin:0 0 8px 0;">
//         If the button above doesn’t work, copy and paste this link into your browser:
//       </p>
//       <p style="word-break:break-all;margin:0 0 14px 0;">
//         <a href="${resetPasswordLink}" style="color:#2563eb;">${resetPasswordLink}</a>
//       </p>

//       <p style="margin:0;color:#6b7280;font-size:12px;">
//         If you did not request this, you can safely ignore this email. Your password will not be changed.
//       </p>
//     </div>

//     <div style="padding:10px 20px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;">
//       <p style="margin:0;">Regards,<br/><strong>Authority</strong></p>
//     </div>
//   </div>
// </body>
// </html>
// `;

//     await transporter.sendMail({
//       from: `"Authority" <${process.env.GOOGLE_APP_EMAIL}>`,
//       to: user.email,
//       subject: "Password Reset Link",
//       html: htmlBody,
//     });

//     res.json({ message: "Password Reset Link Sent To Registered Email" });
//   } catch (err) {
//     console.error("Forgot-password error:", err);
//     res
//       .status(500)
//       .json({ message: "Something went wrong, please try again later" });
//   }
// });



// userRoute.post("/forgot-password", async (req, res) => {
//   // email is sent through body
//   try {
//     const { email } = req.body;
//     // check whether user is present in DB
//     let user = await UserModel.findOne({ email });
//     if (!user) {
//       res.status(404).json({ message: "User Not Found" });
//     } else {
//       /// user found
//       // need to send a reset password link to the email
//       /// Link should not easliy decodable
//       /// let us token??? generate an token will hide userId
//       /// localhost:3000/users/reset-password?token=kiuytrhsfdxgchvjklkjyfhtgv
//       // Genreal expiry time may be of 20 to 30mins
//       let resetToken = jwt.sign(
//         { userId: user._id },
//         process.env.JWT_SECRET_KEY,
//         { expiresIn: 12000 }
//       );

//       console.log(resetToken)
//       let resetPasswordLink = `http://localhost:3000/users/reset-password?token=${resetToken}`;
//       await transporter.sendMail({
//        from: `"Authority" <${process.env.GOOGLE_APP_EMAIL}>`,

//         to: user.email,
//         subject: "Password Reset Link",
//         html: `<p>Dear ${user.username}, here is the password reset link, please finish the process with 20 mins</p>
//         <h4>${resetPasswordLink}</h4>`, // HTML body
//       });
//       res.json({ message: "Password Reset Link Sent To Registered Email" });
//     }
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Something went wrong, please try again later" });
//   }
// });





userRoute.post("/reset-password",BlacklistCheckMiddleware,async (req, res) => {
  // token is from email and newPassword is from body
  const { token } = req.query; ///??
  const { newPassword } = req.body;

  console.log(token)
  console.log(newPassword)

  try {
    // verify the token
    let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (decoded) {

      /// token verfied sucessfully
      /// receive new password from body and update in the DB
      console.log(decoded);
      let user = await UserModel.findById(decoded.userId);
      // user.password = newPassword; // raw password is stored, but password should be hashed and stored
      // await user.save();

      bcrypt.hash(newPassword, saltRounds, async function (err, hash) {
        if (err) {
          res.status(500).json({ message: "Something went wrong" });
        } else {
          user.password = hash; // hashed password is stored
          await user.save();
          // Blacklist the token to avoid missuse
          
          await BlacklistTokenModel.create({token})
         res.json({ message: "Password Reset Sucessfull" });
        }
      });
      
     
    }
    //res.json({ message: "Password Reset Sucessfull" });
  } catch (err) {
    if (err.message == "jwt expired") {
      res.status(403).json({
        message:
          "Password reset link expied, please click forget password again",
      });
    } else {
      console.log(err)
      res
        .status(500)
        .json({ message: "Something went wrong, please try again later" });
    }
  }
});






module.exports=userRoute



