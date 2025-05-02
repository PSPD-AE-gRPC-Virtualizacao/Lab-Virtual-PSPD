import cadastro_pb2
import cadastro_pb2_grpc
import time
import grpc

def cliente_request():
    while True:
        nome = input("Digite seu nome ou vazio para parar: ")
        if nome == "":
            break
        cadastro_request = cadastro_pb2.CadastroRequest(nome = nome)
        yield cadastro_request
        time.sleep(1)

def run():
    with grpc.insecure_channel('localhost:50051') as channel:
        stub = cadastro_pb2_grpc.CadastroStub(channel)
        delayed_reply = stub.Cadastrar(cliente_request())
        print("Resposta de Cadastro Recebida:")
        print(delayed_reply)

if __name__ == "__main__":
    run()