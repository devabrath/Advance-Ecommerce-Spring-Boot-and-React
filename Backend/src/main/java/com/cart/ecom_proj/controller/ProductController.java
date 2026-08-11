package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.dto.ProductResponse;
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
    public ResponseEntity<List<ProductResponse>> getAllProducts() {

        return ResponseEntity.ok(
                productService.getAllProducts()
        );
    }

    @GetMapping("/product/{id}")
    public ResponseEntity<ProductResponse> getProduct(
            @PathVariable Long id
    ) {

        ProductResponse product =
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
            @RequestPart(
                    value = "imageFile",
                    required = false
            )
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
                    .body(savedProduct.getId());

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

        ProductResponse product =
                productService.getProductById(productId);

        if (product == null
                || product.getImageName() == null) {

            return ResponseEntity.notFound().build();
        }

        // Image retrieval will be moved to a dedicated
        // image service in the next cleanup.
        return ResponseEntity
                .status(HttpStatus.NOT_IMPLEMENTED)
                .build();
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
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(
                    updatedProduct.getId()
            );

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

        ProductResponse product =
                productService.getProductById(id);

        if (product == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Product not found");
        }

        productService.deleteProduct(id);

        return ResponseEntity.ok(
                "Product deleted successfully"
        );
    }

    @GetMapping("/products/search")
    public ResponseEntity<List<ProductResponse>> searchProducts(
            @RequestParam String keyword
    ) {

        return ResponseEntity.ok(
                productService.searchProducts(keyword)
        );
    }
}