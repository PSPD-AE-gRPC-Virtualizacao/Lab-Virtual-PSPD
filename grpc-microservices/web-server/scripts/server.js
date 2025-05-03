import express from 'express';
import bodyParser from 'body-parser';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// -----------------------------
//     CART-SERVICE
// -----------------------------

const cartPackageDefinition = protoLoader.loadSync('protos/cart.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const cartProto = grpc.loadPackageDefinition(cartPackageDefinition).com.cart.grpc;
const cartClient = new cartProto.CartService('localhost:50052', grpc.credentials.createInsecure());

app.post('/cart_add', (req, res) => {
  const { user_id, product_name, quantity } = req.body;
  cartClient.AddToCart({ user_id, product_name, quantity }, (err, response) => {
    if (err) return res.status(500).send(err);
    res.send(response);
  });
});

app.post('/cart_remove', (req, res) => {
  const { user_id, product_name } = req.body;
  cartClient.RemoveFromCart({ user_id, product_name }, (err, response) => {
    if (err) return res.status(500).send(err);
    res.send(response);
  });
});

app.get('/cart/:user_id', (req, res) => {
  cartClient.GetCart({ user_id: req.params.user_id }, (err, response) => {
    if (err) return res.status(500).send(err);
    res.send(response);
  });
});

app.post('/cart_clear', (req, res) => {
  const { user_id } = req.body;
  cartClient.ClearCart({ user_id }, (err, response) => {
    if (err) return res.status(500).send(err);
    res.send(response);
  });
});

// -----------------------------
//     PRODUCT-SERVICE
// -----------------------------

const productPackageDefinition = protoLoader.loadSync('protos/product.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const productProto = grpc.loadPackageDefinition(productPackageDefinition).com.piaspspd.grpc;
const productClient = new productProto.ProductService('localhost:50051', grpc.credentials.createInsecure());

app.post('/product...', (req, res) => {

});

// -----------------------------
//     INICIALIZAÇÃO
// -----------------------------

app.listen(3000, () => {
  console.log('API Web rodando em http://localhost:3000');
});
