package com.cart.ecom_proj.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddressRequest {

    @NotBlank
    private String fullName;

    @NotBlank
    private String phone;

    @NotBlank
    private String addressLine;

    @NotBlank
    private String city;

    @NotBlank
    private String state;

    @NotBlank
    private String postalCode;

    private String landmark;

    @NotBlank
    private String addressType;

    private boolean defaultAddress;
}