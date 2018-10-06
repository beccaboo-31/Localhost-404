var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");

var userSchema=new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    ward: {type: String, default: "User"}
});

userSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model("User", userSchema);