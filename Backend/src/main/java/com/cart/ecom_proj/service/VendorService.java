package com.cart.ecom_proj.service;

import com.cart.ecom_proj.dto.VendorRequest;
import com.cart.ecom_proj.dto.VendorResponse;
import com.cart.ecom_proj.model.Role;
import com.cart.ecom_proj.model.User;
import com.cart.ecom_proj.model.Vendor;
import com.cart.ecom_proj.repo.UserRepository;
import com.cart.ecom_proj.repo.VendorRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VendorService {

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final PasswordEncoder passwordEncoder;

    public VendorService(
            UserRepository userRepository,
            VendorRepository vendorRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
        this.passwordEncoder = passwordEncoder;
    }


    // =====================================================
    // CREATE
    // =====================================================

    public VendorResponse createVendor(
            VendorRequest request
    ) {

        if (userRepository.existsByEmail(
                request.getEmail()
        )) {

            throw new RuntimeException(
                    "Email is already registered"
            );
        }


        if (request.getPhone() != null
                && !request.getPhone().isBlank()
                && userRepository.existsByPhone(
                        request.getPhone()
                )) {

            throw new RuntimeException(
                    "Phone number is already registered"
            );
        }


        if (request.getPassword() == null
                || request.getPassword().isBlank()) {

            throw new RuntimeException(
                    "Password is required"
            );
        }


        User user = new User();

        user.setFirstName(
                request.getFirstName()
        );

        user.setLastName(
                request.getLastName()
        );

        user.setEmail(
                request.getEmail()
        );

        user.setPhone(
                request.getPhone()
        );

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setRole(Role.VENDOR);

        user.setEnabled(true);


        User savedUser =
                userRepository.save(user);


        Vendor vendor = new Vendor();

        vendor.setUser(savedUser);

        vendor.setShopName(
                request.getShopName()
        );

        vendor.setDescription(
                request.getDescription()
        );

        vendor.setPhone(
                request.getPhone()
        );

        vendor.setEmail(
                request.getEmail()
        );

        vendor.setActive(true);


        Vendor savedVendor =
                vendorRepository.save(vendor);


        return toResponse(savedVendor);
    }


    // =====================================================
    // GET ALL
    // =====================================================

    public List<VendorResponse>
    getAllVendors() {

        return vendorRepository
                .findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // =====================================================
    // GET ONE
    // =====================================================

    public VendorResponse
    getVendorById(Long id) {

        Vendor vendor =
                vendorRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Vendor not found"
                                )
                        );

        return toResponse(vendor);
    }


    // =====================================================
    // UPDATE
    // =====================================================

    public VendorResponse updateVendor(
            Long id,
            VendorRequest request
    ) {

        Vendor vendor =
                vendorRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Vendor not found"
                                )
                        );


        User user = vendor.getUser();


        // EMAIL CHANGE

        if (!user.getEmail()
                .equalsIgnoreCase(
                        request.getEmail()
                )
                &&
                userRepository.existsByEmail(
                        request.getEmail()
                )) {

            throw new RuntimeException(
                    "Email is already registered"
            );
        }


        // PHONE CHANGE

        if (request.getPhone() != null
                && !request.getPhone().isBlank()
                && !request.getPhone()
                    .equals(user.getPhone())) {

            if (userRepository.existsByPhone(
                    request.getPhone()
            )) {

                throw new RuntimeException(
                        "Phone number is already registered"
                );
            }
        }


        user.setFirstName(
                request.getFirstName()
        );

        user.setLastName(
                request.getLastName()
        );

        user.setEmail(
                request.getEmail()
        );

        user.setPhone(
                request.getPhone()
        );


        // Password is optional during edit

        if (request.getPassword() != null
                && !request.getPassword().isBlank()) {

            user.setPassword(
                    passwordEncoder.encode(
                            request.getPassword()
                    )
            );
        }


        vendor.setShopName(
                request.getShopName()
        );

        vendor.setDescription(
                request.getDescription()
        );

        vendor.setPhone(
                request.getPhone()
        );

        vendor.setEmail(
                request.getEmail()
        );


        userRepository.save(user);

        Vendor savedVendor =
                vendorRepository.save(vendor);


        return toResponse(savedVendor);
    }


    // =====================================================
    // ENABLE / DISABLE
    // =====================================================

    public VendorResponse updateStatus(
            Long id,
            boolean active
    ) {

        Vendor vendor =
                vendorRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Vendor not found"
                                )
                        );


        vendor.setActive(active);

        // Keep login status in sync
        vendor.getUser().setEnabled(active);

        userRepository.save(
                vendor.getUser()
        );


        return toResponse(
                vendorRepository.save(vendor)
        );
    }


    // =====================================================
    // RESPONSE
    // =====================================================

    private VendorResponse toResponse(
            Vendor vendor
    ) {

        User user = vendor.getUser();

        return new VendorResponse(

                vendor.getId(),

                user.getId(),

                user.getFirstName(),

                user.getLastName(),

                user.getEmail(),

                user.getPhone(),

                vendor.getShopName(),

                vendor.getDescription(),

                vendor.isActive()
        );
    }
}