from concurrent import futures
import grpc
import login_pb2
import login_pb2_grpc

class LoginService(login_pb2_grpc.LoginServicer):
    def login(self, request, context):
        print(f"Requisição recebida: nome={request.nome}, senha={request.senha}")
        return login_pb2.LoginReply(message=f"Bem-vindo, {request.nome}!")

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    login_pb2_grpc.add_LoginServicer_to_server(LoginService(), server)
    server.add_insecure_port('localhost:50051')
    server.start()
    print("Servidor rodando em localhost:50051...")
    server.wait_for_termination()

if __name__ == "__main__":
    serve()
