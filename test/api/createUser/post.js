process.env.NODE_ENV = 'test';

const chai = require('chai');
const expect = chai.expect;
const should = chai.should;
const request = require('supertest');
const app = require('../../../app.js');


describe('POST /createUser', () => {
  
  
  it('OK, creating a new user works', (done) => {
    request(app).post('/createUser')
      .send( {username: "aleyna",email: "edu", password: "123456", gender: "female"})
      .then((res) => {
        const body = res.body;
        expect(body).to.contain.property('msg');
        expect(res.status).to.equal(200);
        done();
      })
      .catch((err) => done(err));
  });

    it('Fail, it requires email', (done) => {
       request(app).post('/createUser')
        .send({ username: "aleyna" })
        .then((res) => {
         const body = res.body;
         expect(body).to.contain.property('msg').and.is.equal('Please fill in all fields');
         expect(res.status).to.equal(404);
         //expect({ username: "aleyna" }).to.have.all.keys('username', 'email', 'password', 'gender');
          done();
        })
        .catch((err) => done(err));
    });

    it('Fail, password requires atleast 6 characters', (done) => {
      request(app).post('/createUser')
       .send( {username: "aleyna",email: "aleynakutuk@hotmail.com", password: "123", gender: "female"})
       .then((res) => {
        const body = res.body;
        expect(body).to.contain.property('msg').and.is.equal('password atleast 6 characters');
        expect(res.status).to.equal(404);
         done();
       })
       .catch((err) => done(err));
   });
})

describe('POST /addProduct', () => {
  

  it('OK, adding a new product works', (done) => {
    request(app).post('/addProduct')
      .send( {productname: "t-shirt",color: "yellow",category: "sport",explanation: "nice",price: 30})
      .then((res) => {
        const body = res.body;
        expect(body).to.contain.property('msg');
        expect(res.status).to.equal(200);
        done();
      })
      .catch((err) => done(err));
  });
})

describe('POST /deleteProduct', () => {
  
  it('OK, deleting a product from database works', (done) => {
    request(app).post('/deleteProduct')
      .send( {productid: 1})
      .then((res) => {
        const body = res.body;
        expect(body).to.contain.property('msg');
        expect(res.status).to.equal(200);
        done();
      })
      .catch((err) => done(err));
  });
})

describe('POST /addProductToBasket', () => {
  
  it('OK, adding a product to user basket is working successfully', (done) => {
    request(app).post('/addProductToBasket')
      .send( {userid: 3, productid: 2, quantity: 3})
      .then((res) => {
        const body = res.body;
        expect(body).to.contain.property('msg');
        expect(res.status).to.equal(200);
        done();
      })
      .catch((err) => done(err));
  });
})

describe('POST /login', () => {
  
  it('OK, user login can be done successfully', (done) => {
    request(app).post('/login')
      .send( {username: "gizem", password: "123456", email: "gizemucal@sabanciuniv.edu"})
      .then((res) => {
        const body = res.body;
        expect(body).to.contain.property('msg');
        expect(res.status).to.equal(200);
        done();
      })
      .catch((err) => done(err));
  });

  
  it('Fail, user entered wrong password/username', (done) => {
    request(app).post('/login')
     .send({username: "gizem", password: "1234", email: "gizemucal@sabanciuniv.edu"})
     .then((res) => {
      const body = res.body;
      expect(res.status).to.equal(404);
       done();
     })
     .catch((err) => done(err));
 });

 it('Fail, user email does not exist in db', (done) => {
  request(app).post('/login')
   .send({username: "aleyna", password: "123456", email: "aleyna"})
   .then((res) => {
    const body = res.body;
    expect(res.status).to.equal(404);
     done();
   })
   .catch((err) => done(err));
});

})


describe('POST /deleteComment', () => {
  

  it('OK, comment can be deleted successfully ', (done) => {
    request(app).post('/deleteComment')
      .send( {commentid: 1})
      .then((res) => {
        const body = res.body;
        expect(res.status).to.equal(200);
        done();
      })
      .catch((err) => done(err));
  });
})

describe('POST /changeCommentStatus', () => {
  

  it('OK, comment status can be changed successfully!', (done) => {
    request(app).post('/changeCommentStatus')
      .send( {commentid: 1, approved: "Yes"})
      .then((res) => {
        const body = res.body;
        expect(res.status).to.equal(200);
        done();
      })
      .catch((err) => done(err));
  });

})