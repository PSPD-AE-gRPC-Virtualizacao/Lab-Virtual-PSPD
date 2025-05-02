package com.piaspspd.grpc;

import io.grpc.Server;
import io.grpc.ServerBuilder;

public class GrpcServer {

    public static void main(String[] args) throws Exception {
        Server server = ServerBuilder.forPort(50051)
                .addService(new ProductServiceImpl())
                .build();

        System.out.println("Servidor gRPC iniciado na porta 50051");
        server.start();
        server.awaitTermination();
    }
}
