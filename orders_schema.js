const mongoose = require('mongoose');
const OrdersSchema  = new mongoose.Schema({
    _id :{
        type  : Number,
        required : true
    },
   userid :{
    type  : Number,
    required : true
    },
    productid :{
        type  : Number,
        required : true
    },
    quantity :{
        type  : Number,
        required : true
    },
    orderdate :{
    type : Date,
    default : Date.now
}

});
const Order= mongoose.model('Order',OrdersSchema);

module.exports = Order;