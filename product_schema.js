const mongoose = require('mongoose');
const ProductSchema  = new mongoose.Schema({
  productname :{
      type  : String,
      required : true
  } ,
   color :{
    type  : String,
    required : true
} ,
   comment :{
    type  : String,
    required : true
} 

});
const Product= mongoose.model('Product',ProductSchema);

module.exports = Product;