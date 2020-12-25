process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');

const app = require('../../../app.js');

describe('POST /createUser', () => {
  
  
  it('OK, creating a new user works', (done) => {
    request(app).post('/createUser')
      .send( {username: "yağmur",email: "yagmur@hotmail.com", password: "345678", gender: "female"})
      .then((res) => {
        const body = res.body;
        expect(body).to.contain.property('msg');
        done();
      })
      .catch((err) => done(err));
  });

  //  it('Fail, it requires email', (done) => {
  //    request(app).post('/createUser')
  //      .send({ username: "aleyna" })
  //      .then((res) => {
  //       const body = res.body;
  //       expect(status.args\[0\][0]).to.equal(404);
  //        done();
  //      })
  //      .catch((err) => done(err));
  //  });
})

describe('POST /addProduct', () => {
  

  it('OK, adding a new product works', (done) => {
    request(app).post('/addProduct')
      .send( {productname: "top",color: "green",category: "sport",explanation: "nice",price: 15})
      .then((res) => {
        const body = res.body;
        expect(body).to.contain.property('msg');
        done();
      })
      .catch((err) => done(err));
  });
})

describe('POST /deleteProduct', () => {
  
  it('OK, deleting a product from database works', (done) => {
    request(app).post('/deleteProduct')
      .send( {productid: 2})
      .then((res) => {
        const body = res.body;
        expect(body).to.contain.property('msg');
        done();
      })
      .catch((err) => done(err));
  });
})

describe('POST /login', () => {
  
  it('OK, user login can be done successfully', (done) => {
    request(app).post('/login')
      .send( {username: "aleyna", password: "123456", email: "aleynakutuk@sabanciuniv.edu"})
      .then((res) => {
        const body = res.body;
        expect(body).to.contain.property('msg');
        done();
      })
      .catch((err) => done(err));
  });
})