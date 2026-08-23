package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.dto.OrderResponse;
import com.cart.ecom_proj.model.OrderStatus;
import com.cart.ecom_proj.service.OrderService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendor/orders")
@CrossOrigin
public class VendorOrderController {

    private final OrderService orderService;

    public VendorOrderController(
            OrderService orderService
    ) {
        this.orderService = orderService;
    }


    @GetMapping
    public ResponseEntity<List<OrderResponse>>
    getVendorOrders(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                orderService.getVendorOrders(
                        authentication.getName()
                )
        );
    }


    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse>
    updateOrderStatus(
            Authentication authentication,
            @PathVariable Long orderId,
            @RequestParam OrderStatus status
    ) {

        /*
         * We'll add vendor ownership validation
         * before allowing status updates.
         */

        return ResponseEntity.ok(
                orderService.updateVendorOrderStatus(
                        authentication.getName(),
                        orderId,
                        status
                )
        );
    }
}