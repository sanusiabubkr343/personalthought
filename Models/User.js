const mongoose =  require("mongoose");

const userSchema  =  new mongoose.Schema({
   _id : mongoose.Schema.Types.ObjectId,
    username: { type: String, required: true, unique: true }, 
    email: { type: String, required: true}, 
    createdAt:   { type: Date, default: Date.now },
   password: { type: String, required: true }, 
   userImageUrl :  {type :String ,required : true},
  userImageCloudId : {type :String ,required : true},
  secretkey : {type :String },
  verified: {type: Boolean, required: true,default: false} // for email verification


});

module.exports = mongoose.model('User',userSchema);
