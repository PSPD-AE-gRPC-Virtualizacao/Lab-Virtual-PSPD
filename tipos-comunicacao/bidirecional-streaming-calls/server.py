from concurrent import futures

import grpc
import chat_pb2
import chat_pb2_grpc


class ChatServicer(chat_pb2_grpc.ChatServicer):
    def EnviarMensagem(self, requests, context):
        for request in requests:
            print("Mensagem recebida :")
            print(request)
            mensagem_reply = chat_pb2.MensagemReply()
            mensagem_reply.mensagem = f"{request.mensagem}"
            yield mensagem_reply

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    chat_pb2_grpc.add_ChatServicer_to_server(ChatServicer(), server)
    server.add_insecure_port("localhost:50051")
    server.start()
    print("Servidor rodando em localhost:50051...")
    server.wait_for_termination()

if __name__ == "__main__":
    serve()