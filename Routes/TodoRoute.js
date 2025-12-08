let express=require("express");
const TodoModel = require("../models/TodoModel");
const authMiddleware = require("../middelware/authMiddleware");

let TodoRoutes=express.Router()


TodoRoutes.post("/",authMiddleware(["user"]),async(req,res)=>{


    try{

let todo=await TodoModel.create({...req.body ,userId:req.user})
res.status(200).json({"msg":"your msg is done",todo})

    }catch(error){

console.log(error)
res.status(501).json({"msg":"something went wrong"})

    }
    
   
})



TodoRoutes.get("/get",authMiddleware(["user","admin"]),async (req,res)=>{
    
    try {
                console.log("hiji ")
        
        
        let todos=await TodoModel.find({userId:req.user})
        res.json({"msg":"this is the all data",todos})


    } catch (error) {
        
        console.log(error)
        res.json("something went wrong")

    }

})





module.exports=TodoRoutes