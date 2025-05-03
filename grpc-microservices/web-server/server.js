import express from 'express';
import bodyParser from 'body-parser';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import cors from 'cors';

// -----------------------------
//     CLI ARGUMENT PARSING
// -----------------------------
const args = process.argv.slice(2);
const getArg = (flag, defaultValue) => {
  const index = args.indexOf(flag);
  return index !== -1 && args[index + 1] ? args[index + 1] : defaultValue;
};

const cartServiceAddress = getArg('--cart-service', 'localhost:50052');
const productServiceAddress = getArg('--product-service', 'localhost:50051');
const port = getArg('--port', '3000'); // Default port is 3000

// -----------------------------
//     EXPRESS SETUP
// -----------------------------
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
const cartClient = new cartProto.CartService(cartServiceAddress, grpc.credentials.createInsecure());

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
const productClient = new productProto.ProductService(productServiceAddress, grpc.credentials.createInsecure());

app.post('/product...', (req, res) => {
  // TODO: Add product endpoint implementation
});

// -----------------------------
//     INICIALIZAÇÃO
// -----------------------------
app.listen(port, () => {
  console.log(`API Web rodando em http://localhost:${port}`);
  console.log(`Conectado ao CartService em ${cartServiceAddress}`);
  console.log(`Conectado ao ProductService em ${productServiceAddress}`);
});
