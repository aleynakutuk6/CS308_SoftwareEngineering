const express = require('express')
const app = express()
const port = 3000
const UserObj = require("./user_schema");
const ProductObj = require("./product_schema");
const ProductOrderObj = require("./productorder_schema");
const OrderObj = require("./orders_schema");
const MongoClient = require('mongodb').MongoClient;
var urlToDB = "mongodb://localhost:27017";
const mongoClient = new MongoClient(urlToDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoClient.connect();
var bodyParser = require("body-parser")
var db = mongoClient.db("ECommerce");
var User = db.collection("Users");
var Product = db.collection("Products");
var ProductOrder = db.collection("Products_Orders");
var Order = db.collection("Orders");
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))

//Register post handle
app.post('/createUser',(req,res)=>{
  const {username,email, password} = req.body;
  if(!username || !email || !password ) {
    res.send({msg : "Please fill in all fields"})
  }
  //check if password is more than 6 characters
  else if(password.length < 6 ) {
     res.send({msg : 'password atleast 6 characters'})
  }
  else{
      //validation passed
     User.findOne({email : email},(err,cursor)=>{
         
       if(cursor != null) {
         res.send({msg: 'email already registered'}); 
          
       } else {          
    
        const newUser = new UserObj({
         username : username,
         email : email,
         password : password
        });

         User.insertOne(newUser);
        res.send("User created");
        }
      })
    }
})

app.post('/addProduct', (req, res) => {
    const {userid,productid,quantity} = req.body;
    const newOrder = new OrderObj({
        userid : userid,
        orderid: "33"
       });
    Order.insertOne(newOrder);
    Order.findOne({userid : userid},(err,cursor)=>{
        if(cursor != null) {
            var orderid = cursor.orderid;
            const newProOrder = new ProductOrderObj({
                orderid: orderid,
                productid : productid,
                quantity: quantity
               });
               ProductOrder.insertOne(newProOrder);
               res.send("Product added to your basket");

        }else { res.send("Cannot add product");}
    })

  })


app.post('/deleteProduct', (req, res) => {
    const {userid,productid,quantity} = req.body;
    Order.findOne({userid : userid},(err,ord)=>{
        if(ord != null) {
        var orderid = ord.orderid;
        ProductOrder.findOne({orderid : orderid, productid: productid},(err,cursor)=>{
            if(cursor != null) {
                var quant = cursor.quantity;
                if (quant > 1){
                    ProductOrder.updateOne({
                        "orderid": orderid, "productid": productid
                    }, {
                        $set: {
                            "quantity": "7"
                        }
                    });
                    res.send("Quantity decreased");
                }
                else{
                    ProductOrder.deleteOne(
                        {
                            "orderid": orderid,
                            "productid": productid
                        }
                
                    );
                    // Başka productidli order varsa bunu silme yoksa sil 
                    // Order.deleteOne(
                    //     {
                    //         "orderid": orderid
                    //     }
                
                    // );
                    res.send("Order deleted");
                }
    
            }else { res.send("Order cannot find");}
        })

        }
        else {
            res.send("Order cannot find");
        }
    })
})


//Listen handle
app.listen(port, function () { 
    console.log("Server Has Started!"); 
}); 