const mongoose = require('mongoose');
const ProductOrderSchema  = new mongoose.Schema({

   orderid :{
    type  : String,
    required : true
} ,
    productid :{
    type  : String,
    required : true
},
    quantity :{
    type  : String,
    required : true}

});
const ProductOrder= mongoose.model('ProductOrder',ProductOrderSchema);

module.exports = ProductOrder;