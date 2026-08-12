package com.cart.ecom_proj.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String role;
}