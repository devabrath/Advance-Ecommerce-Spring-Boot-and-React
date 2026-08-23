package com.cart.ecom_proj.controller;

import com.cart.ecom_proj.dto.AdminDashboardResponse;
import com.cart.ecom_proj.service.AdminDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(
            AdminDashboardService adminDashboardService
    ) {
        this.adminDashboardService =
                adminDashboardService;
    }

    @GetMapping
    public ResponseEntity<AdminDashboardResponse>
    getDashboard(
            @RequestParam(
                    defaultValue = "month"
            )
            String period
    ) {

        return ResponseEntity.ok(
                adminDashboardService
                        .getDashboard(period)
        );
    }
}