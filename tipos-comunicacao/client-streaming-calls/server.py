from concurrent import futures
import time

import grpc
import cadastro_pb2
import cadastro_pb2_grpc


class CadastroServicer(cadastro_pb2_grpc.CadastroServicer):
    def Cadastrar(self, request_iterator, context):
        delayed_reply = cadastro_pb2.CadastroReply()
        for request in request_iterator:
            print("Requisição feita -", request)
            delayed_reply.request.append(request)
        delayed_reply.mensagem = f"Você cadastrou {len(delayed_reply.request)} vezes"
        return delayed_reply

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    cadastro_pb2_grpc.add_CadastroServicer_to_server(CadastroServicer(), server)
    server.add_insecure_port("localhost:50051")
    server.start()
    print("Servidor rodando em localhost:50051...")
    server.wait_for_termination()

if __name__ == "__main__":
    serve()