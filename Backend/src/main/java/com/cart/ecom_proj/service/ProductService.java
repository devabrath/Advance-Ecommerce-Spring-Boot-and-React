package com.cart.ecom_proj.service;

import com.cart.ecom_proj.model.Product;
import com.cart.ecom_proj.repo.ProductRepo;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepo productRepo;

    public ProductService(ProductRepo productRepo) {
        this.productRepo = productRepo;
    }

    public List<Product> getAllProducts() {
        return productRepo.findAll();
    }

    public Product getProductById(Long id) {
        return productRepo.findById(id).orElse(null);
    }

    public Product addProduct(
            Product product,
            MultipartFile imageFile
    ) throws IOException {

        if (imageFile != null && !imageFile.isEmpty()) {
            product.setImageName(
                    imageFile.getOriginalFilename()
            );

            product.setImageType(
                    imageFile.getContentType()
            );

            product.setImageData(
                    imageFile.getBytes()
            );
        }

        return productRepo.save(product);
    }

    public Product updateProduct(
            Long id,
            Product product,
            MultipartFile imageFile
    ) throws IOException {

        Product existingProduct =
                productRepo.findById(id)
                        .orElse(null);

        if (existingProduct == null) {
            return null;
        }

        existingProduct.setName(product.getName());
        existingProduct.setDescription(product.getDescription());
        existingProduct.setBrand(product.getBrand());
        existingProduct.setPrice(product.getPrice());
        existingProduct.setCategory(product.getCategory());
        existingProduct.setVendor(product.getVendor());
        existingProduct.setReleaseDate(product.getReleaseDate());
        existingProduct.setProductAvailable(
                product.isProductAvailable()
        );
        existingProduct.setStockQuantity(
                product.getStockQuantity()
        );

        if (imageFile != null && !imageFile.isEmpty()) {

            existingProduct.setImageName(
                    imageFile.getOriginalFilename()
            );

            existingProduct.setImageType(
                    imageFile.getContentType()
            );

            existingProduct.setImageData(
                    imageFile.getBytes()
            );
        }

        return productRepo.save(existingProduct);
    }

    public void deleteProduct(Long id) {
        productRepo.deleteById(id);
    }

    public List<Product> searchProducts(String keyword) {
        return productRepo.searchProducts(keyword);
    }
}