package com.cart.ecom_proj.dto;

import java.math.BigDecimal;

public record RazorpayOrderResponse(
        String razorpayOrderId,
        String keyId,
        BigDecimal amount,
        String currency
) {
}