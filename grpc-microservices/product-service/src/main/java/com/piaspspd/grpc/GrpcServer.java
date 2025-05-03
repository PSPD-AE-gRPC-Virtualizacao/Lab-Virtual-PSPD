package com.piaspspd.grpc;

import io.grpc.Server;
import io.grpc.ServerBuilder;

public class GrpcServer {

    public static void main(String[] args) throws Exception {
        if (args.length != 1) {
            System.err.println("Usage: GrpcServer <port>");
            System.exit(1);
        }

        int port = Integer.parseInt(args[0]);
        if (port <= 0 || port > 65535) {
            System.err.println("Invalid port: " + port);
            System.exit(1);
        }

        Server server = ServerBuilder.forPort(port)
                .addService(new ProductServiceImpl())
                .build();

        System.out.println("Grpc server awaiting on port: " + port);
        server.start();
        server.awaitTermination();
    }
}