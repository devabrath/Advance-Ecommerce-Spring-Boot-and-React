package com.cart.ecom_proj.repo;

import com.cart.ecom_proj.model.Order;
import com.cart.ecom_proj.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository
        extends JpaRepository<Order, Long> {

    List<Order> findByUserOrderByCreatedAtDesc(User user);
}