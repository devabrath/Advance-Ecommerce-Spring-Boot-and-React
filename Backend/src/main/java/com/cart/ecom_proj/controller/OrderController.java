package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.dto.CheckoutRequest;
import com.cart.ecom_proj.dto.OrderResponse;
import com.cart.ecom_proj.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.cart.ecom_proj.dto.CreatePaymentOrderRequest;
import com.cart.ecom_proj.dto.RazorpayOrderResponse;
import com.cart.ecom_proj.dto.VerifyPaymentRequest;
import com.razorpay.RazorpayException;

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
    @GetMapping("/{orderId}")
public ResponseEntity<OrderResponse> getOrder(
        Authentication authentication,
        @PathVariable Long orderId
) {

    return ResponseEntity.ok(
            orderService.getOrder(
                    authentication.getName(),
                    orderId
            )
    );
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
@PutMapping("/{orderId}/cancel")
public ResponseEntity<OrderResponse> cancelOrder(
        Authentication authentication,
        @PathVariable Long orderId
) {

    return ResponseEntity.ok(
            orderService.cancelOrder(
                    authentication.getName(),
                    orderId
            )
    );
}

@PostMapping("/payment/create-order")
public ResponseEntity<RazorpayOrderResponse> createPaymentOrder(
        Authentication authentication,
        @Valid @RequestBody CreatePaymentOrderRequest request
) throws RazorpayException {

    return ResponseEntity.ok(
            orderService.createPaymentOrder(
                    authentication.getName(),
                    request
            )
    );
}


@PostMapping("/payment/verify")
public ResponseEntity<OrderResponse> verifyPayment(
        Authentication authentication,
        @Valid @RequestBody VerifyPaymentRequest request
) throws RazorpayException {

    return ResponseEntity.ok(
            orderService.verifyPaymentAndCreateOrder(
                    authentication.getName(),
                    request
            )
    );
}

}