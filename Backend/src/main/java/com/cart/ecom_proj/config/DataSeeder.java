package com.cart.ecom_proj.config;

import com.cart.ecom_proj.model.Category;
import com.cart.ecom_proj.model.Order;
import com.cart.ecom_proj.model.OrderItem;
import com.cart.ecom_proj.model.OrderStatus;
import com.cart.ecom_proj.model.PaymentStatus;
import com.cart.ecom_proj.model.Product;
import com.cart.ecom_proj.model.Role;
import com.cart.ecom_proj.model.User;
import com.cart.ecom_proj.model.Vendor;
import com.cart.ecom_proj.repo.CategoryRepository;
import com.cart.ecom_proj.repo.OrderRepository;
import com.cart.ecom_proj.repo.ProductRepo;
import com.cart.ecom_proj.repo.UserRepository;
import com.cart.ecom_proj.repo.VendorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Configuration
public class DataSeeder {

    private final Random random =
            new Random(20260812L);

    private final String DEMO_PASSWORD =
            "Demo@123";


    @Bean
    CommandLineRunner seedDatabase(
            UserRepository userRepository,
            VendorRepository vendorRepository,
            CategoryRepository categoryRepository,
            ProductRepo productRepo,
            OrderRepository orderRepository,
            PasswordEncoder passwordEncoder
    ) {

        return args -> {

            System.out.println(
                    "=========================================="
            );

            System.out.println(
                    "DUNIQUE DEMO DATA SEEDER"
            );

            System.out.println(
                    "=========================================="
            );


            /*
             * IMPORTANT:
             *
             * Don't seed again if demo customers
             * already exist.
             */

            if (userRepository.existsByEmail(
                    "customer1@dunique.demo"
            )) {

                System.out.println(
                        "Demo data already exists."
                );

                System.out.println(
                        "Skipping seeder."
                );

                return;
            }


            // =================================================
            // 1. CATEGORIES
            // =================================================

            System.out.println(
                    "Creating categories..."
            );

            List<Category> categories =
                    createCategories(
                            categoryRepository
                    );


            // =================================================
            // 2. CUSTOMERS
            // =================================================

            System.out.println(
                    "Creating customers..."
            );

            List<User> customers =
                    createCustomers(
                            userRepository,
                            passwordEncoder
                    );


            // =================================================
            // 3. VENDORS
            // =================================================

            System.out.println(
                    "Creating vendors..."
            );

            List<Vendor> vendors =
                    createVendors(
                            userRepository,
                            vendorRepository,
                            passwordEncoder
                    );


            // =================================================
            // 4. PRODUCTS
            // =================================================

            System.out.println(
                    "Creating 500 products..."
            );

            List<Product> products =
                    createProducts(
                            productRepo,
                            categories,
                            vendors
                    );


            // =================================================
            // 5. ORDERS
            // =================================================

            System.out.println(
                    "Creating 200 orders..."
            );

            createOrders(
                    orderRepository,
                    products,
                    customers
            );


            System.out.println(
                    "=========================================="
            );

            System.out.println(
                    "DUNIQUE DEMO DATA CREATED SUCCESSFULLY"
            );

            System.out.println(
                    "Customers : 20"
            );

            System.out.println(
                    "Vendors   : 20"
            );

            System.out.println(
                    "Categories: " +
                    categories.size()
            );

            System.out.println(
                    "Products  : " +
                    products.size()
            );

            System.out.println(
                    "Orders    : 200"
            );

            System.out.println(
                    "Demo Password: " +
                    DEMO_PASSWORD
            );

            System.out.println(
                    "=========================================="
            );
        };
    }


    // =========================================================
    // CATEGORIES
    // =========================================================

    private List<Category> createCategories(
            CategoryRepository repository
    ) {

        String[][] data = {

                {
                        "Smartphones",
                        "Latest smartphones and mobile devices"
                },

                {
                        "Laptops",
                        "Laptops and notebooks"
                },

                {
                        "Headphones",
                        "Wireless and wired headphones"
                },

                {
                        "Smart Watches",
                        "Smart watches and fitness watches"
                },

                {
                        "Cameras",
                        "Digital cameras and accessories"
                },

                {
                        "Televisions",
                        "Smart TVs and entertainment displays"
                },

                {
                        "Mens Clothing",
                        "Clothing for men"
                },

                {
                        "Womens Clothing",
                        "Clothing for women"
                },

                {
                        "Mens Shoes",
                        "Shoes and footwear for men"
                },

                {
                        "Womens Shoes",
                        "Shoes and footwear for women"
                },

                {
                        "Bags",
                        "Backpacks, handbags and travel bags"
                },

                {
                        "Kitchen",
                        "Kitchen appliances and accessories"
                },

                {
                        "Home Appliances",
                        "Appliances for your home"
                },

                {
                        "Furniture",
                        "Furniture and home essentials"
                },

                {
                        "Skincare",
                        "Skincare and beauty products"
                },

                {
                        "Hair Care",
                        "Hair care products"
                },

                {
                        "Fitness",
                        "Fitness equipment and accessories"
                },

                {
                        "Sports",
                        "Sports equipment and accessories"
                },

                {
                        "Books",
                        "Books and educational material"
                },

                {
                        "Gaming",
                        "Gaming accessories and equipment"
                }
        };


        List<Category> categories =
                new ArrayList<>();


        for (String[] item : data) {

            Category category =
                    new Category();

            category.setName(
                    item[0]
            );

            category.setDescription(
                    item[1]
            );

            category.setActive(true);

            categories.add(
                    category
            );
        }


        return repository.saveAll(
                categories
        );
    }


    // =========================================================
    // CUSTOMERS
    // =========================================================

    private List<User> createCustomers(
            UserRepository repository,
            PasswordEncoder passwordEncoder
    ) {

        String[] firstNames = {

                "Aarav",
                "Vivaan",
                "Aditya",
                "Arjun",
                "Rahul",
                "Rohan",
                "Karan",
                "Ankit",
                "Vikram",
                "Sahil",
                "Dev",
                "Akash",
                "Nikhil",
                "Varun",
                "Manish",
                "Ravi",
                "Abhishek",
                "Harsh",
                "Yash",
                "Aryan"
        };


        String[] lastNames = {

                "Sharma",
                "Verma",
                "Patel",
                "Reddy",
                "Kumar",
                "Singh",
                "Gupta",
                "Mehta",
                "Iyer",
                "Nair"
        };


        List<User> customers =
                new ArrayList<>();


        for (
                int i = 0;
                i < 20;
                i++
        ) {

            User user =
                    new User();

            user.setFirstName(
                    firstNames[i]
            );

            user.setLastName(
                    lastNames[
                            i % lastNames.length
                    ]
            );

            user.setEmail(
                    "customer" +
                    (i + 1) +
                    "@dunique.demo"
            );

            user.setPhone(
                    "900000" +
                    String.format(
                            "%04d",
                            i + 1
                    )
            );

            user.setPassword(
                    passwordEncoder.encode(
                            DEMO_PASSWORD
                    )
            );

            user.setRole(
                    Role.CUSTOMER
            );

            user.setEnabled(true);

            customers.add(user);
        }


        return repository.saveAll(
                customers
        );
    }


    // =========================================================
    // VENDORS
    // =========================================================

    private List<Vendor> createVendors(
            UserRepository userRepository,
            VendorRepository vendorRepository,
            PasswordEncoder passwordEncoder
    ) {

        String[] owners = {

                "TechWorld",
                "NovaMart",
                "UrbanCart",
                "PrimeStore",
                "SmartHub",
                "StyleStreet",
                "DigitalZone",
                "MegaMart",
                "TrendHouse",
                "EliteShop",
                "NextGen Store",
                "ValueMart",
                "DailyNeeds",
                "FashionPoint",
                "GadgetGalaxy",
                "HomeNest",
                "SportsArena",
                "BookWorld",
                "GameZone",
                "SuperCart"
        };


        String[] firstNames = {

                "Raj",
                "Amit",
                "Suresh",
                "Vijay",
                "Rakesh",
                "Manoj",
                "Deepak",
                "Prakash",
                "Sanjay",
                "Ajay",
                "Rohit",
                "Mohit",
                "Pankaj",
                "Naveen",
                "Tarun",
                "Sameer",
                "Gaurav",
                "Varun",
                "Kunal",
                "Arvind"
        };


        String[] lastNames = {

                "Shah",
                "Rao",
                "Das",
                "Mishra",
                "Joshi",
                "Malhotra",
                "Kapoor",
                "Bose",
                "Chopra",
                "Agarwal"
        };


        List<Vendor> vendors =
                new ArrayList<>();


        for (
                int i = 0;
                i < 20;
                i++
        ) {

            User user =
                    new User();

            user.setFirstName(
                    firstNames[i]
            );

            user.setLastName(
                    lastNames[
                            i % lastNames.length
                    ]
            );

            user.setEmail(
                    "vendor" +
                    (i + 1) +
                    "@dunique.demo"
            );

            user.setPhone(
                    "910000" +
                    String.format(
                            "%04d",
                            i + 1
                    )
            );

            user.setPassword(
                    passwordEncoder.encode(
                            DEMO_PASSWORD
                    )
            );

            user.setRole(
                    Role.VENDOR
            );

            user.setEnabled(true);


            User savedUser =
                    userRepository.save(
                            user
                    );


            Vendor vendor =
                    new Vendor();

            vendor.setUser(
                    savedUser
            );

            vendor.setShopName(
                    owners[i]
            );

            vendor.setDescription(
                    "Official " +
                    owners[i] +
                    " store on Dunique"
            );

            vendor.setPhone(
                    savedUser.getPhone()
            );

            vendor.setEmail(
                    savedUser.getEmail()
            );

            vendor.setActive(true);


            vendors.add(
                    vendorRepository.save(
                            vendor
                    )
            );
        }


        return vendors;
    }


    // =========================================================
    // PRODUCTS
    // =========================================================

    private List<Product> createProducts(
            ProductRepo productRepo,
            List<Category> categories,
            List<Vendor> vendors
    ) {

        List<Product> products =
                new ArrayList<>();


        String[] brands = {

                "Samsung",
                "Apple",
                "OnePlus",
                "Sony",
                "JBL",
                "boAt",
                "Dell",
                "HP",
                "Lenovo",
                "ASUS",
                "Nike",
                "Adidas",
                "Puma",
                "Levi's",
                "LG",
                "Whirlpool",
                "Philips",
                "Logitech",
                "Canon",
                "Nikon"
        };


        String[] productTypes = {

                "Premium",
                "Classic",
                "Pro",
                "Ultra",
                "Max",
                "Plus",
                "Essential",
                "Advanced",
                "Elite",
                "Smart"
        };


        for (
                int i = 1;
                i <= 500;
                i++
        ) {

            Category category =
                    categories.get(
                            (i - 1) %
                            categories.size()
                    );


            Vendor vendor =
                    vendors.get(
                            (i - 1) %
                            vendors.size()
                    );


            Product product =
                    new Product();


            String brand =
                    brands[
                            (i - 1) %
                            brands.length
                    ];


            String type =
                    productTypes[
                            (i - 1) %
                            productTypes.length
                    ];


            product.setName(
                    brand +
                    " " +
                    category.getName() +
                    " " +
                    type +
                    " " +
                    i
            );


            product.setDescription(
                    "High quality " +
                    category.getName() +
                    " product from " +
                    brand +
                    ". Designed for everyday use with reliable performance and excellent value."
            );


            product.setBrand(
                    brand
            );


            /*
             * Price between ₹499 and approximately ₹85,000.
             */

            BigDecimal price =
                    BigDecimal.valueOf(
                            499 +
                            random.nextInt(
                                    84501
                            )
                    );


            product.setPrice(
                    price
            );


            product.setCategory(
                    category
            );


            product.setVendor(
                    vendor
            );


            product.setReleaseDate(
                    LocalDateTime.now()
                            .minusDays(
                                    random.nextInt(
                                            730
                                    )
                            )
            );


            product.setProductAvailable(
                    random.nextInt(
                            100
                    ) >= 5
            );


            product.setStockQuantity(
                    random.nextInt(
                            100
                    ) + 1
            );


            /*
             * No large fake image BLOBs.
             *
             * Images can be added later through
             * your Admin Product UI.
             */

            product.setImageName(
                    null
            );

            product.setImageType(
                    null
            );

            product.setImageData(
                    null
            );


            products.add(
                    product
            );


            /*
             * Save in batches to avoid holding
             * everything too long.
             */

            if (
                    products.size() >= 100
            ) {

                productRepo.saveAll(
                        products
                );

                products.clear();
            }
        }


        /*
         * Save remaining products.
         */

        if (!products.isEmpty()) {

            productRepo.saveAll(
                    products
            );
        }


        /*
         * Reload products because the list above
         * was cleared during batch saving.
         */

        return productRepo.findAll();
    }


    // =========================================================
    // ORDERS
    // =========================================================

    private void createOrders(
            OrderRepository orderRepository,
            List<Product> products,
            List<User> customers
    ) {

        List<Order> orders =
                new ArrayList<>();


        for (
                int i = 0;
                i < 200;
                i++
        ) {

            User customer =
                    customers.get(
                            i %
                            customers.size()
                    );


            Order order =
                    new Order();


            order.setUser(
                    customer
            );


            /*
             * Spread orders across the
             * previous 12 months.
             */

            LocalDateTime created =
                    LocalDateTime.now()
                            .minusDays(
                                    random.nextInt(
                                            365
                                    )
                            )
                            .minusHours(
                                    random.nextInt(
                                            24
                                    )
                            );


            order.setCreatedAt(
                    created
            );

            order.setUpdatedAt(
                    created
            );


            /*
             * Order status.
             */

            OrderStatus status =
                    randomOrderStatus();


            order.setOrderStatus(
                    status
            );


            /*
             * Payment status.
             */

            PaymentStatus paymentStatus;


            if (
                    status ==
                    OrderStatus.CANCELLED
            ) {

                paymentStatus =
                        random.nextBoolean()
                                ? PaymentStatus.FAILED
                                : PaymentStatus.SUCCESS;

            } else {

                int value =
                        random.nextInt(
                                100
                        );


                if (
                        value < 80
                ) {

                    paymentStatus =
                            PaymentStatus.SUCCESS;

                } else if (
                        value < 95
                ) {

                    paymentStatus =
                            PaymentStatus.PENDING;

                } else {

                    paymentStatus =
                            PaymentStatus.FAILED;
                }
            }


            order.setPaymentStatus(
                    paymentStatus
            );


            /*
             * Shipping information.
             */

            order.setShippingFullName(
                    customer.getFirstName()
                    + " "
                    + customer.getLastName()
            );


            order.setShippingPhone(
                    customer.getPhone()
            );


            order.setShippingAddressLine(
                    (10 + i)
                    + ", Dunique Street"
            );


            order.setShippingCity(
                    randomCity(i)
            );


            order.setShippingState(
                    randomState(i)
            );


            order.setShippingPostalCode(
                    String.valueOf(
                            500001 +
                            random.nextInt(
                                    99999
                            )
                    )
            );


            order.setShippingLandmark(
                    "Near Main Road"
            );


            order.setShippingAddressType(
                    i % 3 == 0
                            ? "WORK"
                            : "HOME"
            );


            /*
             * Add 1–4 items.
             */

            List<OrderItem> items =
                    new ArrayList<>();


            int itemCount =
                    1 +
                    random.nextInt(
                            4
                    );


            BigDecimal total =
                    BigDecimal.ZERO;


            for (
                    int j = 0;
                    j < itemCount;
                    j++
            ) {

                Product product =
                        products.get(
                                random.nextInt(
                                        products.size()
                                )
                        );


                int quantity =
                        1 +
                        random.nextInt(
                                3
                        );


                BigDecimal unitPrice =
                        product.getPrice();


                BigDecimal itemTotal =
                        unitPrice.multiply(
                                BigDecimal.valueOf(
                                        quantity
                                )
                        );


                OrderItem item =
                        new OrderItem();


                item.setOrder(
                        order
                );


                item.setProduct(
                        product
                );


                item.setProductName(
                        product.getName()
                );


                item.setUnitPrice(
                        unitPrice
                );


                item.setQuantity(
                        quantity
                );


                item.setTotalPrice(
                        itemTotal
                );


                items.add(
                        item
                );


                total =
                        total.add(
                                itemTotal
                        );
            }


            order.setItems(
                    items
            );


            order.setTotalAmount(
                    total
            );


            orders.add(
                    order
            );


            /*
             * Save in batches.
             */

            if (
                    orders.size() >= 50
            ) {

                orderRepository.saveAll(
                        orders
                );

                orders.clear();
            }
        }


        if (!orders.isEmpty()) {

            orderRepository.saveAll(
                    orders
            );
        }
    }


    // =========================================================
    // ORDER STATUS
    // =========================================================

    private OrderStatus randomOrderStatus() {

        int value =
                random.nextInt(
                        100
                );


        if (value < 8) {

            return OrderStatus.CANCELLED;

        } else if (value < 25) {

            return OrderStatus.PLACED;

        } else if (value < 40) {

            return OrderStatus.CONFIRMED;

        } else if (value < 55) {

            return OrderStatus.PROCESSING;

        } else if (value < 70) {

            return OrderStatus.SHIPPED;

        } else {

            return OrderStatus.DELIVERED;
        }
    }


    // =========================================================
    // CITY
    // =========================================================

    private String randomCity(
            int index
    ) {

        String[] cities = {

                "Hyderabad",
                "Bengaluru",
                "Chennai",
                "Mumbai",
                "Delhi",
                "Pune",
                "Kolkata",
                "Ahmedabad",
                "Jaipur",
                "Visakhapatnam"
        };


        return cities[
                index %
                cities.length
        ];
    }


    // =========================================================
    // STATE
    // =========================================================

    private String randomState(
            int index
    ) {

        String[] states = {

                "Telangana",
                "Karnataka",
                "Tamil Nadu",
                "Maharashtra",
                "Delhi",
                "West Bengal",
                "Gujarat",
                "Rajasthan",
                "Andhra Pradesh"
        };


        return states[
                index %
                states.length
        ];
    }
}