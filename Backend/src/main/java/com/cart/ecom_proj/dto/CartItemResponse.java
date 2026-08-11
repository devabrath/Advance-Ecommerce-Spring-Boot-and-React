package com.cart.ecom_proj.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class CartItemResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String imageName;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}