package com.cart.ecom_proj.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class AdminCustomerResponse {

    private Long id;

    private String firstName;
    private String lastName;

    private String email;
    private String phone;

    private boolean enabled;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}