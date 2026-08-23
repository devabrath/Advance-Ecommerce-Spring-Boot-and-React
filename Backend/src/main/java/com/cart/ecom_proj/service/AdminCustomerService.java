package com.cart.ecom_proj.service;

import com.cart.ecom_proj.dto.AdminCustomerRequest;
import com.cart.ecom_proj.dto.AdminCustomerResponse;
import com.cart.ecom_proj.model.Role;
import com.cart.ecom_proj.model.User;
import com.cart.ecom_proj.repo.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminCustomerService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminCustomerService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }


    // =========================
    // GET CUSTOMERS
    // =========================

    public List<AdminCustomerResponse>
    getCustomers() {

        return userRepository
                .findByRole(Role.CUSTOMER)
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // =========================
    // GET CUSTOMER
    // =========================

    public AdminCustomerResponse
    getCustomer(Long id) {

        User user =
                userRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found"
                                )
                        );

        if (user.getRole() != Role.CUSTOMER) {
            throw new RuntimeException(
                    "User is not a customer"
            );
        }

        return toResponse(user);
    }


    // =========================
    // ADD CUSTOMER
    // =========================

    public AdminCustomerResponse
    addCustomer(
            AdminCustomerRequest request
    ) {

        if (userRepository
                .existsByEmail(request.getEmail())) {

            throw new RuntimeException(
                    "Email already exists"
            );
        }


        if (request.getPhone() != null
                && !request.getPhone().isBlank()
                && userRepository
                .existsByPhone(request.getPhone())) {

            throw new RuntimeException(
                    "Phone number already exists"
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

        user.setRole(
                Role.CUSTOMER
        );

        user.setEnabled(true);


        return toResponse(
                userRepository.save(user)
        );
    }


    // =========================
    // UPDATE CUSTOMER
    // =========================

    public AdminCustomerResponse
    updateCustomer(
            Long id,
            AdminCustomerRequest request
    ) {

        User user =
                userRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found"
                                )
                        );


        if (user.getRole() != Role.CUSTOMER) {

            throw new RuntimeException(
                    "User is not a customer"
            );
        }


        if (!user.getEmail()
                .equalsIgnoreCase(
                        request.getEmail()
                )
                &&
                userRepository.existsByEmail(
                        request.getEmail()
                )) {

            throw new RuntimeException(
                    "Email already exists"
            );
        }


        if (request.getPhone() != null
                && !request.getPhone().isBlank()
                && !request.getPhone()
                    .equals(user.getPhone())) {

            if (userRepository.existsByPhone(
                    request.getPhone()
            )) {

                throw new RuntimeException(
                        "Phone number already exists"
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


        // Password only changes if provided

        if (request.getPassword() != null
                && !request.getPassword().isBlank()) {

            user.setPassword(
                    passwordEncoder.encode(
                            request.getPassword()
                    )
            );
        }


        return toResponse(
                userRepository.save(user)
        );
    }


    // =========================
    // ENABLE / DISABLE
    // =========================

    public AdminCustomerResponse
    updateStatus(
            Long id,
            boolean enabled
    ) {

        User user =
                userRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found"
                                )
                        );


        if (user.getRole() != Role.CUSTOMER) {

            throw new RuntimeException(
                    "User is not a customer"
            );
        }


        user.setEnabled(enabled);


        return toResponse(
                userRepository.save(user)
        );
    }


    // =========================
    // RESPONSE
    // =========================

    private AdminCustomerResponse
    toResponse(User user) {

        return new AdminCustomerResponse(

                user.getId(),

                user.getFirstName(),

                user.getLastName(),

                user.getEmail(),

                user.getPhone(),

                user.isEnabled(),

                user.getCreatedAt(),

                user.getUpdatedAt()
        );
    }
}