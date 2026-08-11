package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.dto.ProductResponse;
import com.cart.ecom_proj.service.ProductService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class ProductController {

    private final ProductService productService;

    public ProductController(
            ProductService productService
    ) {
        this.productService = productService;
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductResponse>>
    getAllProducts() {

        return ResponseEntity.ok(
                productService.getAllProducts()
        );
    }

    @GetMapping("/product/{id}")
    public ResponseEntity<ProductResponse>
    getProduct(@PathVariable Long id) {

        ProductResponse product =
                productService.getProductById(id);

        if (product == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(product);
    }

    @GetMapping("/product/{productId}/image")
    public ResponseEntity<byte[]> getImage(
            @PathVariable Long productId
    ) {

        try {

            byte[] image =
                    productService.getProductImage(
                            productId
                    );

            String imageType =
                    productService.getProductImageType(
                            productId
                    );

            MediaType mediaType =
                    MediaType.APPLICATION_OCTET_STREAM;

            if (imageType != null) {
                try {
                    mediaType =
                            MediaType.parseMediaType(
                                    imageType
                            );
                } catch (Exception ignored) {
                }
            }

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .body(image);

        } catch (RuntimeException e) {

            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/products/search")
    public ResponseEntity<List<ProductResponse>>
    searchProducts(
            @RequestParam String keyword
    ) {

        return ResponseEntity.ok(
                productService.searchProducts(keyword)
        );
    }
}