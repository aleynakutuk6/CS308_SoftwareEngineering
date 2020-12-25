const mongoose = require('mongoose');
const CommentsSchema  = new mongoose.Schema({
    _id :{
        type  : Number,
        required : true
    } ,
    userid :{
    type  : Number,
    required : true
    } ,
    productid :{
        type  : Number,
        required : true
    },
    rate :{
        type  : Number,
        required : true
    } ,
    text :{
        type  : String,
        required : true
    } ,
    approved :{
        type  : String,
        required : true
    } ,
    commentdate :{
    type : Date,
    default : Date.now }

});
const Comment= mongoose.model('Comment',CommentsSchema);

module.exports = Comment;