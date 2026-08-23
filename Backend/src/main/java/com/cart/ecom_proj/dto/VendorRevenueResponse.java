package com.cart.ecom_proj.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class VendorRevenueResponse {

    private BigDecimal totalRevenue;

    private long totalOrders;

    private long totalProducts;

    private long pendingOrders;

    private long deliveredOrders;

    private long cancelledOrders;

    private List<RevenuePoint> revenueData;

    private List<ActivityPoint> orderActivity;

    private List<ActivityPoint> paymentActivity;


    @Data
    @AllArgsConstructor
    public static class RevenuePoint {

        private String label;

        private BigDecimal revenue;

        private long orders;
    }


    @Data
    @AllArgsConstructor
    public static class ActivityPoint {

        private String label;

        private long count;
    }
}