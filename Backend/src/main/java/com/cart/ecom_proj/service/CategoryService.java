package com.cart.ecom_proj.service;

import com.cart.ecom_proj.dto.CategoryRequest;
import com.cart.ecom_proj.dto.CategoryResponse;
import com.cart.ecom_proj.model.Category;
import com.cart.ecom_proj.repo.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(
            CategoryRepository categoryRepository
    ) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> getAllCategories() {

        return categoryRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CategoryResponse getCategoryById(Long id) {

        Category category =
                categoryRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Category not found"
                                )
                        );

        return toResponse(category);
    }

    public CategoryResponse createCategory(
            CategoryRequest request
    ) {

        if (categoryRepository.existsByNameIgnoreCase(
                request.getName()
        )) {

            throw new RuntimeException(
                    "Category already exists"
            );
        }

        Category category = new Category();

        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        category.setActive(request.isActive());

        return toResponse(
                categoryRepository.save(category)
        );
    }

    public CategoryResponse updateCategory(
            Long id,
            CategoryRequest request
    ) {

        Category category =
                categoryRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Category not found"
                                )
                        );

        if (!category.getName()
                .equalsIgnoreCase(request.getName())
                && categoryRepository
                .existsByNameIgnoreCase(request.getName())) {

            throw new RuntimeException(
                    "Category already exists"
            );
        }

        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        category.setActive(request.isActive());

        return toResponse(
                categoryRepository.save(category)
        );
    }

    public void deleteCategory(Long id) {

        Category category =
                categoryRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Category not found"
                                )
                        );

        categoryRepository.delete(category);
    }

    private CategoryResponse toResponse(
            Category category
    ) {

        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.isActive()
        );
    }
}