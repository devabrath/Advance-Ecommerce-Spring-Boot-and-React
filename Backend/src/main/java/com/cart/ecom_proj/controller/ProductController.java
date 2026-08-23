package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.dto.ProductPageResponse;
import com.cart.ecom_proj.dto.ProductResponse;
import com.cart.ecom_proj.service.ProductService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

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


    // =====================================================
    // GET PRODUCTS - PAGINATED
    // =====================================================

    @GetMapping("/products")
    public ResponseEntity<ProductPageResponse> getAllProducts(

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "20"
            )
            int size

    ) {

        // Safety
        if (page < 0) {
            page = 0;
        }

        if (size <= 0 || size > 100) {
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


        Page<ProductResponse> result =
                productService.getProducts(
                        pageable
                );


        return ResponseEntity.ok(
                new ProductPageResponse(

                        result.getContent(),

                        result.getNumber(),

                        result.getSize(),

                        result.getTotalElements(),

                        result.getTotalPages(),

                        result.isFirst(),

                        result.isLast()
                )
        );
    }


    // =====================================================
    // GET SINGLE PRODUCT
    // =====================================================

    @GetMapping("/product/{id}")
    public ResponseEntity<ProductResponse>
    getProduct(
            @PathVariable Long id
    ) {

        ProductResponse product =
                productService.getProductById(id);


        if (product == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }


        return ResponseEntity.ok(product);
    }


    // =====================================================
    // PRODUCT IMAGE
    // =====================================================

    @GetMapping(
            "/product/{productId}/image"
    )
    public ResponseEntity<byte[]> getImage(

            @PathVariable Long productId

    ) {

        try {

            byte[] image =
                    productService.getProductImage(
                            productId
                    );


            if (
                    image == null
                    ||
                    image.length == 0
            ) {

                return ResponseEntity
                        .notFound()
                        .build();
            }


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


            return ResponseEntity
                    .ok()
                    .contentType(mediaType)
                    .body(image);


        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }


    // =====================================================
    // SEARCH
    // =====================================================

    @GetMapping("/products/search")
    public ResponseEntity<List<ProductResponse>>
    searchProducts(

            @RequestParam String keyword

    ) {

        return ResponseEntity.ok(
                productService.searchProducts(
                        keyword
                )
        );
    }
}