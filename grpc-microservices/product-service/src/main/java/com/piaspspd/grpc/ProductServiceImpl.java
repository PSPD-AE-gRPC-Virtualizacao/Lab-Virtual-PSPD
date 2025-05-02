package com.piaspspd.grpc;

import com.google.protobuf.Empty;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import io.grpc.stub.StreamObserver;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;

public class ProductServiceImpl extends ProductServiceGrpc.ProductServiceImplBase {

    private final List<ProductOuterClass.Product> products = new ArrayList<>();
    private final java.util.logging.Logger logger = java.util.logging.Logger.getLogger(ProductServiceImpl.class.getName());

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
    public void getProducts(ProductOuterClass.nameQuery request, StreamObserver<ProductOuterClass.Product> responseObserver) {
       products.stream()
               .filter(p -> p.getName().equals(request.getName()))
               .forEach(responseObserver::onNext);
       responseObserver.onCompleted();
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

    private void tryAddProduct(ProductOuterClass.Product request) {
        if (products.stream().anyMatch(p -> p.getName().equals(request.getName()))) {
            throw Status.ALREADY_EXISTS
                    .withDescription("Product '" + request.getName() + "' already exists")
                    .asRuntimeException();
        }
        products.add(request);
    }
    @Override
    public void addProduct(ProductOuterClass.Product request, StreamObserver<Empty> responseObserver) {
        try {
            tryAddProduct(request);
            responseObserver.onNext(Empty.getDefaultInstance());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public StreamObserver<ProductOuterClass.Product> addProducts(StreamObserver<Empty> responseObserver) {
        return new StreamObserver<>() {
            @Override
            public void onNext(ProductOuterClass.Product product) {
                try {
                    tryAddProduct(product);
                } catch (StatusRuntimeException e) {
                    logger.log(Level.WARNING, "Failed to add product: " + product.getName(), e);
                }
            }

            @Override
            public void onError(Throwable throwable) {
                logger.log(Level.WARNING, "Encountered error in recordRoute", throwable);
            }

            @Override
            public void onCompleted() {
                responseObserver.onCompleted();
            }
        };
    }
}
