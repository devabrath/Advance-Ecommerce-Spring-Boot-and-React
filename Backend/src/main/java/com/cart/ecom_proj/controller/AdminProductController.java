package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.dto.AdminProductRequest;
import com.cart.ecom_proj.dto.ProductResponse;
import com.cart.ecom_proj.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

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

        this.productService =
                productService;

        this.objectMapper =
                objectMapper;
    }


    // =====================================================
    // GET PRODUCTS - PAGINATED
    // =====================================================

    @GetMapping
    public ResponseEntity<Page<ProductResponse>>
    getProducts(

            @RequestParam(
                    defaultValue = ""
            )
            String keyword,

            @RequestParam(
                    defaultValue = "ALL"
            )
            String status,

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "20"
            )
            int size

    ) {

        /*
         * Prevent invalid pagination values.
         */

        if (page < 0) {
            page = 0;
        }

        if (size < 1 || size > 100) {
            size = 20;
        }


        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(
                                Sort.Direction.DESC,
                                "id"
                        )
                );


        return ResponseEntity.ok(
                productService.getAdminProducts(
                        keyword,
                        status,
                        pageable
                )
        );
    }


    // =====================================================
    // ADD PRODUCT
    // =====================================================

    @PostMapping
    public ResponseEntity<?> addProduct(

            @RequestPart("product")
            String productJson,

            @RequestPart(
                    value = "imageFile",
                    required = false
            )
            MultipartFile imageFile

    ) {

        try {

            AdminProductRequest request =
                    objectMapper.readValue(
                            productJson,
                            AdminProductRequest.class
                    );


            ProductResponse response =
                    productService.addAdminProduct(
                            request,
                            imageFile
                    );


            return ResponseEntity
                    .status(
                            HttpStatus.CREATED
                    )
                    .body(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (IOException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Invalid product data or image upload failed"
                    );
        }
    }


    // =====================================================
    // UPDATE PRODUCT
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(

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

            AdminProductRequest request =
                    objectMapper.readValue(
                            productJson,
                            AdminProductRequest.class
                    );


            ProductResponse response =
                    productService.updateAdminProduct(
                            id,
                            request,
                            imageFile
                    );


            return ResponseEntity.ok(
                    response
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (IOException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Invalid product data or image upload failed"
                    );
        }
    }


    // =====================================================
    // DELETE PRODUCT
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable Long id
    ) {

        try {

            productService.deleteAdminProduct(
                    id
            );

            return ResponseEntity
                    .noContent()
                    .build();

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}