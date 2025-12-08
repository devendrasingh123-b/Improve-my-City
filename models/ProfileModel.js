const mongoose=require("mongoose")



let profileSchema=new mongoose.Schema(

{

    name: {type:String,require:true},
    email:{type:String},
    age: Number,
    gender: String,
    city: String,
    bio: String,
    photo:{type:String},
    loginId:{type:mongoose.Schema.Types.ObjectId,ref:"User"}
    //this for over loging id 
    

}
    
)


const profileModule=mongoose.model("Profile",profileSchema)

module.exports=profileModule