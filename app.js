const express = require('express')
const app = express();
const port = 3000
var async = require('async');
const UserObj = require("./db/models/user_schema");
const ProductObj = require("./db/models/product_schema");
const CommentObj = require("./db/models/comments_schema");
const OrderObj = require("./db/models/orders_schema");
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
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))



// bu kodlar sadece bir kez runlanmalı
//db.collection("Comment").insertOne({_id : "comment_id", seq_val: 0})
//db.collection("Users").insertOne({_id : "user_id", seq_val: 0})
//db.collection("Orders").insertOne({_id : "order_id", seq_val: 0})
//db.collection("Products").insertOne({_id : "product_id", seq_val: 0})

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

            const newUser = new UserObj({
                _id:  result,
                username : username,
                email : email,
                password : password,
                userrole: "Customer",
                gender: gender
                });
                User.insertOne(newUser);
                res.status(200).send({msg: 'User created'});
             
          });
        }
      })
    }
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
        res.status(404).send({msg:"error"});
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

  //{name: "NIKE BAG", price: "20", rate: 4, exp: "amazing bag",type:"Clothing", comments:["nice bag", "hate it"],   id:"1"}, 


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

//login post handler
app.post('/login', (req, res)=> {
  User.findOne({_id: req.body.email},function(err,user){

    if(!user){
      res.status(404).send({msg:"User does not exist"});
    }
    else{
      User.findOne({password: req.body.password, username: req.body.username},function(err,pass){
        if(!pass){
          res.status(404).send({msg:"Wrong password/username"});
        }
        else{
          res.status(200).send({msg:"Welcome"});
        }

      });
    }

  });

}); 


//update-name post handler
app.post('/updateUsername', (req, res) => {

  User.updateOne({_id: req.body.userid},{$set: {username: req.body.username} }, function(error,user){
    if(error){
      res.status(404).send({msg:"error"});
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