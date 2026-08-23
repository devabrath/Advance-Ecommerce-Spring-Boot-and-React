package com.cart.ecom_proj.service;

import com.cart.ecom_proj.dto.VendorProfileRequest;
import com.cart.ecom_proj.dto.VendorProfileResponse;
import com.cart.ecom_proj.model.User;
import com.cart.ecom_proj.model.Vendor;
import com.cart.ecom_proj.repo.UserRepository;
import com.cart.ecom_proj.repo.VendorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VendorProfileService {

    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;

    public VendorProfileService(
            VendorRepository vendorRepository,
            UserRepository userRepository
    ) {
        this.vendorRepository = vendorRepository;
        this.userRepository = userRepository;
    }


    @Transactional(readOnly = true)
    public VendorProfileResponse getProfile(
            String email
    ) {

        Vendor vendor =
                vendorRepository
                        .findByUserEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Vendor account not found"
                                )
                        );

        User user = vendor.getUser();

        return toResponse(
                vendor,
                user
        );
    }


    @Transactional
    public VendorProfileResponse updateProfile(
            String currentEmail,
            VendorProfileRequest request
    ) {

        Vendor vendor =
                vendorRepository
                        .findByUserEmail(currentEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Vendor account not found"
                                )
                        );

        User user = vendor.getUser();


        /*
         * Check if another user is already
         * using the requested email.
         */
        if (!user.getEmail()
                .equalsIgnoreCase(request.getEmail())) {

            userRepository
                    .findByEmail(request.getEmail())
                    .ifPresent(existingUser -> {

                        if (!existingUser.getId()
                                .equals(user.getId())) {

                            throw new RuntimeException(
                                    "Email is already in use"
                            );
                        }
                    });
        }


        /*
         * Update User information.
         */

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


        /*
         * Update Vendor information.
         */

        vendor.setShopName(
                request.getShopName()
        );

        vendor.setDescription(
                request.getDescription()
        );

        /*
         * Keep vendor phone/email synchronized
         * with the User account.
         */

        vendor.setPhone(
                request.getPhone()
        );

        vendor.setEmail(
                request.getEmail()
        );


        userRepository.save(user);

        vendorRepository.save(vendor);


        return toResponse(
                vendor,
                user
        );
    }


    private VendorProfileResponse toResponse(
            Vendor vendor,
            User user
    ) {

        return new VendorProfileResponse(

                vendor.getId(),

                user.getId(),

                user.getFirstName(),

                user.getLastName(),

                user.getEmail(),

                user.getPhone(),

                vendor.getShopName(),

                vendor.getDescription(),

                vendor.isActive()
        );
    }
}