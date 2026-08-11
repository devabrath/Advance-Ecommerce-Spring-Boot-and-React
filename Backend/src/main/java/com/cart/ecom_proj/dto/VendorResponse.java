package com.cart.ecom_proj.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VendorResponse {

    private Long vendorId;
    private Long userId;

    private String firstName;
    private String lastName;
    private String email;
    private String phone;

    private String shopName;
    private String description;

    private boolean active;
}