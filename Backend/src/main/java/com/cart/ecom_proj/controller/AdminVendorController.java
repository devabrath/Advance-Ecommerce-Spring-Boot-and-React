package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.dto.VendorRequest;
import com.cart.ecom_proj.dto.VendorResponse;
import com.cart.ecom_proj.service.VendorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/vendors")
@CrossOrigin
public class AdminVendorController {

    private final VendorService vendorService;

    public AdminVendorController(
            VendorService vendorService
    ) {
        this.vendorService = vendorService;
    }


    // =====================================================
    // CREATE
    // =====================================================

    @PostMapping
    public ResponseEntity<?> createVendor(
            @Valid
            @RequestBody
            VendorRequest request
    ) {

        try {

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            vendorService
                                    .createVendor(request)
                    );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =====================================================
    // GET ALL
    // =====================================================

    @GetMapping
    public ResponseEntity<List<VendorResponse>>
    getVendors() {

        return ResponseEntity.ok(
                vendorService.getAllVendors()
        );
    }


    // =====================================================
    // GET ONE
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<VendorResponse>
    getVendor(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                vendorService.getVendorById(id)
        );
    }


    // =====================================================
    // UPDATE
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVendor(
            @PathVariable Long id,

            @Valid
            @RequestBody
            VendorRequest request
    ) {

        try {

            return ResponseEntity.ok(
                    vendorService.updateVendor(
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


    // =====================================================
    // STATUS
    // =====================================================

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,

            @RequestParam boolean active
    ) {

        try {

            return ResponseEntity.ok(
                    vendorService.updateStatus(
                            id,
                            active
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}