package com.cart.ecom_proj.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class ProductPageResponse {

    private List<ProductResponse> content;

    private int page;

    private int size;

    private long totalElements;

    private int totalPages;

    private boolean first;

    private boolean last;
}