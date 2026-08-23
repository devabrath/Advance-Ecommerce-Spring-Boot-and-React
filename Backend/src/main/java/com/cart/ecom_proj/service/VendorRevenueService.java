package com.cart.ecom_proj.service;

import com.cart.ecom_proj.dto.VendorRevenueResponse;
import com.cart.ecom_proj.model.Order;
import com.cart.ecom_proj.model.OrderItem;
import com.cart.ecom_proj.model.OrderStatus;
import com.cart.ecom_proj.model.PaymentStatus;
import com.cart.ecom_proj.model.User;
import com.cart.ecom_proj.model.Vendor;
import com.cart.ecom_proj.repo.OrderRepository;
import com.cart.ecom_proj.repo.ProductRepo;
import com.cart.ecom_proj.repo.UserRepository;
import com.cart.ecom_proj.repo.VendorRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

@Service
public class VendorRevenueService {

    private final OrderRepository orderRepository;
    private final ProductRepo productRepo;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;


    public VendorRevenueService(
            OrderRepository orderRepository,
            ProductRepo productRepo,
            UserRepository userRepository,
            VendorRepository vendorRepository
    ) {

        this.orderRepository = orderRepository;
        this.productRepo = productRepo;
        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
    }


    // =====================================================
    // MAIN REVENUE
    // =====================================================

    public VendorRevenueResponse getRevenue(
            String period,
            Authentication authentication
    ) {

        Vendor vendor =
                getLoggedInVendor(authentication);


        // =================================================
        // ALL ORDERS
        // =================================================

        List<Order> allOrders =
                orderRepository.findAll();


        // =================================================
        // ONLY ORDERS CONTAINING THIS VENDOR'S PRODUCTS
        // =================================================

        List<Order> vendorOrders =
                allOrders.stream()
                        .filter(order ->
                                containsVendorProduct(
                                        order,
                                        vendor
                                )
                        )
                        .toList();


        // =================================================
        // TOTAL PRODUCTS
        // =================================================

        long totalProducts =
                productRepo.findAll()
                        .stream()
                        .filter(product ->
                                product.getVendor() != null
                                &&
                                product.getVendor()
                                        .getId()
                                        .equals(
                                                vendor.getId()
                                        )
                        )
                        .count();


        // =================================================
        // TOTAL ORDERS
        // =================================================

        long totalOrders =
                vendorOrders.size();


        // =================================================
        // TOTAL REVENUE
        // =================================================

        BigDecimal totalRevenue =
                BigDecimal.ZERO;


        for (Order order : vendorOrders) {

            if (
                    order.getOrderStatus()
                            == OrderStatus.CANCELLED
            ) {

                continue;
            }


            totalRevenue =
                    totalRevenue.add(
                            getVendorOrderAmount(
                                    order,
                                    vendor
                            )
                    );
        }


        // =================================================
        // PENDING ORDERS
        // =================================================

        long pendingOrders =
                vendorOrders.stream()
                        .filter(order ->

                                order.getOrderStatus()
                                        == OrderStatus.PLACED

                                ||

                                order.getOrderStatus()
                                        == OrderStatus.CONFIRMED

                                ||

                                order.getOrderStatus()
                                        == OrderStatus.PROCESSING

                                ||

                                order.getOrderStatus()
                                        == OrderStatus.SHIPPED
                        )
                        .count();


        // =================================================
        // DELIVERED ORDERS
        // =================================================

        long deliveredOrders =
                vendorOrders.stream()
                        .filter(order ->
                                order.getOrderStatus()
                                        == OrderStatus.DELIVERED
                        )
                        .count();


        // =================================================
        // CANCELLED ORDERS
        // =================================================

        long cancelledOrders =
                vendorOrders.stream()
                        .filter(order ->
                                order.getOrderStatus()
                                        == OrderStatus.CANCELLED
                        )
                        .count();


        // =================================================
        // REVENUE CHART
        // =================================================

        List<VendorRevenueResponse.RevenuePoint>
                revenueData;


        if ("week".equalsIgnoreCase(period)) {

            revenueData =
                    buildWeekData(
                            vendorOrders,
                            vendor
                    );

        }

        else if ("year".equalsIgnoreCase(period)) {

            revenueData =
                    buildYearData(
                            vendorOrders,
                            vendor
                    );

        }

        else {

            revenueData =
                    buildMonthData(
                            vendorOrders,
                            vendor
                    );
        }


        // =================================================
        // ORDER ACTIVITY
        // =================================================

        List<VendorRevenueResponse.ActivityPoint>
                orderActivity =
                buildOrderActivity(
                        vendorOrders
                );


        // =================================================
        // PAYMENT ACTIVITY
        // =================================================

        List<VendorRevenueResponse.ActivityPoint>
                paymentActivity =
                buildPaymentActivity(
                        vendorOrders
                );


        // =================================================
        // RESPONSE
        // =================================================

        return new VendorRevenueResponse(

                totalRevenue,

                totalOrders,

                totalProducts,

                pendingOrders,

                deliveredOrders,

                cancelledOrders,

                revenueData,

                orderActivity,

                paymentActivity
        );
    }


    // =====================================================
    // GET LOGGED-IN VENDOR
    // =====================================================

    private Vendor getLoggedInVendor(
            Authentication authentication
    ) {

        if (authentication == null) {

            throw new RuntimeException(
                    "Authentication required"
            );
        }


        String email =
                authentication.getName();


        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );


        return vendorRepository
                .findByUser(user)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Vendor profile not found"
                        )
                );
    }


    // =====================================================
    // CHECK WHETHER ORDER BELONGS TO VENDOR
    // =====================================================

    private boolean containsVendorProduct(
            Order order,
            Vendor vendor
    ) {

        if (order.getItems() == null) {

            return false;
        }


        return order.getItems()
                .stream()
                .anyMatch(item ->

                        item.getProduct() != null

                        &&

                        item.getProduct()
                                .getVendor() != null

                        &&

                        item.getProduct()
                                .getVendor()
                                .getId()
                                .equals(
                                        vendor.getId()
                                )
                );
    }


    // =====================================================
    // CALCULATE VENDOR'S PART OF ORDER
    // =====================================================

    private BigDecimal getVendorOrderAmount(
            Order order,
            Vendor vendor
    ) {

        if (order.getItems() == null) {

            return BigDecimal.ZERO;
        }


        return order.getItems()
                .stream()

                .filter(item ->

                        item.getProduct() != null

                        &&

                        item.getProduct()
                                .getVendor() != null

                        &&

                        item.getProduct()
                                .getVendor()
                                .getId()
                                .equals(
                                        vendor.getId()
                                )
                )

                .map(OrderItem::getTotalPrice)

                .filter(amount ->
                        amount != null
                )

                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );
    }


    // =====================================================
    // WEEK REVENUE
    // =====================================================

    private List<VendorRevenueResponse.RevenuePoint>
    buildWeekData(
            List<Order> orders,
            Vendor vendor
    ) {

        List<VendorRevenueResponse.RevenuePoint>
                result =
                new ArrayList<>();


        LocalDate today =
                LocalDate.now();


        LocalDate monday =
                today.with(
                        TemporalAdjusters.previousOrSame(
                                DayOfWeek.MONDAY
                        )
                );


        for (int i = 0; i < 7; i++) {

            LocalDate date =
                    monday.plusDays(i);


            BigDecimal revenue =
                    BigDecimal.ZERO;


            long orderCount = 0;


            for (Order order : orders) {

                if (order.getCreatedAt() == null) {

                    continue;
                }


                LocalDate orderDate =
                        order.getCreatedAt()
                                .toLocalDate();


                if (!orderDate.equals(date)) {

                    continue;
                }


                orderCount++;


                if (
                        order.getOrderStatus()
                                != OrderStatus.CANCELLED
                ) {

                    revenue =
                            revenue.add(
                                    getVendorOrderAmount(
                                            order,
                                            vendor
                                    )
                            );
                }
            }


            result.add(
                    new VendorRevenueResponse.RevenuePoint(

                            date.getDayOfWeek()
                                    .toString()
                                    .substring(0, 3),

                            revenue,

                            orderCount
                    )
            );
        }


        return result;
    }


    // =====================================================
    // MONTH REVENUE
    // =====================================================

    private List<VendorRevenueResponse.RevenuePoint>
    buildMonthData(
            List<Order> orders,
            Vendor vendor
    ) {

        List<VendorRevenueResponse.RevenuePoint>
                result =
                new ArrayList<>();


        YearMonth currentMonth =
                YearMonth.now();


        for (int week = 1; week <= 5; week++) {

            int startDay =
                    ((week - 1) * 7) + 1;


            if (
                    startDay >
                    currentMonth.lengthOfMonth()
            ) {

                break;
            }


            int endDay =
                    Math.min(
                            startDay + 6,
                            currentMonth.lengthOfMonth()
                    );


            LocalDate start =
                    currentMonth.atDay(
                            startDay
                    );


            LocalDate end =
                    currentMonth.atDay(
                            endDay
                    );


            BigDecimal revenue =
                    BigDecimal.ZERO;


            long orderCount = 0;


            for (Order order : orders) {

                if (order.getCreatedAt() == null) {

                    continue;
                }


                LocalDate date =
                        order.getCreatedAt()
                                .toLocalDate();


                if (
                        date.isBefore(start)
                        ||
                        date.isAfter(end)
                ) {

                    continue;
                }


                orderCount++;


                if (
                        order.getOrderStatus()
                                != OrderStatus.CANCELLED
                ) {

                    revenue =
                            revenue.add(
                                    getVendorOrderAmount(
                                            order,
                                            vendor
                                    )
                            );
                }
            }


            result.add(
                    new VendorRevenueResponse.RevenuePoint(

                            "Week " + week,

                            revenue,

                            orderCount
                    )
            );
        }


        return result;
    }


    // =====================================================
    // YEAR REVENUE
    // =====================================================

    private List<VendorRevenueResponse.RevenuePoint>
    buildYearData(
            List<Order> orders,
            Vendor vendor
    ) {

        List<VendorRevenueResponse.RevenuePoint>
                result =
                new ArrayList<>();


        int year =
                LocalDate.now()
                        .getYear();


        for (
                int month = 1;
                month <= 12;
                month++
        ) {

            BigDecimal revenue =
                    BigDecimal.ZERO;


            long orderCount = 0;


            for (Order order : orders) {

                if (order.getCreatedAt() == null) {

                    continue;
                }


                LocalDateTime createdAt =
                        order.getCreatedAt();


                if (
                        createdAt.getYear()
                                != year
                        ||
                        createdAt.getMonthValue()
                                != month
                ) {

                    continue;
                }


                orderCount++;


                if (
                        order.getOrderStatus()
                                != OrderStatus.CANCELLED
                ) {

                    revenue =
                            revenue.add(
                                    getVendorOrderAmount(
                                            order,
                                            vendor
                                    )
                            );
                }
            }


            String label =
                    YearMonth
                            .of(year, month)
                            .getMonth()
                            .toString()
                            .substring(0, 3);


            result.add(
                    new VendorRevenueResponse.RevenuePoint(

                            label,

                            revenue,

                            orderCount
                    )
            );
        }


        return result;
    }


    // =====================================================
    // ORDER ACTIVITY
    // =====================================================

    private List<VendorRevenueResponse.ActivityPoint>
    buildOrderActivity(
            List<Order> orders
    ) {

        return List.of(

                new VendorRevenueResponse.ActivityPoint(
                        "Placed",
                        countStatus(
                                orders,
                                OrderStatus.PLACED
                        )
                ),

                new VendorRevenueResponse.ActivityPoint(
                        "Confirmed",
                        countStatus(
                                orders,
                                OrderStatus.CONFIRMED
                        )
                ),

                new VendorRevenueResponse.ActivityPoint(
                        "Processing",
                        countStatus(
                                orders,
                                OrderStatus.PROCESSING
                        )
                ),

                new VendorRevenueResponse.ActivityPoint(
                        "Shipped",
                        countStatus(
                                orders,
                                OrderStatus.SHIPPED
                        )
                ),

                new VendorRevenueResponse.ActivityPoint(
                        "Delivered",
                        countStatus(
                                orders,
                                OrderStatus.DELIVERED
                        )
                ),

                new VendorRevenueResponse.ActivityPoint(
                        "Cancelled",
                        countStatus(
                                orders,
                                OrderStatus.CANCELLED
                        )
                )
        );
    }


    // =====================================================
    // PAYMENT ACTIVITY
    // =====================================================

    private List<VendorRevenueResponse.ActivityPoint>
    buildPaymentActivity(
            List<Order> orders
    ) {

        return List.of(

                new VendorRevenueResponse.ActivityPoint(
                        "Success",
                        countPayment(
                                orders,
                                PaymentStatus.SUCCESS
                        )
                ),

                new VendorRevenueResponse.ActivityPoint(
                        "Pending",
                        countPayment(
                                orders,
                                PaymentStatus.PENDING
                        )
                ),

                new VendorRevenueResponse.ActivityPoint(
                        "Failed",
                        countPayment(
                                orders,
                                PaymentStatus.FAILED
                        )
                )
        );
    }


    // =====================================================
    // COUNT ORDER STATUS
    // =====================================================

    private long countStatus(
            List<Order> orders,
            OrderStatus status
    ) {

        return orders.stream()

                .filter(order ->
                        order.getOrderStatus()
                                == status
                )

                .count();
    }


    // =====================================================
    // COUNT PAYMENT STATUS
    // =====================================================

    private long countPayment(
            List<Order> orders,
            PaymentStatus status
    ) {

        return orders.stream()

                .filter(order ->
                        order.getPaymentStatus()
                                == status
                )

                .count();
    }
}