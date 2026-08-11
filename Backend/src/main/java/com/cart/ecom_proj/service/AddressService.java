package com.cart.ecom_proj.service;

import com.cart.ecom_proj.dto.AddressRequest;
import com.cart.ecom_proj.dto.AddressResponse;
import com.cart.ecom_proj.model.Address;
import com.cart.ecom_proj.model.User;
import com.cart.ecom_proj.repo.AddressRepository;
import com.cart.ecom_proj.repo.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(
            AddressRepository addressRepository,
            UserRepository userRepository
    ) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    public List<AddressResponse> getAddresses(String email) {

        User user = getUser(email);

        return addressRepository.findByUser(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public AddressResponse addAddress(
            String email,
            AddressRequest request
    ) {

        User user = getUser(email);

        Address address = new Address();

        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setAddressLine(request.getAddressLine());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPostalCode(request.getPostalCode());
        address.setLandmark(request.getLandmark());
        address.setAddressType(request.getAddressType());

        boolean makeDefault = request.isDefaultAddress();

        // First address automatically becomes default
        if (!addressRepository.existsByUserAndDefaultAddress(
                user, true)) {
            makeDefault = true;
        }

        // If this address is default, remove default from others
        if (makeDefault) {
            removeDefaultAddress(user);
        }

        address.setDefaultAddress(makeDefault);
        address.setUser(user);

        return toResponse(addressRepository.save(address));
    }

    public AddressResponse updateAddress(
            String email,
            Long addressId,
            AddressRequest request
    ) {

        User user = getUser(email);

        Address address = addressRepository
                .findByIdAndUser(addressId, user)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Address not found"
                        )
                );

        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setAddressLine(request.getAddressLine());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPostalCode(request.getPostalCode());
        address.setLandmark(request.getLandmark());
        address.setAddressType(request.getAddressType());

        if (request.isDefaultAddress()) {
            removeDefaultAddress(user);
            address.setDefaultAddress(true);
        }

        return toResponse(addressRepository.save(address));
    }

    public void deleteAddress(
            String email,
            Long addressId
    ) {

        User user = getUser(email);

        Address address = addressRepository
                .findByIdAndUser(addressId, user)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Address not found"
                        )
                );

        addressRepository.delete(address);
    }

    private User getUser(String email) {

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );
    }

    private void removeDefaultAddress(User user) {

        List<Address> addresses =
                addressRepository.findByUser(user);

        addresses.forEach(address -> {
            if (address.isDefaultAddress()) {
                address.setDefaultAddress(false);
            }
        });

        addressRepository.saveAll(addresses);
    }

    private AddressResponse toResponse(Address address) {

        return new AddressResponse(
                address.getId(),
                address.getFullName(),
                address.getPhone(),
                address.getAddressLine(),
                address.getCity(),
                address.getState(),
                address.getPostalCode(),
                address.getLandmark(),
                address.getAddressType(),
                address.isDefaultAddress()
        );
    }
}