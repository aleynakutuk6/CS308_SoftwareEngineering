const mongoose = require('mongoose');
const ProductSchema  = new mongoose.Schema({
    _id :{
        type  : Number,
        required : true
    } ,
    productname :{
      type  : String,
      required : true
   } ,
    explanation :{
    type  : String,
    required : true
   } ,
    price :{
    type  : Number,
    required : true
   } ,
   category :{
    type  : String,
    required : true
   } ,
   color :{
    type  : String,
    required : true
} 

});
const Product= mongoose.model('Product',ProductSchema);

module.exports = Product;