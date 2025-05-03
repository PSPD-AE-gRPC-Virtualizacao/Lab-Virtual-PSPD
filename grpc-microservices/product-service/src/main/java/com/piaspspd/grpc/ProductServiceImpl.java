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
        logger.info("Searching for product with name: " + name);
        return products.stream()
                .filter(p -> p.getName().equals(name))
                .findFirst()
                .orElseThrow(() -> {
                    logger.warning("Product not found: " + name);
                    return Status.NOT_FOUND
                            .withDescription("Product '" + name + "' not found")
                            .asRuntimeException();
                });
    }

    @Override
    public void getProducts(ProductOuterClass.nameQuery request, StreamObserver<ProductOuterClass.Product> responseObserver) {
        logger.info("Received getProducts request with partial name query: \"" + request.getName() + "\"");
        int count = 0;

        for (ProductOuterClass.Product product : products) {
            if (product.getName().contains(request.getName())) {
                logger.fine("Found matching product: " + product.getName() +
                        " (price: " + product.getPrice() + ", stock amount: " + product.getAmount() + ")");
                responseObserver.onNext(product);
                count++;
            }
        }

        logger.info("getProducts (partial search) completed. Found " + count + " matching products for query: \"" + request.getName() + "\"");
        responseObserver.onCompleted();
    }

    @Override
    public void getProduct(ProductOuterClass.nameQuery request, StreamObserver<ProductOuterClass.Product> responseObserver) {
        logger.info("Received getProduct request for exact name: \"" + request.getName() + "\"");
        try {
            ProductOuterClass.Product product = findProductOrThrow(request.getName());
            responseObserver.onNext(product);
            logger.info("Successfully retrieved product: " + product.getName() +
                    " (price: " + product.getPrice() + ", stock amount: " + product.getAmount() + ")");
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            logger.log(Level.WARNING, "Failed to get product: \"" + request.getName() + "\"", e);
            responseObserver.onError(e);
        }
    }

    @Override
    public void removeProduct(ProductOuterClass.nameQuery request, StreamObserver<Empty> responseObserver) {
        logger.info("Received removeProduct request for: " + request.getName());
        try {
            ProductOuterClass.Product product = findProductOrThrow(request.getName());
            products.remove(product);
            logger.info("Successfully removed product: " + request.getName());
            responseObserver.onNext(Empty.getDefaultInstance());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            logger.log(Level.WARNING, "Failed to remove product: " + request.getName(), e);
            responseObserver.onError(e);
        }
    }

    @Override
    public void updateProduct(ProductOuterClass.Product request, StreamObserver<Empty> responseObserver) {
        logger.info("Received updateProduct request for: \"" + request.getName() + "\"");
        try {
            ProductOuterClass.Product oldProduct = findProductOrThrow(request.getName());
            logger.info("Found existing product: " + oldProduct.getName() +
                    " (price: " + oldProduct.getPrice() + ", stock amount: " + oldProduct.getAmount() + ")");

            products.remove(oldProduct);
            products.add(request);

            logger.info("Successfully updated product: " + request.getName() +
                    " - New values: (price: " + request.getPrice() + ", stock amount: " + request.getAmount() + ")");

            responseObserver.onNext(Empty.getDefaultInstance());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            logger.log(Level.WARNING, "Failed to update product: \"" + request.getName() + "\"", e);
            responseObserver.onError(e);
        }
    }

    private void tryAddProduct(ProductOuterClass.Product request) {
        logger.info("Attempting to add product: " + request.getName());
        if (products.stream().anyMatch(p -> p.getName().equals(request.getName()))) {
            logger.warning("Product already exists: " + request.getName());
            throw Status.ALREADY_EXISTS
                    .withDescription("Product '" + request.getName() + "' already exists")
                    .asRuntimeException();
        }
        products.add(request);
        logger.info("Product added successfully: " + request.getName() +
                " (price: " + request.getPrice() + ", stock amount: " + request.getAmount() + ")");
    }

    @Override
    public void addProduct(ProductOuterClass.Product request, StreamObserver<Empty> responseObserver) {
        logger.info("Received addProduct request for: " + request.getName());
        try {
            tryAddProduct(request);
            responseObserver.onNext(Empty.getDefaultInstance());
            responseObserver.onCompleted();
        } catch (StatusRuntimeException e) {
            logger.log(Level.WARNING, "Failed to add product: " + request.getName(), e);
            responseObserver.onError(e);
        }
    }

    @Override
    public StreamObserver<ProductOuterClass.Product> addProducts(StreamObserver<Empty> responseObserver) {
        logger.info("Received addProducts (streaming) request - starting batch product addition");
        return new StreamObserver<>() {
            private int successCount = 0;
            private int failureCount = 0;
            private final List<String> processedProducts = new ArrayList<>();
            private final List<String> failedProducts = new ArrayList<>();

            @Override
            public void onNext(ProductOuterClass.Product product) {
                logger.info("Processing product in stream: \"" + product.getName() +
                        "\" (price: " + product.getPrice() + ", stock amount: " + product.getAmount() + ")");
                try {
                    tryAddProduct(product);
                    successCount++;
                    processedProducts.add(product.getName());
                    logger.fine("Successfully added product #" + successCount + " in stream");
                } catch (StatusRuntimeException e) {
                    failureCount++;
                    failedProducts.add(product.getName());
                    logger.log(Level.WARNING, "Failed to add product #" + (successCount + failureCount) +
                            " in stream: \"" + product.getName() + "\"", e);
                }
            }

            @Override
            public void onError(Throwable throwable) {
                logger.log(Level.SEVERE, "Error in addProducts stream processing", throwable);
                logger.info("Stream terminated abnormally. Processed " + successCount +
                        " products successfully before error occurred.");
                responseObserver.onError(throwable);
            }

            @Override
            public void onCompleted() {
                if (!failedProducts.isEmpty()) {
                    logger.warning("Some products failed to add: " + String.join(", ", failedProducts));
                }

                if (!processedProducts.isEmpty()) {
                    logger.info("Successfully added products: " + String.join(", ", processedProducts));
                }

                logger.info("addProducts stream completed. Success: " + successCount +
                        ", Failures: " + failureCount +
                        ", Total processed: " + (successCount + failureCount));

                responseObserver.onNext(Empty.getDefaultInstance());
                responseObserver.onCompleted();
            }
        };
    }
}
