package com.cart.ecom_proj.repo;

import com.cart.ecom_proj.model.Address;
import com.cart.ecom_proj.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AddressRepository
        extends JpaRepository<Address, Long> {

    List<Address> findByUser(User user);

    Optional<Address> findByIdAndUser(
            Long id,
            User user
    );

    boolean existsByUserAndDefaultAddress(
            User user,
            boolean defaultAddress
    );
}