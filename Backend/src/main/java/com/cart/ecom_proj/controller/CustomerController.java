package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.dto.UserResponse;
import com.cart.ecom_proj.service.CustomerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                customerService.getProfile(
                        authentication.getName()
                )
        );
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            Authentication authentication,
            @RequestParam String firstName,
            @RequestParam String lastName,
            @RequestParam(required = false) String phone
    ) {

        return ResponseEntity.ok(
                customerService.updateProfile(
                        authentication.getName(),
                        firstName,
                        lastName,
                        phone
                )
        );
    }
}