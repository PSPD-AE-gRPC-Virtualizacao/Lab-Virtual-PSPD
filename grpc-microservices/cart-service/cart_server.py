import grpc
from concurrent import futures
from collections import defaultdict

import cart_pb2
import cart_pb2_grpc
import product_pb2
import product_pb2_grpc
from google.protobuf.empty_pb2 import Empty

# Estrutura para armazenar os carrinhos por usuário
carts = defaultdict(list)

# Conecta ao serviço de produtos
channel = grpc.insecure_channel('localhost:50051')  # Porta do ProductService
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

            return Empty()
        except grpc.RpcError as e:
            context.abort(e.code(), e.details())

    def RemoveFromCart(self, request, context):
        cart_items = carts[request.user_id]
        carts[request.user_id] = [item for item in cart_items if item.product_name != request.product_name]
        return Empty()

    def GetCart(self, request, context):
        return cart_pb2.Cart(
            user_id=request.user_id,
            items=carts[request.user_id]
        )

    def ClearCart(self, request, context):
        carts[request.user_id].clear()
        return Empty()


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    cart_pb2_grpc.add_CartServiceServicer_to_server(CartService(), server)
    server.add_insecure_port('[::]:50052')
    print("CartService rodando na porta 50052")
    server.start()
    server.wait_for_termination()


if __name__ == '__main__':
    serve()
