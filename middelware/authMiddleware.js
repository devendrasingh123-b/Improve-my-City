let express=require("express");
var jwt = require('jsonwebtoken');



const authMiddleware=(role)=>{

  /// role means array of allowed roles in particular routes
return (req,res,next)=>{

  try {
    
  let token = req.headers?.authorization?.split(" ")[1]
    // console.log(token)
 
    if(token){
        var decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log(decoded) 
        
        if(decoded){
            if(role.includes(decoded.role)){
                // console.log("hiji ")
                req.user=decoded.userId
                  next();

            }else{
                res.json({"message":"you are not user"})
            }
        }else{
          res.status(403).json({ message: "Login Failed, Please Login Again" });
                   
        }

    }else{
          res.status(400).json({ message: "Token Not Found, Please Login Again" });
    }



  } catch (error) {
    
console.log(error)
console.log("somthing went wrong in middleware")

  }
    


}


}





module.exports=authMiddleware 