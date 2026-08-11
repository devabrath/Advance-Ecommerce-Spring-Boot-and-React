package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.dto.AddressRequest;
import com.cart.ecom_proj.dto.AddressResponse;
import com.cart.ecom_proj.service.AddressService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/addresses")
@CrossOrigin
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping
    public ResponseEntity<List<AddressResponse>> getAddresses(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                addressService.getAddresses(
                        authentication.getName()
                )
        );
    }

    @PostMapping
    public ResponseEntity<AddressResponse> addAddress(
            Authentication authentication,
            @Valid @RequestBody AddressRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        addressService.addAddress(
                                authentication.getName(),
                                request
                        )
                );
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressResponse> updateAddress(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request
    ) {

        return ResponseEntity.ok(
                addressService.updateAddress(
                        authentication.getName(),
                        id,
                        request
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(
            Authentication authentication,
            @PathVariable Long id
    ) {

        addressService.deleteAddress(
                authentication.getName(),
                id
        );

        return ResponseEntity.noContent().build();
    }
}