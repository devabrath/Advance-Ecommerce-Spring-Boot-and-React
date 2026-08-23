package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.dto.VendorProfileRequest;
import com.cart.ecom_proj.dto.VendorProfileResponse;
import com.cart.ecom_proj.service.VendorProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vendor/profile")
@CrossOrigin
public class VendorProfileController {

    private final VendorProfileService vendorProfileService;

    public VendorProfileController(
            VendorProfileService vendorProfileService
    ) {
        this.vendorProfileService =
                vendorProfileService;
    }


    @GetMapping
    public ResponseEntity<VendorProfileResponse>
    getProfile(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                vendorProfileService.getProfile(
                        authentication.getName()
                )
        );
    }


    @PutMapping
    public ResponseEntity<VendorProfileResponse>
    updateProfile(
            Authentication authentication,

            @Valid
            @RequestBody
            VendorProfileRequest request
    ) {

        return ResponseEntity.ok(
                vendorProfileService.updateProfile(
                        authentication.getName(),
                        request
                )
        );
    }
}