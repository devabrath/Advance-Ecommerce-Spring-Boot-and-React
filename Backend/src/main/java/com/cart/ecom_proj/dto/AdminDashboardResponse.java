package com.cart.ecom_proj.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class AdminDashboardResponse {

    private long totalRevenue;

    private long totalOrders;

    private long totalProducts;

    private long totalUsers;

    private long totalVendors;

    private long pendingOrders;

    private List<RevenuePoint> revenueData;

    private List<OrderStatusPoint> orderStatusData;


    // =====================================================
    // REVENUE POINT
    // =====================================================

    @Data
    @AllArgsConstructor
    public static class RevenuePoint {

        private String label;

        private BigDecimal revenue;

        private long orders;
    }


    // =====================================================
    // ORDER STATUS POINT
    // =====================================================

    @Data
    @AllArgsConstructor
    public static class OrderStatusPoint {

        private String label;

        private long placed;

        private long confirmed;

        private long processing;

        private long shipped;

        private long delivered;

        private long cancelled;

        private long paymentSuccess;

        private long paymentPending;

        private long paymentFailed;
    }
}