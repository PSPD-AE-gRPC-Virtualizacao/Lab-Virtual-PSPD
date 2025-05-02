package com.piaspspd.grpc;

import io.grpc.stub.StreamObserver;

public class ProductServiceImpl extends ProductServiceGrpc.ProductServiceImplBase {

    @Override
    public void getProduct(Product.ProductRequest request, StreamObserver<Product.ProductResponse> responseObserver) {
        Product.ProductResponse reply = Product.ProductResponse.newBuilder()
                .setName("Teste fezes")
                .setPrice(999)
                .build();

        responseObserver.onNext(reply);
        responseObserver.onCompleted();
    }
}
