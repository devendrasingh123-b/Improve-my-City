const express = require("express");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const authMiddleware = require("../middelware/authMiddleware");
const issueModel = require("../models/issueModel");
require("dotenv").config();
const nodemailer = require("nodemailer");
const profileModule = require("../models/ProfileModel");
const NotificationModel = require("../models/notificationModel");



notifi
const issueRoute = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "my-uploads/"),
  filename: (req, file, cb) =>
    cb(null, file.fieldname + "-" + Date.now() + "-" + Math.round(Math.random() * 1e9)),
});
const upload = multer({ storage });

// ✅ Create new issue
issueRoute.post("/issues", authMiddleware(["user"]), upload.single("image"), async (req, res) => {
  try {

    const { title, description, category, address, location } = req.body;
    let photoUrl = null;
    
    console.log(req.body)
    if (!title || !description || !category || !location) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // ✅ Safe location parsing
    let parsedLocation;
    try {
      parsedLocation = typeof location === "string" ? JSON.parse(location) : location;
    } catch {
      return res.status(400).json({ success: false, message: "Invalid location format" });
    }

    // ✅ Upload image if present
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "issues",
        resource_type: "auto",
      });
      photoUrl = result.secure_url;
      fs.unlinkSync(req.file.path); // cleanup
    }

    const newIssue = new issueModel({
      title,
      description,
      category,
      address,
      location: parsedLocation,
      image: photoUrl,
      user: req.user,
    });

    console.log(newIssue)
    await newIssue.save();

    res.status(201).json({
      success: true,
      message: "Issue created successfully!",
      issue: newIssue,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Test route
issueRoute.get("/", async (req, res) => {
  try {
    const issuedata = await issueModel.find({});
    res.status(200).json(issuedata);
  } catch (error) {
    console.error("Error fetching issues:", error);
    res.status(500).json({ message: "Error fetching issues" });
  }
});



// `http://localhost:3000/issue/${issue._id}`,




//// Sending emails
/// Test Route
// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", /// Simple Mail Transport Protocol
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    /// We cannot directly use Google email and password
    /// Google has security policy
    /// Create An App in Google Account, use that app's password
    user: process.env.GOOGLE_APP_EMAIL,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});





// predifine html box

// use this in your route where you have `populated` (issue), `populated.user` (user), and `populated.handledBy` (admin)
// Example usage below after the template

const issueUpdateHtml = ({ user, issue, admin, frontendUrl, time }) => `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Issue Update</title>
  <style>
    /* Basic inline-safe styles */
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial; margin:0; padding:0; background:#f4f6fb; color:#0b1220; }
    .wrap { max-width:680px; margin:22px auto; background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 6px 22px rgba(6,10,20,0.08); }
    .header { background: linear-gradient(90deg,#2563eb,#4f46e5); color:#fff; padding:18px 22px; }
    .header h1 { margin:0; font-size:20px; }
    .body { padding:20px; }
    .row { display:flex; gap:12px; align-items:center; }
    .avatar { width:72px; height:72px; border-radius:10px; object-fit:cover; border:2px solid #eef2ff; }
    .small { font-size:13px; color:#475569; }
    .issue-card { margin-top:14px; padding:14px; background:#f8fafc; border-radius:8px; border:1px solid #eef2f7; }
    .title { font-weight:700; font-size:18px; margin:0 0 6px 0; }
    .meta { font-size:13px; color:#334155; margin-bottom:8px; }
    .btn { display:inline-block; padding:10px 14px; border-radius:8px; text-decoration:none; color:#fff; font-weight:700; margin-right:8px; }
    .btn-primary { background:#2563eb; }
    .btn-accent { background:#10b981; }
    .footer { padding:16px 20px; font-size:13px; color:#64748b; background:#fbfdff; border-top:1px solid #eef2f7; }
    .muted { color:#94a3b8; font-size:12px; }
    @media (max-width:520px) {
      .row { flex-direction:column; align-items:flex-start; }
      .avatar { width:64px; height:64px; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>Your issue status was updated</h1>
    </div>

    <div class="body">
      <div class="row">
        <div style="flex:1">
          <p class="small">Hi <strong>${user?.name || "User"}</strong>,</p>
          <p class="muted">This is to inform you that the issue you reported has a new update.</p>
        </div>

     
      </div>

      <div class="issue-card">
        <p class="title">${issue?.title || "Untitled issue"}</p>
        <p class="meta"><strong>New status:</strong> ${issue?.stage || issue?.status || "Pending"} &nbsp; • &nbsp; <strong>Updated by:</strong> ${admin?.name || admin?.email || "Admin"} &nbsp; • &nbsp; <span class="small">${time}</span></p>

        ${issue?.image ? `<div style="margin:8px 0"><img src="${issue.image}" alt="issue-image" style="max-width:100%; border-radius:8px; border:1px solid #eef2f7;"></div>` : ""}

        <p style="margin:10px 0; color:#334155;">${issue?.description ? issue.description.replace(/\n/g,"<br>") : "No description provided."}</p>

      
      </div>

      <div style="margin-top:16px; font-size:13px; color:#475569;">
        <p><strong>Admin contact:</strong> ${admin?.name || ""} ${admin?.email ? `• ${admin.email}` : ""}</p>
        <p class="muted">If you need help, reply to this email or visit our support page.</p>
      </div>
    </div>

    <div class="footer">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-weight:700">MyCity Support</div>
          <div class="muted">Sent on ${time}</div>
        </div>
        <div class="muted">If you didn't expect this email, please ignore it.</div>
      </div>
    </div>
  </div>
</body>
</html>
`;






// ✅ Update issue status (Admin only)
issueRoute.put("/issues/:id", authMiddleware(["admin"]), async (req, res) => {

  // console.log("hello ")
  try {
    const { id } = req.params;
    const { status } = req.body; // e.g., "Resolved"
    console.log(status)
    console.log(id)

    const issue = await issueModel.findById(id).populate("user").populate("handledBy");
    // let   profileId=await profileModule.find({loginId:req.user})
    let profileId = await profileModule.findOne({ loginId: req.user });

    //  console.log(req.user+""+profileId)

//notiftion create
await NotificationModel.create({
  userId: issue.user._id,   // ✅ issue owner
  title: "Issue Status Updated",
  message: `Your issue "${issue.title}" is now ${status}`,
  stage: status||"Resolved",
});

    if (!issue) {
      return res.status(404).json({ success: false, message: "Issue not found" });
    }

    // ✅ Update status and handledBy
    issue.stage = status || "Resolved";
    issue.handledBy = req.user; // admin id from token

console.log(issue)

    await issue.save();

//  const info = await transporter.sendMail({
//     from: '"${}" <venugopal@gmail.com>',
//     to: issue.user.email,
//     subject: "This is test email sent",
//     // text: "This is text body", // plain‑text body
//     html: "<b>This is HTML body</b>", // HTML body
//   });



// for gmail 

// after you saved issue and have 'populated' (populated = await issueModel.findById(...).populate(...))
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const time = new Date().toLocaleString("en-IN");

const htmlBody = issueUpdateHtml({
  user: issue.user.username|| {},
  issue: status,
  admin: profileId || { _id: req.user, name: req.user.name || "", email: req.user.email || "" },
  frontendUrl,
  time,
});

// send mail
await transporter.sendMail({
  from: `"${profileId.name || "Support"}" <${process.env.GOOGLE_APP_EMAIL}>`,
  to: (issue.user.username && issue.user.email) || "fallback@example.com",
  subject: `Update on your issue: ${issue.title}`,
  html: htmlBody,
});









    res.status(200).json({
      success: true,
      message: "Issue updated successfully!",
      issue,
    });
  } catch (error) {
    console.error("Error updating issue:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});




module.exports = issueRoute;










// const express =require("express");
// require("dotenv").config()
// const fs=require("fs")
// const cloudinary = require('cloudinary').v2;
// const multer  = require('multer');
// const authMiddleware = require("../middelware/authMiddleware");
// const  issueModel = require("../models/issueModel");
// const issueRoute=express.Router()





// // Cloudinary config

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });



// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'my-uploads/')
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//     cb(null, file.fieldname + '-' + uniqueSuffix)
//   }
// })

// const upload = multer({ storage: storage })



// // ✅ Create new issue
// issueRoute.post("/issues", authMiddleware(["user"]), upload.single("image"), async (req, res) => {
//   try {
//     const { title, description, category, address, location } = req.body;
//      let photoUrl = null;

//     if (!title || !description || !category || !location) {
//       return res.status(400).json({ success: false, message: "Missing required fields" });
//     }


//      // 🔹 Parse location (frontend se string me aata hai)
//     const parsedLocation = JSON.parse(location);

// if (req.file) {
//       // Cloudinary par upload karo
//       const result = await cloudinary.uploader.upload(req.file.path, {
//         folder: 'profiles', // Cloudinary me folder name
//         resource_type: 'auto'
//       });
      
//       // Cloudinary se mila URL save karo
//       photoUrl = result.secure_url;
    
//     // ✅ Create issue with user._id from middleware
//     const newIssue = new Issue({
//       title,
//       description,
//       category,
//       address,
//       location: parsedLocation,
//       image: photoUrl,
//       user: req.user, // 🟢 user id from token
//       stage: "Pending",   // Default stage
//       createdAt: new Date(),
//     });

//     await newIssue.save();

//     res.status(201).json({
//       success: true,
//       message: "Issue created successfully!",
//       issue: newIssue,
//     });
//   } }catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// });



// issueRoute.get("/",(req,res)=>{
//     console.log("hello")
// })



// module.exports =issueRoute