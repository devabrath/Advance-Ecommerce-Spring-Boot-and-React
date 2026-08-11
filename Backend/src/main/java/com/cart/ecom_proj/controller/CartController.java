package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.dto.AddCartItemRequest;
import com.cart.ecom_proj.dto.CartResponse;
import com.cart.ecom_proj.dto.UpdateCartItemRequest;
import com.cart.ecom_proj.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer/cart")
@CrossOrigin
public class CartController {

    private final CartService cartService;

    public CartController(
            CartService cartService
    ) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                cartService.getCart(
                        authentication.getName()
                )
        );
    }

    @PostMapping("/items")
    public ResponseEntity<?> addItem(
            Authentication authentication,
            @Valid @RequestBody
            AddCartItemRequest request
    ) {

        try {

            return ResponseEntity.ok(
                    cartService.addItem(
                            authentication.getName(),
                            request
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<?> updateItem(
            Authentication authentication,
            @PathVariable Long productId,
            @Valid @RequestBody
            UpdateCartItemRequest request
    ) {

        try {

            return ResponseEntity.ok(
                    cartService.updateItem(
                            authentication.getName(),
                            productId,
                            request
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<?> removeItem(
            Authentication authentication,
            @PathVariable Long productId
    ) {

        try {

            return ResponseEntity.ok(
                    cartService.removeItem(
                            authentication.getName(),
                            productId
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}