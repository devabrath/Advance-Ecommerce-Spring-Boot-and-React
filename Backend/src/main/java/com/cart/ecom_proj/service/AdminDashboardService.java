package com.cart.ecom_proj.service;

import com.cart.ecom_proj.dto.AdminDashboardResponse;
import com.cart.ecom_proj.model.Order;
import com.cart.ecom_proj.model.OrderStatus;
import com.cart.ecom_proj.model.PaymentStatus;
import com.cart.ecom_proj.model.Role;
import com.cart.ecom_proj.repo.OrderRepository;
import com.cart.ecom_proj.repo.ProductRepo;
import com.cart.ecom_proj.repo.UserRepository;
import com.cart.ecom_proj.repo.VendorRepository;

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
public class AdminDashboardService {

    private final ProductRepo productRepo;

    private final OrderRepository orderRepository;

    private final UserRepository userRepository;

    private final VendorRepository vendorRepository;


    public AdminDashboardService(
            ProductRepo productRepo,
            OrderRepository orderRepository,
            UserRepository userRepository,
            VendorRepository vendorRepository
    ) {

        this.productRepo = productRepo;

        this.orderRepository = orderRepository;

        this.userRepository = userRepository;

        this.vendorRepository = vendorRepository;
    }


    // =====================================================
    // MAIN DASHBOARD
    // =====================================================

    public AdminDashboardResponse getDashboard(
            String period
    ) {

        // =================================================
        // BASIC COUNTS
        // =================================================

        long totalProducts =
                productRepo.count();


        List<Order> orders =
                orderRepository.findAll();


        long totalOrders =
                orders.size();


        long totalUsers =
                userRepository
                        .findAll()
                        .stream()
                        .filter(user ->
                                user.getRole()
                                        == Role.CUSTOMER
                        )
                        .count();


        long totalVendors =
                vendorRepository.count();


        // =================================================
        // TOTAL REVENUE
        // =================================================

        BigDecimal totalRevenue =
                orders.stream()
                        .filter(order ->
                                order.getOrderStatus()
                                        != OrderStatus.CANCELLED
                        )
                        .map(Order::getTotalAmount)
                        .filter(amount ->
                                amount != null
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );


        // =================================================
        // PENDING ORDERS
        // =================================================

        long pendingOrders =
                orders.stream()
                        .filter(order ->

                                order.getOrderStatus()
                                        == OrderStatus.PLACED

                                ||

                                order.getOrderStatus()
                                        == OrderStatus.CONFIRMED
                        )
                        .count();


        // =================================================
        // REVENUE DATA
        // =================================================

        List<AdminDashboardResponse.RevenuePoint>
                revenueData;


        if ("week".equalsIgnoreCase(period)) {

            revenueData =
                    buildWeekData(orders);

        }

        else if ("year".equalsIgnoreCase(period)) {

            revenueData =
                    buildYearData(orders);

        }

        else {

            revenueData =
                    buildMonthData(orders);
        }


        // =================================================
        // ORDER STATUS DATA
        // =================================================

        List<AdminDashboardResponse.OrderStatusPoint>
                orderStatusData;


        if ("week".equalsIgnoreCase(period)) {

            orderStatusData =
                    buildOrderStatusWeekData(
                            orders
                    );

        }

        else if ("year".equalsIgnoreCase(period)) {

            orderStatusData =
                    buildOrderStatusYearData(
                            orders
                    );

        }

        else {

            orderStatusData =
                    buildOrderStatusMonthData(
                            orders
                    );
        }


        // =================================================
        // RESPONSE
        // =================================================

        return new AdminDashboardResponse(

                totalRevenue.longValue(),

                totalOrders,

                totalProducts,

                totalUsers,

                totalVendors,

                pendingOrders,

                revenueData,

                orderStatusData
        );
    }


    // =====================================================
    // REVENUE - WEEK
    // =====================================================

    private List<AdminDashboardResponse.RevenuePoint>
    buildWeekData(
            List<Order> orders
    ) {

        List<AdminDashboardResponse.RevenuePoint>
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


                if (orderDate.equals(date)) {

                    orderCount++;


                    if (
                            order.getOrderStatus()
                                    != OrderStatus.CANCELLED
                            &&
                            order.getTotalAmount()
                                    != null
                    ) {

                        revenue =
                                revenue.add(
                                        order.getTotalAmount()
                                );
                    }
                }
            }


            result.add(
                    new AdminDashboardResponse.RevenuePoint(

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
    // REVENUE - MONTH
    // =====================================================

    private List<AdminDashboardResponse.RevenuePoint>
    buildMonthData(
            List<Order> orders
    ) {

        List<AdminDashboardResponse.RevenuePoint>
                result =
                new ArrayList<>();


        YearMonth currentMonth =
                YearMonth.now();


        for (int week = 1; week <= 5; week++) {

            BigDecimal revenue =
                    BigDecimal.ZERO;


            long orderCount = 0;


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


            for (Order order : orders) {

                if (order.getCreatedAt() == null) {
                    continue;
                }


                LocalDate date =
                        order.getCreatedAt()
                                .toLocalDate();


                if (
                        !date.isBefore(start)
                        &&
                        !date.isAfter(end)
                ) {

                    orderCount++;


                    if (
                            order.getOrderStatus()
                                    != OrderStatus.CANCELLED
                            &&
                            order.getTotalAmount()
                                    != null
                    ) {

                        revenue =
                                revenue.add(
                                        order.getTotalAmount()
                                );
                    }
                }
            }


            result.add(
                    new AdminDashboardResponse.RevenuePoint(

                            "Week " + week,

                            revenue,

                            orderCount
                    )
            );
        }


        return result;
    }


    // =====================================================
    // REVENUE - YEAR
    // =====================================================

    private List<AdminDashboardResponse.RevenuePoint>
    buildYearData(
            List<Order> orders
    ) {

        List<AdminDashboardResponse.RevenuePoint>
                result =
                new ArrayList<>();


        int year =
                LocalDate.now().getYear();


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
                                == year

                        &&

                        createdAt.getMonthValue()
                                == month
                ) {

                    orderCount++;


                    if (
                            order.getOrderStatus()
                                    != OrderStatus.CANCELLED
                            &&
                            order.getTotalAmount()
                                    != null
                    ) {

                        revenue =
                                revenue.add(
                                        order.getTotalAmount()
                                );
                    }
                }
            }


            String label =
                    YearMonth
                            .of(year, month)
                            .getMonth()
                            .toString()
                            .substring(0, 3);


            result.add(
                    new AdminDashboardResponse.RevenuePoint(

                            label,

                            revenue,

                            orderCount
                    )
            );
        }


        return result;
    }


    // =====================================================
    // ORDER STATUS - WEEK
    // =====================================================

    private List<AdminDashboardResponse.OrderStatusPoint>
    buildOrderStatusWeekData(
            List<Order> orders
    ) {

        List<AdminDashboardResponse.OrderStatusPoint>
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


            result.add(
                    buildStatusPoint(
                            orders,
                            date,
                            date,
                            date.getDayOfWeek()
                                    .toString()
                                    .substring(0, 3)
                    )
            );
        }


        return result;
    }


    // =====================================================
    // ORDER STATUS - MONTH
    // =====================================================

    private List<AdminDashboardResponse.OrderStatusPoint>
    buildOrderStatusMonthData(
            List<Order> orders
    ) {

        List<AdminDashboardResponse.OrderStatusPoint>
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


            result.add(
                    buildStatusPoint(
                            orders,
                            start,
                            end,
                            "Week " + week
                    )
            );
        }


        return result;
    }


    // =====================================================
    // ORDER STATUS - YEAR
    // =====================================================

    private List<AdminDashboardResponse.OrderStatusPoint>
    buildOrderStatusYearData(
            List<Order> orders
    ) {

        List<AdminDashboardResponse.OrderStatusPoint>
                result =
                new ArrayList<>();


        int year =
                LocalDate.now().getYear();


        for (
                int month = 1;
                month <= 12;
                month++
        ) {

            YearMonth yearMonth =
                    YearMonth.of(
                            year,
                            month
                    );


            LocalDate start =
                    yearMonth.atDay(1);


            LocalDate end =
                    yearMonth.atEndOfMonth();


            String label =
                    yearMonth
                            .getMonth()
                            .toString()
                            .substring(0, 3);


            result.add(
                    buildStatusPoint(
                            orders,
                            start,
                            end,
                            label
                    )
            );
        }


        return result;
    }


    // =====================================================
    // BUILD STATUS POINT
    // =====================================================

    private AdminDashboardResponse.OrderStatusPoint
    buildStatusPoint(

            List<Order> orders,

            LocalDate start,

            LocalDate end,

            String label
    ) {

        long placed = 0;

        long confirmed = 0;

        long processing = 0;

        long shipped = 0;

        long delivered = 0;

        long cancelled = 0;

        long paymentSuccess = 0;

        long paymentPending = 0;

        long paymentFailed = 0;


        for (Order order : orders) {

            if (order.getCreatedAt() == null) {
                continue;
            }


            LocalDate orderDate =
                    order.getCreatedAt()
                            .toLocalDate();


            if (
                    orderDate.isBefore(start)
                    ||
                    orderDate.isAfter(end)
            ) {

                continue;
            }


            // =============================================
            // ORDER STATUS
            // =============================================

            if (order.getOrderStatus()
                    == OrderStatus.PLACED) {

                placed++;

            }

            else if (
                    order.getOrderStatus()
                            == OrderStatus.CONFIRMED
            ) {

                confirmed++;

            }

            else if (
                    order.getOrderStatus()
                            == OrderStatus.PROCESSING
            ) {

                processing++;

            }

            else if (
                    order.getOrderStatus()
                            == OrderStatus.SHIPPED
            ) {

                shipped++;

            }

            else if (
                    order.getOrderStatus()
                            == OrderStatus.DELIVERED
            ) {

                delivered++;

            }

            else if (
                    order.getOrderStatus()
                            == OrderStatus.CANCELLED
            ) {

                cancelled++;
            }


            // =============================================
            // PAYMENT STATUS
            // =============================================

            if (
                    order.getPaymentStatus()
                            == PaymentStatus.SUCCESS
            ) {

                paymentSuccess++;

            }

            else if (
                    order.getPaymentStatus()
                            == PaymentStatus.PENDING
            ) {

                paymentPending++;

            }

            else if (
                    order.getPaymentStatus()
                            == PaymentStatus.FAILED
            ) {

                paymentFailed++;
            }
        }


        return new AdminDashboardResponse.OrderStatusPoint(

                label,

                placed,

                confirmed,

                processing,

                shipped,

                delivered,

                cancelled,

                paymentSuccess,

                paymentPending,

                paymentFailed
        );
    }
}