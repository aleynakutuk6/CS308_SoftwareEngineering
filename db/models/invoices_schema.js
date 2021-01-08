const mongoose = require('mongoose');
const InvoicesSchema  = new mongoose.Schema({
    _id :{
        type  : Number,
        required : true
    }, 
    userid :{
        type  : Number,
        required : true
    },
    address :{
    type  : String,
    required : true
    },
    orderstatus :{
        type  : String,
        default : "not ready sorry"
    },
    totalcost :{
        type  : Number,
        required : true
    }


});
const Invoice= mongoose.model('Invoices',InvoicesSchema);

module.exports = Invoice;