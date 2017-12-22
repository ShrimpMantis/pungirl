var mongoose= require("mongoose");
var Schema= mongoose.Schema;
var JokeSchema= new Schema({
    title: {type: String},
    content: {type: String},
	degreeOfFunnyness:{type:Number},
	jokeId:{type:Number},
	recipientId:{type:Number}
});

module.exports=mongoose.model("JokeModel",JokeSchema);