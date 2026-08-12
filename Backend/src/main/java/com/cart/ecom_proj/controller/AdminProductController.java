package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.dto.AdminProductRequest;
import com.cart.ecom_proj.dto.ProductResponse;
import com.cart.ecom_proj.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
@CrossOrigin
public class AdminProductController {

    private final ProductService productService;
    private final ObjectMapper objectMapper;

    public AdminProductController(
            ProductService productService,
            ObjectMapper objectMapper
    ) {
        this.productService = productService;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {

        return ResponseEntity.ok(
                productService.getAllProducts()
        );
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponse> getProduct(
            @PathVariable Long productId
    ) {

        ProductResponse product =
                productService.getProductById(productId);

        if (product == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(product);
    }

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ProductResponse> addProduct(
            @RequestPart("product") String productJson,
            @RequestPart(
                    value = "imageFile",
                    required = false
            ) MultipartFile imageFile
    ) throws Exception {

        AdminProductRequest request =
                objectMapper.readValue(
                        productJson,
                        AdminProductRequest.class
                );

        return ResponseEntity.ok(
                productService.addAdminProduct(
                        request,
                        imageFile
                )
        );
    }
}