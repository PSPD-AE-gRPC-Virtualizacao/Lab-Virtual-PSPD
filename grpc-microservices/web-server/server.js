import express from 'express';
import bodyParser from 'body-parser';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import cors from 'cors';

const args = process.argv.slice(2);
const getArg = (flag, defaultValue) => {
  const index = args.indexOf(flag);
  return index !== -1 && args[index + 1] ? args[index + 1] : defaultValue;
};

const cartServiceAddress = getArg('--cart-service', 'localhost:50052');
const productServiceAddress = getArg('--product-service', 'localhost:50051');
const port = getArg('--port', '3000'); // Default port is 3000

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
  console.log("Requisição cart_add recebida: ", req.body);
  cartClient.AddToCart({ user_id, product_name, quantity }, (err, response) => {
    if (err) return res.status(500).send(err);
    res.send(response);
  });
});

app.post('/cart_remove', (req, res) => {
  const { user_id, product_name } = req.body;
  console.log("Requisição cart_remove recebida: ", req.body);
  cartClient.RemoveFromCart({ user_id, product_name }, (err, response) => {
    if (err) return res.status(500).send(err);
    res.send(response);
  });
});

app.get('/cart/:user_id', (req, res) => {
  cartClient.GetCart({ user_id: req.params.user_id }, (err, response) => {
    console.log("Requisição cart/:user_id recebida: ", req.params.user_id);
    if (err) return res.status(500).send(err);
    res.send(response);
  });
});

app.post('/cart_clear', (req, res) => {
  const { user_id } = req.body;
  console.log("Requisição cart_clear recebida: ", req.body);
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

app.post('/product_add', (req, res) => {
  const { name, price, amount } = req.body;
  console.log("Requisição product_add recebida: ", req.body);
  productClient.addProduct({ name, price, amount }, (err, response) => {
    if (err) return res.status(500).send(err);
    res.send(response);
  });
});

app.post('/product_remove', (req, res) => {
  const { name, price, amount } = req.body;
  console.log("Requisição product_remove recebida: ", req.body);
  productClient.removeProduct({ name, price, amount }, (err, response) => {
    if (err) return res.status(500).send(err);
    res.send(response);
  });
});

app.post('/product_update', (req, res) => {
  const { name, price, amount } = req.body;
  console.log("Requisição product_update recebida: ", req.body);
  productClient.updateProduct({ name, price, amount }, (err, response) => {
    if (err) return res.status(500).send(err);
    res.send(response);
  });
});

app.get('/products/:name', (req, res) => {
  const call = productClient.GetProducts({ name: req.params.name });
  const products = [];
  console.log("Requisição products/:name recebida: ", req.params.name);
  call.on('data', (product) => {
    products.push(product);
  });
  call.on('end', () => {
    res.send(products);
  });
  call.on('error', (err) => {
    console.error('Erro ao receber stream de produtos:', err);
    res.status(500).send(err);
  });
});


// -----------------------------
//     INICIALIZAÇÃO
// -----------------------------

app.listen(port, () => {
  console.log(`API Web rodando em http://localhost:${port}`);
  console.log(`Conectado ao CartService em ${cartServiceAddress}`);
  console.log(`Conectado ao ProductService em ${productServiceAddress}`);
});
