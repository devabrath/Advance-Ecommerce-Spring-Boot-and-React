package com.cart.ecom_proj.config;

import com.cart.ecom_proj.model.Role;
import com.cart.ecom_proj.model.User;
import com.cart.ecom_proj.repo.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminInitializer {

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.first-name}")
    private String firstName;

    @Value("${app.admin.last-name}")
    private String lastName;

    @Bean
    CommandLineRunner createAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {

        return args -> {

            if (userRepository.existsByEmail(adminEmail)) {

                User existingUser =
                        userRepository
                                .findByEmail(adminEmail)
                                .orElseThrow();

                if (existingUser.getRole() != Role.ADMIN) {
                    existingUser.setRole(Role.ADMIN);
                    userRepository.save(existingUser);
                }

                System.out.println(
                        "Admin account already exists."
                );

                return;
            }

            User admin = new User();

            admin.setFirstName(firstName);
            admin.setLastName(lastName);
            admin.setEmail(adminEmail);

            admin.setPassword(
                    passwordEncoder.encode(adminPassword)
            );

            admin.setRole(Role.ADMIN);
            admin.setEnabled(true);

            userRepository.save(admin);

            System.out.println(
                    "Default admin account created."
            );
        };
    }
}