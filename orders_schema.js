const mongoose = require('mongoose');
const OrdersSchema  = new mongoose.Schema({

   userid :{
    type  : String,
    required : true
} ,
    orderid :{
    type  : String,
    required : true
} ,
    orderdate :{
    type : Date,
    default : Date.now
}

});
const Order= mongoose.model('Order',OrdersSchema);

module.exports = Order;