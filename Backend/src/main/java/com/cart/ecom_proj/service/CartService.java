package com.cart.ecom_proj.service;

import com.cart.ecom_proj.dto.*;
import com.cart.ecom_proj.model.Cart;
import com.cart.ecom_proj.model.CartItem;
import com.cart.ecom_proj.model.Product;
import com.cart.ecom_proj.model.User;
import com.cart.ecom_proj.repo.CartItemRepository;
import com.cart.ecom_proj.repo.CartRepository;
import com.cart.ecom_proj.repo.ProductRepo;
import com.cart.ecom_proj.repo.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;

@Service
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepo productRepository;
    private final UserRepository userRepository;

    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepo productRepository,
            UserRepository userRepository
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public CartResponse getCart(String email) {

        Cart cart = getOrCreateCart(email);

        return toResponse(cart);
    }

    public CartResponse addItem(
            String email,
            AddCartItemRequest request
    ) {

        Cart cart = getOrCreateCart(email);

        Product product = productRepository
                .findById(request.getProductId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found"
                        )
                );

        if (!product.isProductAvailable()) {
            throw new RuntimeException(
                    "Product is currently unavailable"
            );
        }

        if (request.getQuantity() > product.getStockQuantity()) {
            throw new RuntimeException(
                    "Requested quantity exceeds available stock"
            );
        }

        CartItem item =
                cartItemRepository
                        .findByCartAndProduct(cart, product)
                        .orElse(null);

        if (item == null) {

            item = new CartItem();

            item.setCart(cart);
            item.setProduct(product);
            item.setQuantity(request.getQuantity());
            item.setUnitPrice(product.getPrice());

            cart.getItems().add(item);

        } else {

            int newQuantity =
                    item.getQuantity()
                            + request.getQuantity();

            if (newQuantity > product.getStockQuantity()) {
                throw new RuntimeException(
                        "Requested quantity exceeds available stock"
                );
            }

            item.setQuantity(newQuantity);
            item.setUnitPrice(product.getPrice());
        }

        cartRepository.save(cart);

        return toResponse(cart);
    }

    public CartResponse updateItem(
            String email,
            Long productId,
            UpdateCartItemRequest request
    ) {

        Cart cart = getOrCreateCart(email);

        Product product = productRepository
                .findById(productId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found"
                        )
                );

        CartItem item =
                cartItemRepository
                        .findByCartAndProduct(cart, product)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product is not in cart"
                                )
                        );

        if (request.getQuantity()
                > product.getStockQuantity()) {

            throw new RuntimeException(
                    "Requested quantity exceeds available stock"
            );
        }

        item.setQuantity(request.getQuantity());
        item.setUnitPrice(product.getPrice());

        cartItemRepository.save(item);

        return toResponse(cart);
    }

    public CartResponse removeItem(
            String email,
            Long productId
    ) {

        Cart cart = getOrCreateCart(email);

        Product product = productRepository
                .findById(productId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found"
                        )
                );

        CartItem item =
                cartItemRepository
                        .findByCartAndProduct(cart, product)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product is not in cart"
                                )
                        );

        cart.getItems().remove(item);

        cartItemRepository.delete(item);

        return toResponse(cart);
    }

    private Cart getOrCreateCart(String email) {

        return cartRepository
                .findByUserEmail(email)
                .orElseGet(() -> {

                    User user = userRepository
                            .findByEmail(email)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "User not found"
                                    )
                            );

                    Cart cart = new Cart();

                    cart.setUser(user);
                    cart.setItems(new ArrayList<>());

                    return cartRepository.save(cart);
                });
    }

    private CartResponse toResponse(Cart cart) {

        var items = cart.getItems()
                .stream()
                .map(item -> {

                    Product product =
                            item.getProduct();

                    BigDecimal total =
                            item.getUnitPrice()
                                    .multiply(
                                            BigDecimal.valueOf(
                                                    item.getQuantity()
                                            )
                                    );

                    return new CartItemResponse(
                            item.getId(),
                            product.getId(),
                            product.getName(),
                            product.getImageName(),
                            item.getQuantity(),
                            item.getUnitPrice(),
                            total
                    );
                })
                .toList();

        int totalItems = items.stream()
                .mapToInt(
                        CartItemResponse::getQuantity
                )
                .sum();

        BigDecimal subtotal = items.stream()
                .map(CartItemResponse::getTotalPrice)
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );

        return new CartResponse(
                cart.getId(),
                items,
                totalItems,
                subtotal
        );
    }
}