package com.cart.ecom_proj.service;

import com.cart.ecom_proj.dto.CheckoutRequest;
import com.cart.ecom_proj.dto.CreatePaymentOrderRequest;
import com.cart.ecom_proj.dto.OrderItemResponse;
import com.cart.ecom_proj.dto.OrderResponse;
import com.cart.ecom_proj.dto.RazorpayOrderResponse;
import com.cart.ecom_proj.dto.VerifyPaymentRequest;
import com.cart.ecom_proj.exception.BadRequestException;
import com.cart.ecom_proj.model.*;
import com.cart.ecom_proj.repo.AddressRepository;
import com.cart.ecom_proj.repo.CartRepository;
import com.cart.ecom_proj.repo.OrderRepository;
import com.cart.ecom_proj.repo.ProductRepo;
import com.cart.ecom_proj.repo.UserRepository;
import com.cart.ecom_proj.repo.VendorRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import jakarta.transaction.Transactional;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final VendorRepository vendorRepository;
    private final ProductRepo productRepository;
    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;


    public OrderService(
            UserRepository userRepository,
            AddressRepository addressRepository,
            CartRepository cartRepository,
            OrderRepository orderRepository,
            ProductRepo productRepository,
            VendorRepository vendorRepository,
            RazorpayClient razorpayClient
    ) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.cartRepository = cartRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.vendorRepository = vendorRepository;
        this.razorpayClient = razorpayClient;
    }


    // =====================================================
    // CREATE RAZORPAY PAYMENT ORDER
    // =====================================================

    @Transactional
    public RazorpayOrderResponse createPaymentOrder(
            String email,
            CreatePaymentOrderRequest request
    ) throws RazorpayException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Address address = addressRepository
                .findByIdAndUser(request.addressId(), user)
                .orElseThrow(() ->
                        new RuntimeException("Address not found")
                );

        Cart cart = cartRepository
                .findByUser(user)
                .orElseThrow(() ->
                        new RuntimeException("Cart not found")
                );

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        BigDecimal total = BigDecimal.ZERO;

        // Validate stock and calculate the amount on the server
        for (CartItem cartItem : cart.getItems()) {

            Product product = cartItem.getProduct();

            if (!product.isProductAvailable()) {
                throw new BadRequestException(
                        product.getName() + " is not available"
                );
            }

            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new BadRequestException(
                        "Insufficient stock for " + product.getName()
                );
            }

            BigDecimal itemTotal = product.getPrice()
                    .multiply(
                            BigDecimal.valueOf(cartItem.getQuantity())
                    );

            total = total.add(itemTotal);
        }

        // Razorpay amount must be in paise
        long amountInPaise = total
                .multiply(BigDecimal.valueOf(100))
                .longValueExact();

        JSONObject orderRequest = new JSONObject();

        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put(
                "receipt",
                "receipt_" + System.currentTimeMillis()
        );

        com.razorpay.Order razorpayOrder =
                razorpayClient.orders.create(orderRequest);

        return new RazorpayOrderResponse(
                razorpayOrder.get("id"),
                razorpayKeyId,
                total,
                razorpayOrder.get("currency")
        );
    }


    // =====================================================
    // VERIFY RAZORPAY PAYMENT AND CREATE DATABASE ORDER
    // =====================================================

    @Transactional
    public OrderResponse verifyPaymentAndCreateOrder(
            String email,
            VerifyPaymentRequest request
    ) throws RazorpayException {

        JSONObject options = new JSONObject();

        options.put(
                "razorpay_order_id",
                request.razorpayOrderId()
        );

        options.put(
                "razorpay_payment_id",
                request.razorpayPaymentId()
        );

        options.put(
                "razorpay_signature",
                request.razorpaySignature()
        );

        boolean isValid = Utils.verifyPaymentSignature(
                options,
                razorpayKeySecret
        );

        if (!isValid) {
            throw new BadRequestException(
                    "Payment verification failed"
            );
        }

        /*
         * Signature is valid.
         * The payment is considered successful, so now
         * create the real database order.
         */
        return createOrder(
            email,
            new CheckoutRequest(
                    request.addressId(),
                    request.paymentMethod()
            ),
            true);
    }


    // =====================================================
    // CREATE ACTUAL DATABASE ORDER
    // =====================================================

//     @Transactional
//     public OrderResponse checkout(
//             String email,
//             CheckoutRequest request
//     ) {

//         User user = userRepository.findByEmail(email)
//                 .orElseThrow(() ->
//                         new RuntimeException("User not found")
//                 );

//         Address address = addressRepository
//                 .findByIdAndUser(
//                         request.addressId(),
//                         user
//                 )
//                 .orElseThrow(() ->
//                         new RuntimeException("Address not found")
//                 );

//         Cart cart = cartRepository
//                 .findByUser(user)
//                 .orElseThrow(() ->
//                         new RuntimeException("Cart not found")
//                 );

//         if (cart.getItems().isEmpty()) {
//             throw new BadRequestException("Cart is empty");
//         }


//         // =================================================
//         // VALIDATE STOCK AGAIN
//         // =================================================

//         for (CartItem cartItem : cart.getItems()) {

//             Product product = cartItem.getProduct();

//             if (!product.isProductAvailable()) {
//                 throw new BadRequestException(
//                         product.getName() + " is not available"
//                 );
//             }

//             if (product.getStockQuantity()
//                     < cartItem.getQuantity()) {

//                 throw new BadRequestException(
//                         "Insufficient stock for "
//                                 + product.getName()
//                 );
//             }
//         }


//         // =================================================
//         // CREATE ORDER
//         // =================================================

//         Order order = new Order();

//         order.setUser(user);

//         order.setOrderStatus(OrderStatus.PLACED);
//         order.setPaymentMethod(
//         request.paymentMethod()
// );

//         if (request.paymentMethod() == PaymentMethod.COD) {

//         order.setPaymentStatus(
//                 PaymentStatus.PENDING
//         );

//         } else {

//         order.setPaymentStatus(
//                 PaymentStatus.SUCCESS
//         );
//         }

//         // order.setPaymentMethod(
//         //         request.paymentMethod()
//         // );


//         // =================================================
//         // SAVE SHIPPING ADDRESS SNAPSHOT
//         // =================================================

//         order.setShippingFullName(address.getFullName());
//         order.setShippingPhone(address.getPhone());
//         order.setShippingAddressLine(address.getAddressLine());
//         order.setShippingCity(address.getCity());
//         order.setShippingState(address.getState());
//         order.setShippingPostalCode(address.getPostalCode());
//         order.setShippingLandmark(address.getLandmark());
//         order.setShippingAddressType(address.getAddressType());


//         BigDecimal total = BigDecimal.ZERO;


//         // =================================================
//         // CONVERT CART ITEMS TO ORDER ITEMS
//         // =================================================

//         for (CartItem cartItem : cart.getItems()) {

//             Product product = cartItem.getProduct();

//             int quantity = cartItem.getQuantity();

//             BigDecimal unitPrice = product.getPrice();

//             BigDecimal itemTotal = unitPrice.multiply(
//                     BigDecimal.valueOf(quantity)
//             );

//             OrderItem orderItem = new OrderItem();

//             orderItem.setOrder(order);
//             orderItem.setProduct(product);
//             orderItem.setProductName(product.getName());
//             orderItem.setUnitPrice(unitPrice);
//             orderItem.setQuantity(quantity);
//             orderItem.setTotalPrice(itemTotal);

//             order.getItems().add(orderItem);

//             total = total.add(itemTotal);


//             // Reduce stock only after successful payment
//             product.setStockQuantity(
//                     product.getStockQuantity() - quantity
//             );

//             if (product.getStockQuantity() == 0) {
//                 product.setProductAvailable(false);
//             }

//             productRepository.save(product);
//         }


//         // =================================================
//         // SAVE ORDER
//         // =================================================

//         order.setTotalAmount(total);

//         Order savedOrder = orderRepository.save(order);


//         // =================================================
//         // CLEAR CART AFTER SUCCESSFUL ORDER
//         // =================================================

//         cart.getItems().clear();

//         cartRepository.save(cart);

//         return toResponse(savedOrder);
//     }



        @Transactional
        public OrderResponse checkout(
                String email,
                CheckoutRequest request
        ) {
        return createOrder(
                email,
                request,
                false
        );
        }
        @Transactional
private OrderResponse createOrder(
        String email,
        CheckoutRequest request,
        boolean paymentVerified
) {

    if (
            request.paymentMethod() != PaymentMethod.COD
            && !paymentVerified
    ) {

        throw new BadRequestException(
                "Online payments must be completed through Razorpay"
        );
    }

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found")
            );

    Address address = addressRepository
            .findByIdAndUser(
                    request.addressId(),
                    user
            )
            .orElseThrow(() ->
                    new RuntimeException("Address not found")
            );

    Cart cart = cartRepository
            .findByUser(user)
            .orElseThrow(() ->
                    new RuntimeException("Cart not found")
            );

    if (cart.getItems().isEmpty()) {

        throw new BadRequestException(
                "Cart is empty"
        );
    }

    for (CartItem cartItem : cart.getItems()) {

        Product product = cartItem.getProduct();

        if (!product.isProductAvailable()) {

            throw new BadRequestException(
                    product.getName() + " is not available"
            );
        }

        if (
                product.getStockQuantity()
                        < cartItem.getQuantity()
        ) {

            throw new BadRequestException(
                    "Insufficient stock for "
                            + product.getName()
            );
        }
    }

    Order order = new Order();

    order.setUser(user);

    order.setOrderStatus(
            OrderStatus.PLACED
    );

    order.setPaymentMethod(
            request.paymentMethod()
    );

    if (request.paymentMethod() == PaymentMethod.COD) {

        order.setPaymentStatus(
                PaymentStatus.PENDING
        );

    } else {

        order.setPaymentStatus(
                PaymentStatus.SUCCESS
        );
    }

    order.setShippingFullName(
            address.getFullName()
    );

    order.setShippingPhone(
            address.getPhone()
    );

    order.setShippingAddressLine(
            address.getAddressLine()
    );

    order.setShippingCity(
            address.getCity()
    );

    order.setShippingState(
            address.getState()
    );

    order.setShippingPostalCode(
            address.getPostalCode()
    );

    order.setShippingLandmark(
            address.getLandmark()
    );

    order.setShippingAddressType(
            address.getAddressType()
    );

    BigDecimal total = BigDecimal.ZERO;

    for (CartItem cartItem : cart.getItems()) {

        Product product = cartItem.getProduct();

        int quantity =
                cartItem.getQuantity();

        BigDecimal unitPrice =
                product.getPrice();

        BigDecimal itemTotal =
                unitPrice.multiply(
                        BigDecimal.valueOf(quantity)
                );

        OrderItem orderItem =
                new OrderItem();

        orderItem.setOrder(order);

        orderItem.setProduct(product);

        orderItem.setProductName(
                product.getName()
        );

        orderItem.setUnitPrice(
                unitPrice
        );

        orderItem.setQuantity(
                quantity
        );

        orderItem.setTotalPrice(
                itemTotal
        );

        order.getItems().add(orderItem);

        total = total.add(itemTotal);

        product.setStockQuantity(
                product.getStockQuantity()
                        - quantity
        );

        if (product.getStockQuantity() == 0) {

            product.setProductAvailable(false);
        }

        productRepository.save(product);
    }

    order.setTotalAmount(total);

    Order savedOrder =
            orderRepository.save(order);

    cart.getItems().clear();

    cartRepository.save(cart);

    return toResponse(savedOrder);
}
                
    // =====================================================
    // CANCEL CUSTOMER ORDER
    // =====================================================

    @Transactional
    public OrderResponse cancelOrder(
            String email,
            Long orderId
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Order order = orderRepository
                .findByIdAndUser(orderId, user)
                .orElseThrow(() ->
                        new RuntimeException("Order not found")
                );

        if (order.getOrderStatus() == OrderStatus.SHIPPED
                || order.getOrderStatus() == OrderStatus.DELIVERED) {

            throw new BadRequestException(
                    "Order cannot be cancelled after shipping"
            );
        }

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException(
                    "Order is already cancelled"
            );
        }


        // Restore stock
        for (OrderItem item : order.getItems()) {

            Product product = item.getProduct();

            product.setStockQuantity(
                    product.getStockQuantity()
                            + item.getQuantity()
            );

            product.setProductAvailable(true);

            productRepository.save(product);
        }

        order.setOrderStatus(OrderStatus.CANCELLED);

        Order savedOrder = orderRepository.save(order);

        return toResponse(savedOrder);
    }


    // =====================================================
    // GET SINGLE CUSTOMER ORDER
    // =====================================================

    public OrderResponse getOrder(
            String email,
            Long orderId
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Order order = orderRepository
                .findByIdAndUser(orderId, user)
                .orElseThrow(() ->
                        new RuntimeException("Order not found")
                );

        return toResponse(order);
    }


    // =====================================================
    // GET MY ORDERS
    // =====================================================

    public List<OrderResponse> getMyOrders(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        return orderRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // =====================================================
    // GET ALL ORDERS
    // =====================================================

    public List<OrderResponse> getAllOrders() {

        return orderRepository
                .findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // =====================================================
    // GET ORDER BY ID
    // =====================================================

    public OrderResponse getOrderById(Long orderId) {

        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found")
                );

        return toResponse(order);
    }


    // =====================================================
    // GET VENDOR ORDERS
    // =====================================================

    public List<OrderResponse> getVendorOrders(
            String email
    ) {

        Vendor vendor = vendorRepository
                .findByUserEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Vendor account not found"
                        )
                );

        return orderRepository
                .findOrdersByVendor(vendor)
                .stream()
                .map(order ->
                        toVendorResponse(order, vendor)
                )
                .toList();
    }


    // =====================================================
    // VENDOR RESPONSE
    // =====================================================

    private OrderResponse toVendorResponse(
            Order order,
            Vendor vendor
    ) {

        List<OrderItemResponse> items =
                order.getItems()
                        .stream()
                        .filter(item ->
                                item.getProduct()
                                        .getVendor()
                                        .getId()
                                        .equals(vendor.getId())
                        )
                        .map(item ->
                                new OrderItemResponse(
                                        item.getProduct().getId(),
                                        item.getProductName(),
                                        item.getUnitPrice(),
                                        item.getQuantity(),
                                        item.getTotalPrice()
                                )
                        )
                        .toList();

        BigDecimal vendorTotal =
                items.stream()
                        .map(OrderItemResponse::totalPrice)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        return new OrderResponse(
                order.getId(),
                vendorTotal,
                order.getOrderStatus(),
                order.getPaymentStatus(),
                order.getPaymentMethod(),
                order.getShippingFullName(),
                order.getShippingPhone(),
                order.getShippingAddressLine(),
                order.getShippingCity(),
                order.getShippingState(),
                order.getShippingPostalCode(),
                order.getShippingLandmark(),
                items,
                order.getCreatedAt()
        );
    }


    // =====================================================
    // UPDATE VENDOR ORDER STATUS
    // =====================================================

    @Transactional
    public OrderResponse updateVendorOrderStatus(
            String email,
            Long orderId,
            OrderStatus newStatus
    ) {

        Vendor vendor = vendorRepository
                .findByUserEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Vendor account not found"
                        )
                );

        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found")
                );

        boolean belongsToVendor =
                order.getItems()
                        .stream()
                        .anyMatch(item ->
                                item.getProduct()
                                        .getVendor()
                                        .getId()
                                        .equals(vendor.getId())
                        );

        if (!belongsToVendor) {
            throw new BadRequestException(
                    "You are not authorized to update this order"
            );
        }

        validateOrderStatusTransition(
                order.getOrderStatus(),
                newStatus
        );

        order.setOrderStatus(newStatus);

        Order savedOrder =
                orderRepository.save(order);

        return toVendorResponse(
                savedOrder,
                vendor
        );
    }


    // =====================================================
    // UPDATE ADMIN ORDER STATUS
    // =====================================================

    @Transactional
    public OrderResponse updateOrderStatus(
            Long orderId,
            OrderStatus newStatus
    ) {

        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found")
                );

        OrderStatus currentStatus =
                order.getOrderStatus();

        validateOrderStatusTransition(
                currentStatus,
                newStatus
        );


        // Restore stock if admin cancels
        if (newStatus == OrderStatus.CANCELLED) {

            for (OrderItem item : order.getItems()) {

                Product product = item.getProduct();

                product.setStockQuantity(
                        product.getStockQuantity()
                                + item.getQuantity()
                );

                product.setProductAvailable(true);

                productRepository.save(product);
            }
        }

        order.setOrderStatus(newStatus);

        Order savedOrder =
                orderRepository.save(order);

        return toResponse(savedOrder);
    }


    // =====================================================
    // VALIDATE ORDER STATUS TRANSITIONS
    // =====================================================

    private void validateOrderStatusTransition(
            OrderStatus currentStatus,
            OrderStatus newStatus
    ) {

        if (currentStatus == OrderStatus.CANCELLED) {
            throw new BadRequestException(
                    "Cancelled order cannot be updated"
            );
        }

        if (currentStatus == OrderStatus.DELIVERED) {
            throw new BadRequestException(
                    "Delivered order cannot be updated"
            );
        }

        if (newStatus == OrderStatus.PLACED) {
            throw new BadRequestException(
                    "Cannot move order back to PLACED"
            );
        }

        if (newStatus == OrderStatus.CONFIRMED
                && currentStatus != OrderStatus.PLACED) {

            throw new BadRequestException(
                    "Only PLACED orders can be confirmed"
            );
        }

        if (newStatus == OrderStatus.SHIPPED
                && currentStatus != OrderStatus.CONFIRMED) {

            throw new BadRequestException(
                    "Only CONFIRMED orders can be shipped"
            );
        }

        if (newStatus == OrderStatus.DELIVERED
                && currentStatus != OrderStatus.SHIPPED) {

            throw new BadRequestException(
                    "Only SHIPPED orders can be delivered"
            );
        }
    }


    // =====================================================
    // CONVERT ORDER TO RESPONSE
    // =====================================================

    private OrderResponse toResponse(Order order) {

        List<OrderItemResponse> items =
                order.getItems()
                        .stream()
                        .map(item ->
                                new OrderItemResponse(
                                        item.getProduct().getId(),
                                        item.getProductName(),
                                        item.getUnitPrice(),
                                        item.getQuantity(),
                                        item.getTotalPrice()
                                )
                        )
                        .toList();

        return new OrderResponse(
                order.getId(),
                order.getTotalAmount(),
                order.getOrderStatus(),
                order.getPaymentStatus(),
                order.getPaymentMethod(),
                order.getShippingFullName(),
                order.getShippingPhone(),
                order.getShippingAddressLine(),
                order.getShippingCity(),
                order.getShippingState(),
                order.getShippingPostalCode(),
                order.getShippingLandmark(),
                items,
                order.getCreatedAt()
        );
    }
}