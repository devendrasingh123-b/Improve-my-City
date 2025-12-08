// models/IssueModel.js
let mongoose=require("mongoose")

const issueSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  address: String,
  image: String,
  location: {
    lat: Number,
    lng: Number,
  },
  stage: {
    type: String,
    enum: ["Pending", "In Progress", "Resolved"],
    default: "Pending",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
   handledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

let issueModel= mongoose.model("Issue", issueSchema);

module.exports=issueModel


