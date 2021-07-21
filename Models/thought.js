const mongoose = require('mongoose');

const thoughtSchema = new mongoose.Schema({
    _id :  mongoose.Schema.Types.ObjectId,
    title:  { type: String, required: true}, 
    user :{type:mongoose.Schema.Types.ObjectId,required : true, ref: 'User'},
   about:  { type: String, required: true }, 
   createdAt:   { type: Date, default: Date.now },
   thoughtImageUrl :  {type :String ,required : true},
   thoughtImageCloudId : {type :String ,required : true}


});


module.exports = mongoose.model('Thought',thoughtSchema);

