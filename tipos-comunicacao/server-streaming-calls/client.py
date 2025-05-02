import logs_pb2_grpc
import logs_pb2
import grpc

def run():
    with grpc.insecure_channel('localhost:50051') as channel:
        stub = logs_pb2_grpc.LogsStub(channel)
        logs_request = logs_pb2.LogRequest(nome = "Busca.txt")
        logs_replies = stub.showLogs(logs_request)

        for log_reply in logs_replies:
            print("Resposta de Log Recebida:")
            print(log_reply)

if __name__ == "__main__":
    run()