var mongoose=require("mongoose");

var problemSchema=new mongoose.Schema({
    name: String,
    content: String,
    upvotes: Number,
    type: String,
    status: {type: String, default: "ongoing"},
    locality: String,
    area: String,
    geolocation: String,
    ward: String,
    image: String,
    issuer: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
        }
     ]
    // Add genre as array
});

module.exports=mongoose.model("Problem", problemSchema);