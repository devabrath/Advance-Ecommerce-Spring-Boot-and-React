package com.cart.ecom_proj.dto;

import com.cart.ecom_proj.model.PaymentMethod;
import jakarta.validation.constraints.NotNull;

public record VerifyPaymentRequest(

        @NotNull
        Long addressId,

        @NotNull
        PaymentMethod paymentMethod,

        @NotNull
        String razorpayOrderId,

        @NotNull
        String razorpayPaymentId,

        @NotNull
        String razorpaySignature

) {
}