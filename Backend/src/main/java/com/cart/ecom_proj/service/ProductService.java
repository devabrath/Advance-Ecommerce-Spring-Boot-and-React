package com.cart.ecom_proj.service;

import com.cart.ecom_proj.dto.ProductRequest;
import com.cart.ecom_proj.dto.ProductResponse;
import com.cart.ecom_proj.model.Category;
import com.cart.ecom_proj.model.Product;
import com.cart.ecom_proj.model.Vendor;
import com.cart.ecom_proj.repo.CategoryRepository;
import com.cart.ecom_proj.repo.ProductRepo;
import com.cart.ecom_proj.repo.VendorRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.cart.ecom_proj.dto.AdminProductRequest;
import java.io.IOException;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepo productRepo;
    private final CategoryRepository categoryRepository;
    private final VendorRepository vendorRepository;

    public ProductService(
            ProductRepo productRepo,
            CategoryRepository categoryRepository,
            VendorRepository vendorRepository
    ) {
        this.productRepo = productRepo;
        this.categoryRepository = categoryRepository;
        this.vendorRepository = vendorRepository;
    }

    // =========================
    // PUBLIC PRODUCT OPERATIONS
    // =========================

    public List<ProductResponse> getAllProducts() {

        return productRepo.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ProductResponse getProductById(Long id) {

        return productRepo.findById(id)
                .map(this::toResponse)
                .orElse(null);
    }

    public byte[] getProductImage(Long id) {

        Product product = productRepo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Product not found")
                );

        return product.getImageData();
    }

    public String getProductImageType(Long id) {

        Product product = productRepo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Product not found")
                );

        return product.getImageType();
    }

    public List<ProductResponse> searchProducts(
            String keyword
    ) {

        return productRepo.searchProducts(keyword)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================
    // VENDOR PRODUCT OPERATIONS
    // =========================

    public ProductResponse addVendorProduct(
            String vendorEmail,
            ProductRequest request,
            MultipartFile imageFile
    ) throws IOException {

        Vendor vendor = getVendor(vendorEmail);

        Category category = getCategory(
                request.getCategoryId()
        );

        Product product = new Product();

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setBrand(request.getBrand());
        product.setPrice(request.getPrice());
        product.setCategory(category);
        product.setVendor(vendor);
        product.setReleaseDate(request.getReleaseDate());
        product.setProductAvailable(
                request.isProductAvailable()
        );
        product.setStockQuantity(
                request.getStockQuantity()
        );

        setImage(product, imageFile);

        Product savedProduct =
                productRepo.save(product);

        return toResponse(savedProduct);
    }

    public List<ProductResponse> getVendorProducts(
            String vendorEmail
    ) {

        Vendor vendor = getVendor(vendorEmail);

        return productRepo.findByVendor(vendor)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ProductResponse updateVendorProduct(
            String vendorEmail,
            Long productId,
            ProductRequest request,
            MultipartFile imageFile
    ) throws IOException {

        Vendor vendor = getVendor(vendorEmail);

        Product product =
                productRepo.findByIdAndVendor(
                        productId,
                        vendor
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Product not found"
                        )
                );

        Category category = getCategory(
                request.getCategoryId()
        );

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setBrand(request.getBrand());
        product.setPrice(request.getPrice());
        product.setCategory(category);
        product.setReleaseDate(request.getReleaseDate());
        product.setProductAvailable(
                request.isProductAvailable()
        );
        product.setStockQuantity(
                request.getStockQuantity()
        );

        if (imageFile != null
                && !imageFile.isEmpty()) {

            setImage(product, imageFile);
        }

        return toResponse(
                productRepo.save(product)
        );
    }

    public void deleteVendorProduct(
            String vendorEmail,
            Long productId
    ) {

        Vendor vendor = getVendor(vendorEmail);

        Product product =
                productRepo.findByIdAndVendor(
                        productId,
                        vendor
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Product not found"
                        )
                );

        productRepo.delete(product);
    }

    // =========================
    // HELPERS
    // =========================

    private Vendor getVendor(String email) {

        return vendorRepository
                .findByUserEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Vendor account not found"
                        )
                );
    }

    private Category getCategory(Long id) {

        return categoryRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Category not found"
                        )
                );
    }

    private void setImage(
            Product product,
            MultipartFile imageFile
    ) throws IOException {

        if (imageFile != null
                && !imageFile.isEmpty()) {

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
    }

    public ProductResponse addAdminProduct(
        AdminProductRequest request,
        MultipartFile imageFile
) throws IOException {

    Category category = getCategory(
            request.getCategoryId()
    );

    Vendor vendor = vendorRepository
            .findById(request.getVendorId())
            .orElseThrow(() ->
                    new RuntimeException(
                            "Vendor not found"
                    )
            );

    Product product = new Product();

    product.setName(request.getName());
    product.setDescription(request.getDescription());
    product.setBrand(request.getBrand());
    product.setPrice(request.getPrice());
    product.setCategory(category);
    product.setVendor(vendor);

    product.setReleaseDate(
            request.getReleaseDate()
    );

    product.setProductAvailable(
            request.isProductAvailable()
    );

    product.setStockQuantity(
            request.getStockQuantity()
    );

    setImage(product, imageFile);

    Product savedProduct =
            productRepo.save(product);

    return toResponse(savedProduct);
}

    private ProductResponse toResponse(
            Product product
    ) {

        Long categoryId = null;
        String categoryName = null;

        if (product.getCategory() != null) {

            categoryId =
                    product.getCategory().getId();

            categoryName =
                    product.getCategory().getName();
        }

        Long vendorId = null;
        String shopName = null;

        if (product.getVendor() != null) {

            vendorId =
                    product.getVendor().getId();

            shopName =
                    product.getVendor().getShopName();
        }

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getBrand(),
                product.getPrice(),
                categoryId,
                categoryName,
                vendorId,
                shopName,
                product.getReleaseDate(),
                product.isProductAvailable(),
                product.getStockQuantity(),
                product.getImageName(),
                product.getImageType(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}