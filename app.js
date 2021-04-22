const express = require('express')
const app = express();
const port = 3000
var async = require('async');
const UserObj = require("./db/models/user_schema");
const ProductObj = require("./db/models/product_schema");
const CommentObj = require("./db/models/comments_schema");
const OrderObj = require("./db/models/orders_schema");
const PrevOrderObj = require("./db/models/prevorders_schema");
const InvoiceObj = require("./db/models/invoices_schema");
const MongoClient = require('mongodb').MongoClient;
var urlToDB = "mongodb://localhost:27017";
const mongoClient = new MongoClient(urlToDB, { useNewUrlParser: true, useUnifiedTopology: true });
const bodyParser = require("body-parser")
mongoClient.connect();
const db = mongoClient.db("ECommerce");
const User = db.collection("Users");
const Product = db.collection("Products");
const Comment = db.collection("Comment");
const Order = db.collection("Orders");
const PrevOrder = db.collection("PrevOrders");
const Invoice = db.collection("Invoices");
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))
var nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { randomInt } = require('crypto');

// bu kodlar sadece bir kez runlanmalı
//db.collection("Comment").insertOne({_id : "comment_id", seq_val: 0})
//db.collection("Users").insertOne({_id : "user_id", seq_val: 0})
//db.collection("Orders").insertOne({_id : "order_id", seq_val: 0})
//db.collection("Products").insertOne({_id : "product_id", seq_val: 0})
//db.collection("PrevOrders").insertOne({_id : "prevorder_id", seq_val: 0})
//db.collection("Invoices").insertOne({_id : "invoices_id", seq_val: 0})

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aleynakutuk10@gmail.com',
    pass: '13579aleyna'
  }
});
  
app.post('/createPdf', (req, res) => {
  const {userid,email} = req.body;
  var pdfDoc = new PDFDocument;
  
  Order.find({userid: userid}).toArray(function(err, orders) {
  if (err){
      console.log(err);
      return res.status(404).send({msg: 'cannot find any order'});
  } else {
    var itemsProcessed = 0;
    async.forEach(orders, function(ord) {
          Product.findOne({_id: ord.productid}, function(err, prod) {
            if (err) throw err;
            else{
              pdfDoc.pipe(fs.createWriteStream('User_Bill.pdf'));
              pdfDoc.text("Your bill is as follows, please pay it :)", { align: 'center'})
              pdfDoc.text("Productname:", 120,160)
              pdfDoc.text("Price:", 340,160)
              pdfDoc.text(prod.productname, 120,180)
              pdfDoc.text(ord.quantity + "x" + prod.price + "=" + ord.quantity*prod.price , 340,180)
              
              console.log("Pdf created")

              itemsProcessed++;
              if(itemsProcessed === orders.length) {
                callback();
              }    
            }
          });          
        });

        function callback () { 
          console.log('Pdf will be sent');
          pdfDoc.end();

          var mailOptionsPdf = {
            from: 'aleynakutuk10@gmail.com',
            to: email,
            subject: 'Sending Email using Node.js',
            text: 'Your bill is attached below, please check!',
            attachments: [{
              filename: 'User_Bill.pdf',
              path: 'C:/Users/aleyn/CS308_ECommerce/User_Bill.pdf'
            }]
          };

          transporter.sendMail(mailOptionsPdf, function(error, info){
            if (error) {
              console.log(error);
              res.status(404).send({msg: 'Failure'});
            } else {
              console.log('Email sent: ' + info.response);
              res.status(200).send({msg: 'Email is sent'});
            }
          });
                   
         }
          
    }
  });
})

  // increase seq val
function getSequenceNextValue(dbname, seqName, callback) {
        dbname.findOneAndUpdate(
        { 
          _id: seqName
        },
        { $inc: { seq_val: 1 } }, // update operation
        { 
          new: true,
          upsert: true
        });

        dbname.findOne({_id : seqName},(err,cursor)=>{
            if(err)
            {   
                 return callback(new Error("An error has occurred"));
            }
            return callback(cursor.seq_val);
        })
    }

    // decrease seq val 
function decreaseSeqVal(dbname, seqName, amount) {
  dbname.findOneAndUpdate(
  { 
    _id: seqName
  },
  { $inc: { seq_val: -amount } }, // update operation
  { 
    new: true,
    upsert: true
  });
}

//Register post handle
app.post('/createUser',(req,res)=>{
  const {username,email, password, gender} = req.body;
  if(!username || !email || !password || !gender ) {
    res.status(404).send({msg : "Please fill in all fields"})
  }
  //check if password is more than 6 characters
  else if(password.length < 6 ) {
    
    res.status(404).send({msg : 'password atleast 6 characters'})
  }
  else{
      //validation passed
     User.findOne({email : email},(err,cursor)=>{
         
       if(cursor != null) {
        res.status(404).send({msg: 'email already registered'}); 
          
       } else {          
        
        getSequenceNextValue(User, "user_id", function(result) {
               // random sayı üret
               code = getRandomInt(1000, 5000);
               console.log(code)
            const newUser = new UserObj({
                 //random sayıyı tut
                 randomcode: code,
                 //userenteredcode: true , default is false
                _id:  result,
                username : username,
                email : email,
                password : password,
                //userrole: "SalesManager",
                gender: gender
                });

                var mailOptions = {
                from: 'aleynakutuk10@gmail.com',
                to: email,
                subject: 'Sending Email using Node.js',
                text: 'Please enter the code: ' + code
                };

                transporter.sendMail(mailOptions, function(error, info){
                  if (error) {
                   console.log(error);
                   res.status(404).send({msg: 'Failure'});
                   } else {
                   console.log('Email sent: ' + info.response);
                   res.status(200).send({msg: 'Email is sent'});
                 }
                  });


                  // code u mail at 
                User.insertOne(newUser);
                res.status(200).send({msg: 'User created'});
             
          });
        }
      })
    }
})

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

app.post('/enterCode', (req, res) => {

  User.findOne({email: req.body.email}, function(err,usr) {
    if (err) res.status(404).send({msg:"User cannot found"});
    else{

      if(usr.randomcode !=  req.body.code){
        res.status(404).send({msg:"Code entered wrong"});
      }
      else {
      User.updateOne({email: req.body.email, randomcode: req.body.code },
        {$set: {  userenteredcode: 1} }, function(error){
        if(error){
          res.status(404).send({msg:"User could not activated"});
        }
        else{
          res.status(200).send({msg:"User activated"});
        }
      });
      }
      }
    });
   // user table ında maile ait kullanıcıyı bul 
   // codeları karsılastır aynıysa userentered code true yap 
   // response olarak user activated

});


//handle mailing 
app.post('/sendMail', (req, res) => {
  const {email} = req.body;

var mailOptions = {
  from: 'aleynakutuk10@gmail.com',
  to: email,
  subject: 'Sending Email using Node.js',
  text: 'Hey, I am Aleyna'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
    res.status(404).send({msg: 'Failure'});
  } else {
    console.log('Email sent: ' + info.response);
    res.status(200).send({msg: 'Email is sent'});
  }
});
})

// create product database
app.post('/addProduct', (req, res) => {
    const {productname,color,category,explanation,price} = req.body;
    getSequenceNextValue(Product, "product_id", function(result) {

        const newProduct = new ProductObj({
            productname : productname,
            color: color,
            category: category,
            explanation: explanation,
            price: price,
            _id: result
           });
            Product.insertOne(newProduct);
            res.status(200).send({msg: 'Product added'});
         
      });
  })
// delete product from database
app.post('/deleteProduct', (req, res) => {
    
    Product.deleteOne({_id: req.body.productid}, function(err, obj) {
        if (err) throw err;

          Product.findOneAndUpdate(
          { 
            _id: "product_id"
          },
          { $inc: { seq_val: -1 } }, // update operation
          { 
            new: true,
            upsert: true
          });
  
          res.status(200).send({msg: 'Product deleted'});
      });

})

  // add comment for specific product
  app.post('/addComment', (req, res) => {
    const {userid,productid, rate,text} = req.body;
    getSequenceNextValue(Comment, "comment_id", function(result) {

        const newComment = new CommentObj({
            userid : userid,
            productid: productid,
            rate: rate,
            text: text,
            approved: "No",
            _id: result
           });
            Comment.insertOne(newComment);
            res.status(200).send({msg: 'Comment added'});
         
      });
  })
  
  // takes productid and send comment with "Yes" status
  app.post("/getApprovedComments", (req, res) => {
    const {productid} = req.body;
    Comment.find({productid: productid, approved: "Yes"}).toArray(function(err, result) {
      if (err) throw err;
      res.status(200).send(result);
    });
    
  });

  // sends all comments
  app.post("/getAllComments", (req, res) => {
    const {productid} = req.body;
    Comment.find({productid: productid}).toArray(function(err, result) {
      if (err) throw err;
      res.status(200).send(result);
    });
    
  });
  // change comment approve status
  app.post('/changeCommentStatus', (req, res) => {
    Comment.updateOne({_id: req.body.commentid},
      {$set: {approved: req.body.approved} }, function(error){
      if(error){
        res.status(404).send({msg:"Comment status cannot be changed"});
      }
      else{
        res.status(200).send({msg:"Comment approve status has been changed succesfully"});
      }
    });
  })

  // deletes comment specified
  app.post('/deleteComment', (req, res) => {
    const {commentid} = req.body;
    
    Comment.deleteOne({_id: commentid}, function(err, obj) {
      if (err) throw err;

      Comment.findOneAndUpdate(
        { 
          _id: "comment_id"
        },
        { $inc: { seq_val: -1 } }, // update operation
        { 
          new: true,
          upsert: true
        });

        res.status(200).send({msg: 'Comment deleted'});
      });

  })


  // add product which is ordered by the user
app.post('/addProductToBasket', (req, res) => {
    const {userid,productid,quantity} = req.body;
    Order.findOne(
      { 
        userid :userid,
        productid: productid
     }, function(error,ord){
       if(!ord){
        getSequenceNextValue(Order, "order_id", function(result) {
          var temp = result;
          const newOrder = new OrderObj({
              userid : userid,
              _id: result,
              productid: productid,
              quantity: quantity
             });
              Order.insertOne(newOrder);
              res.status(200).send({msg: 'Product added to your basket'});
            });

          }else{
            Order.findOneAndUpdate(
              { 
                 userid :userid,
                 productid: productid
              },
              { $inc: {quantity: quantity}}, function(error,ord){
                if(error) res.status(404).send({msg:"Order cannot find"});
              });
             res.status(200).send({msg: 'Product added to your basket'});
          }
      });
  })


// decreases product order from the basket quantity
app.post('/deleteProductfromBasket', (req, res) => {
    const {userid,productid,amount} = req.body;
   
    Order.findOneAndUpdate(
    { 
       userid :userid,
       productid: productid
    },
    { $inc: {quantity: -amount} }, function(error,ord){
      if(error){
        res.status(404).send({msg:"Order cannot find"});
      }
      else{
        Order.deleteMany( { quantity: { $lt: 1 } })
        decreaseSeqVal(Order, "order_id",1)
        res.status(200).send({msg: 'Quantity decreased'});
      }
    });
  
})


// filter by category
app.post('/filterProduct', (req, res) => {
  const {category} = req.body;
  Product.find({category: category}).toArray(function(err, result) {
    if (err) throw err;
    res.status(200).send(result);
  });
})

// returns all products in database
app.post("/getProducts", (req, res) => {
  Product.find().toArray(function(err, result) {
    if (err) throw err;
    res.status(200).send(result);
  });
  
});

// delete all basket
app.post('/deleteBasket', (req, res) => {
  const {userid} = req.body;
  getSequenceNextValue(Order, "order_id", function(result) { 
    decreaseSeqVal(Order, "order_id", result)
  });
  Order.deleteMany( { userid: userid })
  
  res.status(200).send({msg: 'Basket has been emptyed'});

})

app.post("/createInvoice", (req, res) => {
  const {userid,address} = req.body;
  var Totalcost=0;
  var prodid=0;
  Order.find({userid: userid}).toArray(function(err, orders) {
  if (err){
      console.log(err);
      return res.status(404).send({ message: 'Failure' });
  } else {
    var itemsProcessed = 0;
    async.forEach(orders, function(ord) {
          Product.findOne({_id: ord.productid}, function(err, prod) {
            if (err) throw err;
            else{
              prodid=prod._id;
              Totalcost += prod.price* ord.quantity;
              console.log(Totalcost)
              itemsProcessed++;
              if(itemsProcessed === orders.length) {
                callback();
              }    
              
            }
          });
        });

        function callback () { 
          console.log('all done');
          getSequenceNextValue(Invoice, "invoices_id", function(result) {
            const newInvoice = new  InvoiceObj({
                userid : userid,
                _id: result,
                 address: address,
                 productid: prodid,
                 totalcost: Totalcost
               });
                Invoice.insertOne(newInvoice);
                console.log('Invoice added');
                console.log(newInvoice)
              });

          return res.status(200).send(Totalcost.toString());
         }
    }
  });
});



// sends user's current basket/all orders
app.post("/sendBasket", (req, res) => {
  const {userid} = req.body;
  var resData = { 
    orderlist: []
  };

  Order.find({userid: userid}).toArray(function(err, orders) {
  if (err){
      console.log(err);
      return res.status(404).send({ message: 'Failure' });
  } else {
    var itemsProcessed = 0;
    async.forEach(orders, function(ord) {
          Product.findOne({_id: ord.productid}, function(err, prod) {
            if (err) throw err;
            else{
              var obj ={
                quantity: ord.quantity,
                _id: prod._id,
                productname: prod.productname,
                color: prod.color,
                category: prod.category,
                explanation: prod.explanation,
                price: prod.price
              }
              resData.orderlist.push(obj)
              console.log(obj)
              itemsProcessed++;
              if(itemsProcessed === orders.length) {
                callback();
              }    
              
            }
          });
         
        });

        function callback () { 
          console.log('all done');
          console.log(JSON.stringify(resData));
          return res.status(200).send(resData)
         }
          
      
    }
  });
});


// save prevorders
app.post("/savePrevOrders", (req, res) => {
  const {userid} = req.body;
  
  Order.find({userid: userid}).toArray(function(err, orders) {
  if (err){
      console.log(err);
      return res.status(404).send({ message: 'Failure' });
  } else {
    var itemsProcessed = 0;
    async.forEach(orders, function(ord) {
          Product.findOne({_id: ord.productid}, function(err, prod) {
            if (err) throw err;
            else{

              getSequenceNextValue(PrevOrder, "prevorder_id", function(result) {
                const newPrevOrder = new PrevOrderObj({
                    userid : userid,
                    _id: result,
                    quantity: ord.quantity,
                    productname: prod.productname,
                    productexplanation: prod.explanation,
                    productcolor: prod.color,
                    productcategory: prod.category,
                    price: prod.price,
                    orderdate: prod.orderdate
                   });
                    PrevOrder.insertOne(newPrevOrder);
                    console.log('Prev order added');
                    console.log(newPrevOrder)
                  });

              
              itemsProcessed++;
              if(itemsProcessed === orders.length) {
                callback();
              }    
              
            }
          });
         
          
        });

        function callback () { 
          console.log('all done');
          return res.status(200).send({msg: 'Previous orders are saved'})
         }
          
      
    }
  });
});

//login post handler
app.post('/login', (req, res)=> {
  User.findOne({email: req.body.email},function(err,user){

    // code entered trueysa girsin
    if(!user){
      res.status(404).send({msg:"User does not exist"});
    }
    else{

        if(user.password !=  req.body.password || user.username != req.body.username){
          res.status(404).send({msg:"Wrong password/username"});
        }
        else if(user.userenteredcode == 0){
          res.status(404).send({msg:"Please first enter the code which sent to your gmail account"});
        }
        else{
          res.status(200).send({msg:"Welcome " + user.username});
        }

    }

  });

}); 


//update-name post handler
app.post('/updateUsername', (req, res) => {

  User.updateOne({_id: req.body.userid},{$set: {username: req.body.username} }, function(error,user){
    if(!user){
      res.status(404).send({msg:"Username cannot found"});
    }
    else{
      res.status(200).send({msg:"Username has changed succesfully"});
    }
  });
});


//update-password post handler
app.post('/updatePassword', (req, res) => {

    if(req.body.password.length < 6 ){
      res.status(404).send({msg: "password atleast 6 characters"});
    }
    else{
      User.updateOne({_id: req.body.userid},{$set: {password: req.body.password} }, function(error,user){
        if(error){
          res.status(404).send({msg: "error"});
        }
        else{
          res.status(200).send({msg: "Password has changed succesfully"});
        }
      });
    }
});


//Listen handle
module.exports = app.listen(port, function () { 
     console.log("Server Has Started!"); 
 }); 