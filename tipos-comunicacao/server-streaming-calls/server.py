from concurrent import futures
import time

import grpc
import logs_pb2
import logs_pb2_grpc


class LogsServicer(logs_pb2_grpc.LogsServicer):
    def showLogs(self, request, context):
        print(f"Requisição recebida: nome={request}")
        for i in range(3):
            log_reply = logs_pb2.LogReply()
            log_reply.message = f"Buscando {request.nome} - {i*33}%"
            yield log_reply
            time.sleep(1)
        log_reply = logs_pb2.LogReply()
        log_reply.message = f"{request.nome} encontrado!"
        yield log_reply

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    logs_pb2_grpc.add_LogsServicer_to_server(LogsServicer(), server)
    server.add_insecure_port("localhost:50051")
    server.start()
    print("Servidor rodando em localhost:50051...")
    server.wait_for_termination()

if __name__ == "__main__":
    serve()