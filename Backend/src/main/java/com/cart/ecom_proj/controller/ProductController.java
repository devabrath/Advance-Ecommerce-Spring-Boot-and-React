package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.model.Product;
import com.cart.ecom_proj.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {

        return ResponseEntity.ok(
                productService.getAllProducts()
        );
    }

    @GetMapping("/product/{id}")
    public ResponseEntity<Product> getProduct(
            @PathVariable Long id
    ) {

        Product product =
                productService.getProductById(id);

        if (product == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(product);
    }

    @PostMapping(
            value = "/product",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> addProduct(
            @RequestPart("product") Product product,
            @RequestPart("imageFile")
            MultipartFile imageFile
    ) {

        try {

            Product savedProduct =
                    productService.addProduct(
                            product,
                            imageFile
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedProduct);

        } catch (IOException e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload product image");
        }
    }

    @GetMapping("/product/{productId}/image")
    public ResponseEntity<byte[]> getImageByProductId(
            @PathVariable Long productId
    ) {

        Product product =
                productService.getProductById(productId);

        if (product == null
                || product.getImageData() == null) {

            return ResponseEntity.notFound().build();
        }

        MediaType mediaType =
                MediaType.APPLICATION_OCTET_STREAM;

        if (product.getImageType() != null) {

            try {
                mediaType =
                        MediaType.parseMediaType(
                                product.getImageType()
                        );
            } catch (Exception ignored) {
            }
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(product.getImageData());
    }

    @PutMapping(
            value = "/product/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestPart("product") Product product,
            @RequestPart(
                    value = "imageFile",
                    required = false
            )
            MultipartFile imageFile
    ) {

        try {

            Product updatedProduct =
                    productService.updateProduct(
                            id,
                            product,
                            imageFile
                    );

            if (updatedProduct == null) {
                return ResponseEntity
                        .notFound()
                        .build();
            }

            return ResponseEntity.ok(updatedProduct);

        } catch (IOException e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update product image");
        }
    }

    @DeleteMapping("/product/{id}")
    public ResponseEntity<String> deleteProduct(
            @PathVariable Long id
    ) {

        Product product =
                productService.getProductById(id);

        if (product == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Product not found");
        }

        productService.deleteProduct(id);

        return ResponseEntity.ok("Product deleted successfully");
    }

    @GetMapping("/products/search")
    public ResponseEntity<List<Product>> searchProducts(
            @RequestParam String keyword
    ) {

        return ResponseEntity.ok(
                productService.searchProducts(keyword)
        );
    }
}