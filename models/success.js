var mongoose=require("mongoose");

var successSchema=new mongoose.Schema({
    achievement: {
        id:{
             type: mongoose.Schema.Types.ObjectId,
             ref: "Problem"
        }
    }
});

module.exports=mongoose.model("Success", successSchema);