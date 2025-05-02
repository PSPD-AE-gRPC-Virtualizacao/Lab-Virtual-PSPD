import grpc
import login_pb2
import login_pb2_grpc

def run():
    with grpc.insecure_channel('localhost:50051') as channel:
        stub = login_pb2_grpc.LoginStub(channel)
        login_request = login_pb2.LoginRequest(nome="Joao", senha="123")
        response = stub.login(login_request)
        print("Resposta de Login Recebida:")
        print(response.message)

if __name__ == "__main__":
    run()
