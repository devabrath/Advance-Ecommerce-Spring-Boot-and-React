package com.cart.ecom_proj.service;

import com.cart.ecom_proj.dto.AuthResponse;
import com.cart.ecom_proj.dto.LoginRequest;
import com.cart.ecom_proj.dto.RegisterRequest;
import com.cart.ecom_proj.model.Role;
import com.cart.ecom_proj.model.User;
import com.cart.ecom_proj.repo.UserRepository;
import com.cart.ecom_proj.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public User register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException(
                    "Email is already registered"
            );
        }

        if (request.getPhone() != null
                && !request.getPhone().isBlank()
                && userRepository.existsByPhone(request.getPhone())) {

            throw new RuntimeException(
                    "Phone number is already registered"
            );
        }

        User user = new User();

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());

        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setRole(Role.CUSTOMER);
        user.setEnabled(true);

        return userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        UserDetails userDetails =
                new org.springframework.security.core.userdetails.User(
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

        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(
                token,
                user.getId(),
                user.getFirstName(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}