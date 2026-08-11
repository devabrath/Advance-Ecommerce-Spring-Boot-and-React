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

    @PostMapping
    public ResponseEntity<VendorResponse> createVendor(
            @Valid @RequestBody VendorRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(vendorService.createVendor(request));
    }

    @GetMapping
    public ResponseEntity<List<VendorResponse>> getVendors() {

        return ResponseEntity.ok(
                vendorService.getAllVendors()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<VendorResponse> getVendor(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                vendorService.getVendorById(id)
        );
    }
}