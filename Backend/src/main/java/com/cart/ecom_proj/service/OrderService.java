package com.cart.ecom_proj.service;

import com.cart.ecom_proj.dto.CheckoutRequest;
import com.cart.ecom_proj.dto.OrderItemResponse;
import com.cart.ecom_proj.dto.OrderResponse;
import com.cart.ecom_proj.model.*;
import com.cart.ecom_proj.repo.AddressRepository;
import com.cart.ecom_proj.repo.CartRepository;
import com.cart.ecom_proj.repo.OrderRepository;
import com.cart.ecom_proj.repo.ProductRepo;
import com.cart.ecom_proj.repo.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import com.cart.ecom_proj.exception.BadRequestException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final ProductRepo productRepository;

    public OrderService(
            UserRepository userRepository,
            AddressRepository addressRepository,
            CartRepository cartRepository,
            OrderRepository orderRepository,
            ProductRepo productRepository
    ) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.cartRepository = cartRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }
    

    @Transactional
    public OrderResponse checkout(
            String email,
            CheckoutRequest request
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Address address = addressRepository
                .findByIdAndUser(request.addressId(), user)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Address not found"
                        )
                );

        Cart cart = cartRepository
                .findByUser(user)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Cart not found"
                        )
                );

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException(
                    "Cart is empty"
            );
        }

        /*
         * Validate stock before creating the order.
         */
        for (CartItem cartItem : cart.getItems()) {

            Product product = cartItem.getProduct();

            if (!product.isProductAvailable()) {
                throw new RuntimeException(
                        product.getName()
                                + " is not available"
                );
            }

            if (product.getStockQuantity()
                    < cartItem.getQuantity()) {

                throw new RuntimeException(
                        "Insufficient stock for "
                                + product.getName()
                );
            }
        }

        /*
         * Create order.
         */
        Order order = new Order();

        order.setUser(user);

        order.setOrderStatus(
                OrderStatus.PLACED
        );

        /*
         * Demo payment starts as SUCCESS.
         */
        order.setPaymentStatus(
                PaymentStatus.SUCCESS
        );

        /*
         * Save shipping address snapshot.
         */
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

        /*
         * Convert cart items into order items.
         */
        for (CartItem cartItem : cart.getItems()) {

            Product product = cartItem.getProduct();

            int quantity = cartItem.getQuantity();

            BigDecimal unitPrice =
                    product.getPrice();

            BigDecimal itemTotal =
                    unitPrice.multiply(
                            BigDecimal.valueOf(quantity)
                    );

            OrderItem orderItem = new OrderItem();

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

            /*
             * Reduce stock only after payment succeeds.
             */
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

        /*
         * Clear cart after successful order.
         */
        cart.getItems().clear();

        cartRepository.save(cart);

        return toResponse(savedOrder);
    }

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

        throw new RuntimeException(
                "Order cannot be cancelled after shipping"
        );
    }

    if (order.getOrderStatus() == OrderStatus.CANCELLED) {

        throw new BadRequestException("Order is already cancelled");
    }

    /*
     * Restore stock.
     */
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

    Order savedOrder =
            orderRepository.save(order);

    return toResponse(savedOrder);
}

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
                    new RuntimeException(
                            "Order not found"
                    )
            );

    return toResponse(order);
}

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
public List<OrderResponse> getAllOrders() {

    return orderRepository
            .findAll()
            .stream()
            .map(this::toResponse)
            .toList();
}

public OrderResponse getOrderById(Long orderId) {

    Order order = orderRepository
            .findById(orderId)
            .orElseThrow(() ->
                    new RuntimeException(
                            "Order not found"
                    )
            );

    return toResponse(order);
}

@Transactional
public OrderResponse updateOrderStatus(
        Long orderId,
        OrderStatus newStatus
) {

    Order order = orderRepository
            .findById(orderId)
            .orElseThrow(() ->
                    new RuntimeException(
                            "Order not found"
                    )
            );

    OrderStatus currentStatus =
            order.getOrderStatus();

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