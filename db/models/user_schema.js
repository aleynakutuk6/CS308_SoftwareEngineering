const { Int32 } = require('mongodb');
const mongoose = require('mongoose');
const UserSchema  = new mongoose.Schema({
  _id :{
        type  : Number,
        required : true
  } ,
  username :{
      type  : String,
      required : true
  } ,
  email :{
    type  : String,
    required : true
} ,
  userrole :{
    type  : String,
    default : "Customer"
} ,
 randomcode:{
    type  : Number,
    required : true
 },
  userenteredcode :{
    type  : Number,
    required : true,
    default : 0
} ,
  gender :{
    type  : String,
    required : true
} ,
  password :{
    type  : String,
    required : true
} 

});
const User= mongoose.model('User',UserSchema);

module.exports = User;