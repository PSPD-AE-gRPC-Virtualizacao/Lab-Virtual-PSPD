import grpc
import argparse
from concurrent import futures
from collections import defaultdict
import cart_pb2
import cart_pb2_grpc
import product_pb2
import product_pb2_grpc
from google.protobuf.empty_pb2 import Empty
import sys

parser = argparse.ArgumentParser(description='Cart Service')
parser.add_argument('--port', type=int, default=50052, help='Port to listen on')
parser.add_argument('--product-service', type=str, default='localhost:50051',
                    help='Product service address (host:port)')
args = parser.parse_args()

if args.port < 0 or args.port > 65535:
    print(f'Invalid port: {args.port}', file=sys.stderr)
    sys.exit(1)

# Estrutura para armazenar os carrinhos por usuário
carts = defaultdict(list)

# Conecta ao serviço de produtos
channel = grpc.insecure_channel(args.product_service)  # Endereço do ProductService
product_stub = product_pb2_grpc.ProductServiceStub(channel)

class CartService(cart_pb2_grpc.CartServiceServicer):
    def AddToCart(self, request, context):
        try:
            # Verifica se produto existe
            product = product_stub.GetProduct(product_pb2.nameQuery(name=request.product_name))
            # Verifica se já existe no carrinho
            cart_items = carts[request.user_id]
            for item in cart_items:
                if item.product_name == request.product_name:
                    item.quantity += request.quantity
                    return Empty()
            # Adiciona novo item
            carts[request.user_id].append(cart_pb2.CartItem(
                product_name=product.name,
                price=product.price,
                quantity=request.quantity
            ))
            print(f"Produto {product.name} adicionado ao carrinho do {request.user_id}!")
            return Empty()
        except grpc.RpcError as e:
            print("Falha ao adicionar produto!")
            context.abort(e.code(), e.details())

    def RemoveFromCart(self, request, context):
        carts[request.user_id] = [
            item for item in carts[request.user_id] if item.product_name != request.product_name
        ]
        print(f"Produto {request.product_name} removido do usuário {request.user_id}!")
        return Empty()

    def GetCart(self, request, context):
        print(f"Carrinho solicitado: id {request.user_id}\nProdutos: {carts[request.user_id]}")
        return cart_pb2.Cart(user_id=request.user_id, items=carts[request.user_id])

    def ClearCart(self, request, context):
        carts[request.user_id].clear()
        print(f"Limpando carrinho do id: {request.user_id}")
        return Empty()

# Server setup
def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    cart_pb2_grpc.add_CartServiceServicer_to_server(CartService(), server)
    server_address = f'[::]:{args.port}'  # Bind to all interfaces
    server.add_insecure_port(server_address)
    print(f"CartService rodando em {server_address}")
    print(f"Conectado ao ProductService em {args.product_service}")
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
