import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../axios";
import AppContext, { type Product } from "../Context/Context";
import unplugged from "../assets/unplugged.avif";
import samsungBanner from "../assets/Samsung-galaxy-25.jpg";
import nikonBanner from "../assets/nikon-camera.jpg";
import nothingBanner from "../assets/macbook.jpg";
import iphoneBanner from "../assets/iphone-17-pro-max-banner.webp";

interface HomeProps { selectedCategory: string; }
interface ProductWithImage extends Product { imageUrl: string; }

/* HOME BANNERS */
const banners = [
    { id: 1, title: "Samsung Galaxy S25 Ultra", subtitle: "Powerful performance. Stunning Galaxy experience.", button: "Shop Samsung", image: samsungBanner },
    { id: 2, title: "Nikon Camera", subtitle: "Level up your photography.", button: "Explore Now", image: nikonBanner },
    { id: 3, title: "MacBook Pro", subtitle: "Distinctive design. Powerful everyday performance.", button: "Discover Now", image: nothingBanner },
    { id: 4, title: "Apple iPhone 17 Pro Max", subtitle: "Pro performance. Extraordinary possibilities.", button: "Shop iPhone", image: iphoneBanner }
];

const Home: React.FC<HomeProps> = ({ selectedCategory }) => {
    /* CONTEXT */
    const context = useContext(AppContext);

    if (!context) throw new Error("Home must be used inside AppProvider");

    const { data, isError, addToCart, refreshData, currentPage, totalPages, totalProducts } = context;

    /* PRODUCT STATE */
    const [products, setProducts] = useState<ProductWithImage[]>([]);
    const [loadingImages, setLoadingImages] = useState(false);

    /* BANNER STATE */
    const [currentBanner, setCurrentBanner] = useState(0);

    /* AUTO BANNER SLIDE */
    useEffect(() => {
        const interval = window.setInterval(() => setCurrentBanner(previous => (previous + 1) % banners.length), 5000);
        return () => window.clearInterval(interval);
    }, []);

    /* NEXT BANNER */
    const nextBanner = () => setCurrentBanner(previous => (previous + 1) % banners.length);

    /* PREVIOUS BANNER */
    const previousBanner = () => setCurrentBanner(previous => previous === 0 ? banners.length - 1 : previous - 1);

    /* LOAD PRODUCT IMAGES */
    useEffect(() => {
        let cancelled = false;
        const objectUrls: string[] = [];

        const fetchImages = async () => {
            if (data.length === 0) {
                setProducts([]);
                setLoadingImages(false);
                return;
            }

            setLoadingImages(true);

            const updatedProducts = await Promise.all(data.map(async product => {
                /* NO IMAGE */
                if (!product.imageName) return { ...product, imageUrl: unplugged };

                /* GET IMAGE */
                try {
                    const response = await API.get(`/product/${product.id}/image`, { responseType: "blob" });
                    const imageUrl = URL.createObjectURL(response.data);
                    objectUrls.push(imageUrl);
                    return { ...product, imageUrl };
                } catch (error) {
                    console.error(`Error fetching image for product ID: ${product.id}`, error);
                    return { ...product, imageUrl: unplugged };
                }
            }));

            if (!cancelled) {
                setProducts(updatedProducts);
                setLoadingImages(false);
            }
        };

        fetchImages();

        return () => {
            cancelled = true;
            objectUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [data]);

    /* CATEGORY FILTER */
    const filteredProducts = useMemo(() => {
        if (!selectedCategory || selectedCategory === "All") return products;
        return products.filter(product => product.categoryName?.toLowerCase() === selectedCategory.toLowerCase());
    }, [products, selectedCategory]);

    /* PAGE CHANGE */
    const goToPage = (page: number) => {
        if (page < 0 || page >= totalPages || page === currentPage) return;
        window.scrollTo({ top: 0, behavior: "smooth" });
        refreshData(page);
    };

    /* PAGE NUMBERS */
    const getPageNumbers = () => {
        const pages: number[] = [];

        if (totalPages <= 7) {
            for (let i = 0; i < totalPages; i++) pages.push(i);
            return pages;
        }

        pages.push(0);
        if (currentPage > 3) pages.push(-1);

        const start = Math.max(1, currentPage - 1);
        const end = Math.min(totalPages - 2, currentPage + 1);

        for (let i = start; i <= end; i++) pages.push(i);

        if (currentPage < totalPages - 4) pages.push(-1);

        pages.push(totalPages - 1);
        return pages;
    };

    /* CURRENT BANNER */
    const banner = banners[currentBanner];

    /* LOADING */
    if (loadingImages && products.length === 0) {
        return <div className="home-state home-loading"><div className="home-spinner" /><p>Loading products...</p></div>;
    }

    /* ERROR */
    if (isError) {
        return (
            <div className="home-state home-error">
                <div className="home-error-icon">!</div>
                <h3>Unable to load products</h3>
                <p>{isError}</p>
                <button type="button" className="home-retry-button" onClick={() => refreshData(currentPage)}>Try Again</button>
            </div>
        );
    }

    return (
        <main className="home-page">
            {/* HERO BANNER */}
            {currentPage === 0 && (
                <section className="home-hero">
                    <img className="home-hero-image" src={banner.image} alt={banner.title} onError={event => { event.currentTarget.src = unplugged; }} />
                    <div className="home-hero-overlay" />

                    <div className="home-hero-content">
                        <span className="home-hero-eyebrow">Featured Deal</span>
                        <h1>{banner.title}</h1>
                        <p>{banner.subtitle}</p>
                        <button type="button" className="home-hero-button" onClick={() => {
                            const productSection = document.getElementById("home-products");
                            productSection?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}>{banner.button}</button>
                    </div>

                    <button type="button" className="home-banner-arrow home-banner-arrow-left" onClick={previousBanner} aria-label="Previous banner">‹</button>
                    <button type="button" className="home-banner-arrow home-banner-arrow-right" onClick={nextBanner} aria-label="Next banner">›</button>

                    <div className="home-banner-dots">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setCurrentBanner(index)}
                                aria-label={`Go to banner ${index + 1}`}
                                className={`home-banner-dot ${index === currentBanner ? "active" : ""}`}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* PRODUCTS */}
            <section className="home-products-section" id="home-products">
                <div className="home-products-header">
                    <div>
                        <span className="home-section-eyebrow">Latest Collection</span>
                        <h2>{selectedCategory && selectedCategory !== "All" ? selectedCategory : "Explore Products"}</h2>
                        <p>Showing <strong>{filteredProducts.length}</strong> of <strong>{totalProducts}</strong> products</p>
                    </div>
                </div>

                {/* NO PRODUCTS */}
                {filteredProducts.length === 0 ? (
                    <div className="home-empty-state">
                        <div className="home-empty-image"><img src={unplugged} alt="No products" /></div>
                        <h3>No products found</h3>
                        <p>Try selecting another category.</p>
                    </div>
                ) : (
                    <div className="home-product-grid">
                        {filteredProducts.map(product => (
                            <article key={product.id} className="home-product-card">
                                {/* IMAGE */}
                                <Link to={`/product/${product.id}`} className="home-product-image-link">
                                    <div className="home-product-image-wrap">
                                        <img src={product.imageUrl} alt={product.name} className="home-product-image" onError={event => { event.currentTarget.src = unplugged; }} />
                                    </div>
                                </Link>

                                {/* DETAILS */}
                                <div className="home-product-details">
                                    {/* CATEGORY */}
                                    {product.categoryName && <span className="home-product-category">{product.categoryName}</span>}

                                    {/* NAME */}
                                    <Link to={`/product/${product.id}`} className="home-product-name-link"><h3>{product.name}</h3></Link>

                                    {/* BRAND */}
                                    {product.brand && <p className="home-product-brand">{product.brand}</p>}

                                    {/* PRICE */}
                                    <div className="home-product-price">₹{Number(product.price).toLocaleString("en-IN")}</div>

                                    {/* STOCK */}
                                    <div className={`home-product-stock ${product.stockQuantity <= 0 ? "out-of-stock" : product.stockQuantity <= 5 ? "low-stock" : "in-stock"}`}>
                                        {product.stockQuantity <= 0 ? "Out of stock" : product.stockQuantity <= 5 ? `Only ${product.stockQuantity} left` : "In stock"}
                                    </div>

                                    {/* ADD TO CART */}
                                    <button
                                        type="button"
                                        className="home-add-cart-button"
                                        disabled={!product.productAvailable || product.stockQuantity <= 0}
                                        onClick={() => addToCart(product)}
                                    >
                                        {product.stockQuantity <= 0 ? "Out of Stock" : !product.productAvailable ? "Unavailable" : "Add to Cart"}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <nav className="home-pagination" aria-label="Product pagination">
                        <button type="button" className="home-pagination-nav" disabled={currentPage === 0} onClick={() => goToPage(currentPage - 1)}>← Previous</button>

                        {getPageNumbers().map((page, index) => {
                            if (page === -1) return <span key={`ellipsis-${index}`} className="home-pagination-ellipsis">...</span>;

                            const active = page === currentPage;

                            return (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => goToPage(page)}
                                    className={`home-pagination-page ${active ? "active" : ""}`}
                                    aria-current={active ? "page" : undefined}
                                >
                                    {page + 1}
                                </button>
                            );
                        })}

                        <button type="button" className="home-pagination-nav" disabled={currentPage >= totalPages - 1} onClick={() => goToPage(currentPage + 1)}>Next →</button>
                    </nav>
                )}
            </section>
        </main>
    );
};

export default Home;