package com.cart.ecom_proj.repo;

import com.cart.ecom_proj.model.Order;
import com.cart.ecom_proj.model.User;
import com.cart.ecom_proj.model.Vendor;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import com.cart.ecom_proj.model.Vendor;
import org.springframework.data.jpa.repository.Query;

public interface OrderRepository
        extends JpaRepository<Order, Long> {

    List<Order> findByUserOrderByCreatedAtDesc(User user);

    Optional<Order> findByIdAndUser(Long id, User user);
    @Query("""
    SELECT DISTINCT o
    FROM Order o
    JOIN o.items oi
    WHERE oi.product.vendor = :vendor
    ORDER BY o.createdAt DESC
""")
List<Order> findOrdersByVendor(Vendor vendor);
}