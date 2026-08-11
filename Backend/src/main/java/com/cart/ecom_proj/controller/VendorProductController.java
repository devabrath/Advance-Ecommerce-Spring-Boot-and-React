package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.dto.ProductRequest;
import com.cart.ecom_proj.dto.ProductResponse;
import com.cart.ecom_proj.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/vendor/products")
@CrossOrigin
public class VendorProductController {

    private final ProductService productService;
    private final ObjectMapper objectMapper;

    public VendorProductController(
            ProductService productService,
            ObjectMapper objectMapper
    ) {
        this.productService = productService;
        this.objectMapper = objectMapper;
    }

    @PostMapping
    public ResponseEntity<?> addProduct(
            Authentication authentication,

            @RequestPart("product")
            String productJson,

            @RequestPart(
                    value = "imageFile",
                    required = false
            )
            MultipartFile imageFile
    ) {

        try {

            ProductRequest request =
                    objectMapper.readValue(
                            productJson,
                            ProductRequest.class
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            productService.addVendorProduct(
                                    authentication.getName(),
                                    request,
                                    imageFile
                            )
                    );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (IOException e) {

            return ResponseEntity
                    .badRequest()
                    .body("Invalid product data or image upload failed");
        }
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>>
    getProducts(Authentication authentication) {

        return ResponseEntity.ok(
                productService.getVendorProducts(
                        authentication.getName()
                )
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(
            Authentication authentication,
            @PathVariable Long id,

            @RequestPart("product")
            String productJson,

            @RequestPart(
                    value = "imageFile",
                    required = false
            )
            MultipartFile imageFile
    ) {

        try {

            ProductRequest request =
                    objectMapper.readValue(
                            productJson,
                            ProductRequest.class
                    );

            return ResponseEntity.ok(
                    productService.updateVendorProduct(
                            authentication.getName(),
                            id,
                            request,
                            imageFile
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (IOException e) {

            return ResponseEntity
                    .badRequest()
                    .body("Invalid product data or image upload failed");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(
            Authentication authentication,
            @PathVariable Long id
    ) {

        try {

            productService.deleteVendorProduct(
                    authentication.getName(),
                    id
            );

            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}