const express =require("express");
const profileModule = require("../models/ProfileModel");
const authMiddleware = require("../middelware/authMiddleware");

const profileRoute=express.Router()
require("dotenv").config()
const fs=require("fs")
const cloudinary = require('cloudinary').v2;
const multer  = require('multer');



// Cloudinary config

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'my-uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const upload = multer({ storage: storage })



profileRoute.post("/create",upload.single("photo"),authMiddleware(["user","admin"]),async(req,res)=>{
    
try {
    
const {name,email,age,gender,city,bio}=req.body
    let photoUrl = null;

 
    // Agar photo upload hui hai to Cloudinary par upload karo
    if (req.file) {
      // Cloudinary par upload karo
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'profiles', // Cloudinary me folder name
        resource_type: 'auto'
      });
      
      // Cloudinary se mila URL save karo
      photoUrl = result.secure_url;
      
      // Local file delete karo (optional - cleanup ke liye)
      fs.unlinkSync(req.file.path);
    }
   



const ProfileData=new profileModule({
    name,
    email,
    age,
    gender,
    city,
    bio,
    photo:photoUrl,
     loginId: req.user
})

console.log(ProfileData)
console.log("hi")
await ProfileData.save();
res.status(201).json({message:"Profile create successfully ",profile:ProfileData})


} catch (error) {
    
 console.log(error)
res.status(404).json({message:"some erro happaend "})


}
})


profileRoute.get("/:id",async (req,res)=>{

  let id=req.params.id
  // console.log(id)

  try {
    
let userdata=await  profileModule.findOne({loginId:id})
res.send(userdata) 
console.log(userdata)
console.log("yes")

  } catch (error) {

        
 console.log(error)
res.status(404).json({message:"some erro happaend "})
    
  }



})







module.exports=profileRoute

