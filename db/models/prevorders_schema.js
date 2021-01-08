const mongoose = require('mongoose');
const PrevOrdersSchema  = new mongoose.Schema({
    _id :{
        type  : Number,
        required : true
    },
    userid :{
    type  : Number,
    required : true
    },
    productname :{
        type  :String,
        required : true
    },
    productexplanation :{
        type  :String,
        required : true
    },
    productcategory :{
        type  :String,
        required : true
    },
    productcolor:{
        type  : String,
        required : true
    },
    productprice :{
        type  : Number,
        required : true
    },
    quantity :{
        type  : Number,
        required : true
    },
    orderdate :{
    type : Date,
    required : true
}

});
const PrevOrder= mongoose.model('PrevOrders',PrevOrdersSchema);

module.exports = PrevOrder;