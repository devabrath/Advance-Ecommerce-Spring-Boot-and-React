package com.cart.ecom_proj.service;

import com.cart.ecom_proj.dto.UserResponse;
import com.cart.ecom_proj.model.User;
import com.cart.ecom_proj.repo.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class CustomerService {

    private final UserRepository userRepository;

    public CustomerService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse getProfile(String email) {

        User user = getUser(email);

        return toResponse(user);
    }

    public UserResponse updateProfile(
            String email,
            String firstName,
            String lastName,
            String phone
    ) {

        User user = getUser(email);

        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPhone(phone);

        User updatedUser = userRepository.save(user);

        return toResponse(updatedUser);
    }

    private User getUser(String email) {

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );
    }

    private UserResponse toResponse(User user) {

        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole()
        );
    }
}