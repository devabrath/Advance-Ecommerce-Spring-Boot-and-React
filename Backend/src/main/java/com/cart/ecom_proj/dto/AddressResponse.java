package com.cart.ecom_proj.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AddressResponse {

    private Long id;
    private String fullName;
    private String phone;
    private String addressLine;
    private String city;
    private String state;
    private String postalCode;
    private String landmark;
    private String addressType;
    private boolean defaultAddress;
}