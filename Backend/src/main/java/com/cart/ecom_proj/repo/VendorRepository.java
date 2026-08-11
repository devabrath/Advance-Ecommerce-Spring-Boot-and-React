package com.cart.ecom_proj.repo;

import com.cart.ecom_proj.model.User;
import com.cart.ecom_proj.model.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VendorRepository
        extends JpaRepository<Vendor, Long> {

    Optional<Vendor> findByUser(User user);

    Optional<Vendor> findByUserEmail(String email);

    boolean existsByUser(User user);
}