package com.cart.ecom_proj.repo;

import com.cart.ecom_proj.model.Cart;
import com.cart.ecom_proj.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository
        extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUser(User user);

    Optional<Cart> findByUserEmail(String email);
}