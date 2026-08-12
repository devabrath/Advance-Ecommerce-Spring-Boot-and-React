package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.dto.AuthResponse;
import com.cart.ecom_proj.dto.ChangePasswordRequest;
import com.cart.ecom_proj.dto.ProfileRequest;
import com.cart.ecom_proj.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer/profile")
@CrossOrigin
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(
            ProfileService profileService
    ) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<AuthResponse> getProfile(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                profileService.getProfile(
                        authentication.getName()
                )
        );
    }

    @PutMapping
    public ResponseEntity<AuthResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody ProfileRequest request
    ) {

        return ResponseEntity.ok(
                profileService.updateProfile(
                        authentication.getName(),
                        request
                )
        );
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {

        profileService.changePassword(
                authentication.getName(),
                request
        );

        return ResponseEntity.ok(
                "Password changed successfully"
        );
    }
}