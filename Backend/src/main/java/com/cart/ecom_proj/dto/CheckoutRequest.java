package com.cart.ecom_proj.dto;

import jakarta.validation.constraints.NotNull;

public record CheckoutRequest(
        @NotNull
        Long addressId
) {
}