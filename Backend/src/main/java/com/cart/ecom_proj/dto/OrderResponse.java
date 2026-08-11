package com.cart.ecom_proj.dto;

import com.cart.ecom_proj.model.OrderStatus;
import com.cart.ecom_proj.model.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long orderId,
        BigDecimal totalAmount,
        OrderStatus orderStatus,
        PaymentStatus paymentStatus,
        String shippingFullName,
        String shippingPhone,
        String shippingAddressLine,
        String shippingCity,
        String shippingState,
        String shippingPostalCode,
        String shippingLandmark,
        List<OrderItemResponse> items,
        LocalDateTime createdAt
) {
}