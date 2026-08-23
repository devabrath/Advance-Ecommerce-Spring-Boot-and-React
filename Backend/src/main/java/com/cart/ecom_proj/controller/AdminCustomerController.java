package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.dto.AdminCustomerRequest;
import com.cart.ecom_proj.dto.AdminCustomerResponse;
import com.cart.ecom_proj.service.AdminCustomerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/customers")
@CrossOrigin
public class AdminCustomerController {

    private final AdminCustomerService customerService;

    public AdminCustomerController(
            AdminCustomerService customerService
    ) {
        this.customerService =
                customerService;
    }


    // GET ALL

    @GetMapping
    public ResponseEntity<List<AdminCustomerResponse>>
    getCustomers() {

        return ResponseEntity.ok(
                customerService.getCustomers()
        );
    }


    // GET ONE

    @GetMapping("/{id}")
    public ResponseEntity<AdminCustomerResponse>
    getCustomer(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                customerService.getCustomer(id)
        );
    }


    // ADD

    @PostMapping
    public ResponseEntity<?> addCustomer(
            @Valid
            @RequestBody
            AdminCustomerRequest request
    ) {

        try {

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            customerService
                                    .addCustomer(request)
                    );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // UPDATE

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomer(
            @PathVariable Long id,

            @Valid
            @RequestBody
            AdminCustomerRequest request
    ) {

        try {

            return ResponseEntity.ok(
                    customerService.updateCustomer(
                            id,
                            request
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // ENABLE / DISABLE

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,

            @RequestParam boolean enabled
    ) {

        try {

            return ResponseEntity.ok(
                    customerService.updateStatus(
                            id,
                            enabled
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}