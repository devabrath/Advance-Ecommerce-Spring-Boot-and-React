package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.dto.CheckoutRequest;
import com.cart.ecom_proj.dto.OrderResponse;
import com.cart.ecom_proj.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/customer/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(
            Authentication authentication,
            @Valid @RequestBody CheckoutRequest request
    ) {

        OrderResponse response =
                orderService.checkout(
                        authentication.getName(),
                        request
                );

        return ResponseEntity.ok(response);
    }
    @GetMapping
public ResponseEntity<List<OrderResponse>> getMyOrders(
        Authentication authentication
) {

    return ResponseEntity.ok(
            orderService.getMyOrders(
                    authentication.getName()
            )
    );
}
}