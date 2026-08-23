package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.dto.VendorRevenueResponse;
import com.cart.ecom_proj.service.VendorRevenueService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vendor/revenue")
@CrossOrigin
public class VendorRevenueController {

    private final VendorRevenueService vendorRevenueService;


    public VendorRevenueController(
            VendorRevenueService vendorRevenueService
    ) {

        this.vendorRevenueService =
                vendorRevenueService;
    }


    @GetMapping
    public ResponseEntity<VendorRevenueResponse>
    getRevenue(

            @RequestParam(
                    defaultValue = "month"
            )
            String period,

            Authentication authentication

    ) {

        return ResponseEntity.ok(
                vendorRevenueService.getRevenue(
                        period,
                        authentication
                )
        );
    }
}