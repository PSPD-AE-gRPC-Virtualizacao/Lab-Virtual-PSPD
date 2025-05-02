import chat_pb2_grpc
import chat_pb2
import time
import grpc

def cliente_request():
    while True:
        nome = input("Digite seu nome ou vazio para parar: ")
        if nome == "":
            break
        mensagem_request = chat_pb2.MensagemRequest(mensagem = nome)
        yield mensagem_request
        time.sleep(1)

def run():
    with grpc.insecure_channel('localhost:50051') as channel:
        stub = chat_pb2_grpc.ChatStub(channel)
        respostas = stub.EnviarMensagem(cliente_request())
        for resposta in respostas:
            print("Servidor Recebeu :")
            print(resposta)

if __name__ == "__main__":
    run()