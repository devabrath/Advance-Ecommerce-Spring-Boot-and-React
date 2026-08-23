import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AppContext, { type Product as ProductType } from "../Context/Context";
import API from "../axios";
import unplugged from "../assets/test.jpg";

const Product = () => {
    /* ROUTER */
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    /* CONTEXT */
    const context = useContext(AppContext);

    if (!context) throw new Error("Product must be used inside AppProvider");

    const { addToCart, removeFromCart, refreshData } = context;

    /* PRODUCT STATE */
    const [product, setProduct] = useState<ProductType | null>(null);
    const [imageUrl, setImageUrl] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [deleting, setDeleting] = useState<boolean>(false);
    const [addingToCart, setAddingToCart] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    /* USER / ROLE */
    const storedUser = localStorage.getItem("user");
    let currentUser: any = null;

    try {
        currentUser = storedUser ? JSON.parse(storedUser) : null;
    } catch {
        currentUser = null;
    }

    const userRole = String(currentUser?.role || currentUser?.authorities?.[0]?.authority || "").replace("ROLE_", "").toUpperCase();
    const isAdmin = userRole === "ADMIN";
    const isVendor = userRole === "VENDOR";
    const canManageProduct = isAdmin || isVendor;

    /* FETCH PRODUCT */
    useEffect(() => {
        let cancelled = false;
        let createdImageUrl = "";

        const fetchProduct = async () => {
            if (!id) {
                setError("Product not found.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await API.get<ProductType>(`/product/${id}`);

                if (cancelled) return;

                setProduct(response.data);

                /* FETCH IMAGE */
                if (response.data.imageName) {
                    try {
                        const imageResponse = await API.get(`/product/${id}/image`, { responseType: "blob" });

                        if (cancelled) return;

                        createdImageUrl = URL.createObjectURL(imageResponse.data);
                        setImageUrl(createdImageUrl);
                    } catch (imageError) {
                        console.error("Error fetching product image:", imageError);
                        setImageUrl(unplugged);
                    }
                } else {
                    setImageUrl(unplugged);
                }
            } catch (fetchError) {
                console.error("Error fetching product:", fetchError);

                if (!cancelled) setError("Unable to load product.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchProduct();

        return () => {
            cancelled = true;
            if (createdImageUrl) URL.revokeObjectURL(createdImageUrl);
        };
    }, [id]);

    /* DELETE PRODUCT */
    const deleteProduct = async (): Promise<void> => {
        if (!id || !canManageProduct) return;

        const confirmed = window.confirm("Are you sure you want to delete this product?");
        if (!confirmed) return;

        try {
            setDeleting(true);
            await API.delete(`/product/${id}`);
            removeFromCart(Number(id));
            await refreshData();
            alert("Product deleted successfully.");
            navigate("/");
        } catch (deleteError: any) {
            console.error("Error deleting product:", deleteError);
            alert(deleteError?.response?.data || "Unable to delete product.");
        } finally {
            setDeleting(false);
        }
    };

    /* EDIT PRODUCT */
    const handleEditClick = (): void => {
        if (!id || !canManageProduct) return;
        navigate(`/product/update/${id}`);
    };

    /* ADD TO CART */
    const handleAddToCart = async (): Promise<void> => {
        if (!product) return;
        if (!product.productAvailable || product.stockQuantity <= 0) return;

        try {
            setAddingToCart(true);
            await addToCart(product);
            alert("Product added to cart.");
        } finally {
            setAddingToCart(false);
        }
    };

    /* LOADING */
    if (loading) return <div className="product-loading">Loading product...</div>;

    /* ERROR */
    if (error || !product) {
        return (
            <div className="product-error-page">
                <h2>Product not found</h2>
                <p className="product-error-message">{error || "This product does not exist."}</p>
                <button type="button" className="product-back-home-btn" onClick={() => navigate("/")}>Back to Products</button>
            </div>
        );
    }

    /* STATUS */
    const outOfStock = product.stockQuantity <= 0;
    const unavailable = !product.productAvailable;
    const lowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;

    /* PAGE */
    return (
        <div className="product-page">
            {/* BACK */}
            <div className="product-page-inner">
                <button type="button" className="product-back-btn" onClick={() => navigate(-1)}>← Back</button>

                {/* PRODUCT CONTAINER */}
                <div className="product-detail-card">
                    <div className="product-detail-grid">

                        {/* IMAGE */}
                        <div className="product-image-section">
                            <img
                                src={imageUrl || unplugged}
                                alt={product.name}
                                className="product-main-image"
                                onError={event => { event.currentTarget.src = unplugged; }}
                            />
                        </div>

                        {/* DETAILS */}
                        <div className="product-details-section">

                            {/* CATEGORY + DATE */}
                            <div className="product-meta-row">
                                <span className="product-category-badge">{product.categoryName || "Product"}</span>
                                <span className="product-listed-date">
                                    Listed {product.releaseDate ? new Date(product.releaseDate).toLocaleDateString("en-IN") : "N/A"}
                                </span>
                            </div>

                            {/* NAME */}
                            <h1 className="product-detail-name">{product.name}</h1>

                            {/* BRAND */}
                            <p className="product-brand">Brand: <strong>{product.brand || "N/A"}</strong></p>

                            {/* DESCRIPTION */}
                            <div className="product-description-section">
                                <h4>Description</h4>
                                <p>{product.description || "No description available."}</p>
                            </div>

                            {/* PRICE */}
                            <div className="product-price-box">
                                <div className="product-price-label">Price</div>
                                <div className="product-detail-price">₹{Number(product.price).toLocaleString("en-IN")}</div>
                            </div>

                            {/* STOCK / STATUS */}
                            <div className="product-status-row">
                                <span className={unavailable || outOfStock ? "product-status-badge product-status-unavailable" : "product-status-badge product-status-available"}>
                                    {unavailable || outOfStock ? "Unavailable" : "Available"}
                                </span>

                                <span className={lowStock ? "product-stock-badge product-stock-low" : "product-stock-badge"}>
                                    {outOfStock ? "Out of stock" : `${product.stockQuantity} units available`}
                                </span>
                            </div>

                            {/* ADD TO CART */}
                            <button
                                type="button"
                                className={unavailable || outOfStock || addingToCart ? "product-add-cart-btn product-add-cart-disabled" : "product-add-cart-btn"}
                                disabled={unavailable || outOfStock || addingToCart}
                                onClick={handleAddToCart}
                            >
                                {addingToCart ? "Adding..." : outOfStock ? "Out of Stock" : unavailable ? "Unavailable" : "Add to Cart"}
                            </button>

                            {/* ADMIN / VENDOR */}
                            {canManageProduct && (
                                <div className="product-management-actions">
                                    <button type="button" className="product-update-btn" onClick={handleEditClick}>✏️ Update</button>

                                    <button type="button" className="product-delete-btn" disabled={deleting} onClick={deleteProduct}>
                                        {deleting ? "Deleting..." : "🗑️ Delete"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Product;