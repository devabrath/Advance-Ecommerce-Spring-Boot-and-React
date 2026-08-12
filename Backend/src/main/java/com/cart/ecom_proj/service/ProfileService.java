package com.cart.ecom_proj.service;

import com.cart.ecom_proj.dto.AuthResponse;
import com.cart.ecom_proj.dto.ChangePasswordRequest;
import com.cart.ecom_proj.dto.ProfileRequest;
import com.cart.ecom_proj.model.User;
import com.cart.ecom_proj.repo.UserRepository;
import com.cart.ecom_proj.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public ProfileService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse getProfile(String email) {

        User user = getUser(email);

        String token = jwtService.generateToken(
                createUserDetails(user)
        );

        return toAuthResponse(user, token);
    }

    public AuthResponse updateProfile(
            String currentEmail,
            ProfileRequest request
    ) {

        User user = getUser(currentEmail);

        if (!currentEmail.equalsIgnoreCase(request.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {

            throw new RuntimeException(
                    "Email is already registered"
            );
        }

        if (request.getPhone() != null
                && !request.getPhone().isBlank()
                && !request.getPhone().equals(user.getPhone())
                && userRepository.existsByPhone(request.getPhone())) {

            throw new RuntimeException(
                    "Phone number is already registered"
            );
        }

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(
                request.getPhone() == null ||
                request.getPhone().isBlank()
                        ? null
                        : request.getPhone()
        );

        User savedUser =
                userRepository.save(user);

        String token = jwtService.generateToken(
                createUserDetails(savedUser)
        );

        return toAuthResponse(
                savedUser,
                token
        );
    }

    public void changePassword(
            String email,
            ChangePasswordRequest request
    ) {

        User user = getUser(email);

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword()
        )) {

            throw new RuntimeException(
                    "Current password is incorrect"
            );
        }

        if (passwordEncoder.matches(
                request.getNewPassword(),
                user.getPassword()
        )) {

            throw new RuntimeException(
                    "New password must be different from current password"
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        userRepository.save(user);
    }

    private User getUser(String email) {

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );
    }

    private org.springframework.security.core.userdetails.User
    createUserDetails(User user) {

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                user.isEnabled(),
                true,
                true,
                true,
                java.util.List.of(
                        new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                "ROLE_" + user.getRole().name()
                        )
                )
        );
    }

    private AuthResponse toAuthResponse(
            User user,
            String token
    ) {

        return new AuthResponse(
            token,
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            user.getEmail(),
            user.getPhone(),
            user.getRole().name()
    );
    }
}