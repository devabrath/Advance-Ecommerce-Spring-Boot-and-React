package com.cart.ecom_proj.dto;

import com.cart.ecom_proj.model.PaymentMethod;
import jakarta.validation.constraints.NotNull;

public record CreatePaymentOrderRequest(
        

        @NotNull
        Long addressId,

        @NotNull
        PaymentMethod paymentMethod

) {
}