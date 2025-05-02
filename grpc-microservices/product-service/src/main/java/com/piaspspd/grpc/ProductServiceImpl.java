package com.piaspspd.grpc;

import com.google.protobuf.Empty;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import io.grpc.stub.StreamObserver;

import java.util.ArrayList;
import java.util.List;

public class ProductServiceImpl extends ProductServiceGrpc.ProductServiceImplBase {

    private final List<ProductOuterClass.Product> products = new ArrayList<>();

    private ProductOuterClass.Product findProductOrThrow(String name) {
        return products.stream()
                .filter(p -> p.getName().equals(name))
                .findFirst()
                .orElseThrow(() ->
                        Status.NOT_FOUND
                                .withDescription("Product '" + name + "' not found")
                                .asRuntimeException()
                );
    }

    @Override
    public void getProduct(ProductOuterClass.nameQuery request, StreamObserver<ProductOuterClass.Product> responseObserver) {
        try {
            ProductOuterClass.Product product = findProductOrThrow(request.getName());
            responseObserver.onNext(product);
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public void removeProduct(ProductOuterClass.nameQuery request, StreamObserver<Empty> responseObserver) {
        try {
            ProductOuterClass.Product product = findProductOrThrow(request.getName());
            products.remove(product);
            responseObserver.onNext(Empty.getDefaultInstance());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public void updateProduct(ProductOuterClass.Product request, StreamObserver<Empty> responseObserver) {
        try {
            ProductOuterClass.Product oldProduct = findProductOrThrow(request.getName());
            products.remove(oldProduct);
            products.add(request);
            responseObserver.onNext(Empty.getDefaultInstance());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public void addProduct(ProductOuterClass.Product request, StreamObserver<Empty> responseObserver) {
        ProductOuterClass.Product existing = products.stream()
                .filter(p -> p.getName().equals(request.getName()))
                .findFirst()
                .orElseThrow(() ->
                        Status.NOT_FOUND
                                .withDescription("Product '" + request.getName() + "' not found")
                                .asRuntimeException()
                );

        if (existing != null) {
            responseObserver.onError(
                    Status.NOT_FOUND
                            .withDescription("Product '" + request.getName() + "' already exists")
                            .asRuntimeException()
            );

            return;
        }
        products.add(request);
        responseObserver.onNext(Empty.getDefaultInstance());
        responseObserver.onCompleted();
    }
}
