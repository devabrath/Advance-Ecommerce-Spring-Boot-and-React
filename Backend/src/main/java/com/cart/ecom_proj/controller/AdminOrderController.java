package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.dto.OrderResponse;
import com.cart.ecom_proj.dto.UpdateOrderStatusRequest;
import com.cart.ecom_proj.service.OrderService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.cart.ecom_proj.dto.UpdateOrderStatusRequest;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {

        return ResponseEntity.ok(
                orderService.getAllOrders()
        );
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrder(
            @PathVariable Long orderId
    ) {

        return ResponseEntity.ok(
                orderService.getOrderById(orderId)
        );
    }

    @PutMapping("/{orderId}/status")
public ResponseEntity<OrderResponse> updateOrderStatus(
        @PathVariable Long orderId,
        @Valid @RequestBody UpdateOrderStatusRequest request
) {

    return ResponseEntity.ok(
            orderService.updateOrderStatus(
                    orderId,
                    request.status()
            )
    );
}
}