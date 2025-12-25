const express=require("express")
const app=express()
let cors=require("cors")
const connectToDB = require("./configs/db")
const userRoute = require("./Routes/userRoute")
const TodoRoutes = require("./Routes/TodoRoute")
const profileRoute = require("./Routes/ProfileRute")
const issueRoute = require("./Routes/issueRoute")
const notificationRoute = require("./Routes/notificationRoute")
require('dotenv').config()

// console.log(process.env.CLIENT_URL)

let port=process.env.PORT||3000
// console.log(process.env.PORT)

// console.log(process.env.MONGO_URI)
app.use(cors())

app.use(express.json())
connectToDB()


app.use("/users",userRoute)
app.use("/todo",TodoRoutes)
app.use("/profile",profileRoute)
app.use("/issue",issueRoute)
app.use("/notifications",notificationRoute)

app.get("/test",(req,res)=>{
    res.send("This is test rout")
})

app.use((req,res)=>{
    res.send("this rout nout  b found ")
})



app.listen(port,()=>{
    console.log("sever is live on 3000")
})