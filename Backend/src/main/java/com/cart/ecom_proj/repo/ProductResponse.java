package com.cart.ecom_proj.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ProductResponse {

    private Long id;

    private String name;

    private String description;

    private String brand;

    private BigDecimal price;

    private Long categoryId;

    private String categoryName;

    private Long vendorId;

    private String shopName;

    private LocalDateTime releaseDate;

    private boolean productAvailable;

    private int stockQuantity;

    private String imageName;

    private String imageType;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}