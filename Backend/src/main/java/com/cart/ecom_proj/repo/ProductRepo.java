package com.cart.ecom_proj.repo;

import com.cart.ecom_proj.model.Product;
import com.cart.ecom_proj.model.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepo
        extends JpaRepository<Product, Long> {

    List<Product> findByVendor(Vendor vendor);

    Optional<Product> findByIdAndVendor(
            Long id,
            Vendor vendor
    );

    @Query("""
            SELECT p FROM Product p
            WHERE LOWER(p.name) LIKE
                  LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(p.description) LIKE
                  LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(p.brand) LIKE
                  LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(p.category.name) LIKE
                  LOWER(CONCAT('%', :keyword, '%'))
            """)
    List<Product> searchProducts(String keyword);


    // =====================================================
    // ADMIN PAGINATION
    // =====================================================

    @Query("""
            SELECT p FROM Product p
            WHERE
            (
                :keyword = ''
                OR LOWER(p.name) LIKE
                   LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(p.description) LIKE
                   LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(p.brand) LIKE
                   LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(p.category.name) LIKE
                   LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(p.vendor.shopName) LIKE
                   LOWER(CONCAT('%', :keyword, '%'))
            )
            AND
            (
                :status = 'ALL'
                OR (
                    :status = 'AVAILABLE'
                    AND p.productAvailable = true
                )
                OR (
                    :status = 'UNAVAILABLE'
                    AND p.productAvailable = false
                )
                OR (
                    :status = 'LOW_STOCK'
                    AND p.stockQuantity <= 5
                )
            )
            """)
    Page<Product> findAdminProducts(
            @Param("keyword") String keyword,
            @Param("status") String status,
            Pageable pageable
    );
}