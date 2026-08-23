import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../Context/Context";
import { useAuth } from "../Context/AuthContext";
import API from "../axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

interface NavbarProps { onSelectCategory: (category: string) => void; }
interface Address { 
    id: number; 
    fullName: string; 
    phone: string; 
    addressLine: string; 
    city: string; 
    state: string; 
    postalCode: string; 
    landmark?: string; 
    addressType: string; 
    defaultAddress: boolean; }

const categories = [
    "Laptop", 
    "Headphone", 
    "Mobile", 
    "Electronics", 
    "Toys", 
    "Fashion"];

const Navbar = ({ onSelectCategory }: NavbarProps) => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const { clearCart } = useAppContext();
    const [input, setInput] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [noResults, setNoResults] = useState(false);
    const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);

    useEffect(() => {
        const fetchDefaultAddress = async () => {
            if (!isAuthenticated || user?.role !== "CUSTOMER") { setDefaultAddress(null); return; }
            try {
                const { data } = await API.get<Address[]>("/customer/addresses");
                setDefaultAddress(data.find(address => address.defaultAddress) || data[0] || null);
            } catch { setDefaultAddress(null); }
        };
        fetchDefaultAddress();
    }, [isAuthenticated, user?.userId, user?.role]);

    const handleSearch = async (value: string) => {
        setInput(value);
        if (!value.trim()) { setShowSearchResults(false); setSearchResults([]); setNoResults(false); return; }
        setShowSearchResults(true);
        try {
            const { data } = await API.get(`/products/search?keyword=${encodeURIComponent(value.trim())}`);
            setSearchResults(data);
            setNoResults(data.length === 0);
        } catch { setSearchResults([]); setNoResults(true); }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        setShowSearchResults(false);
        navigate(`/?search=${encodeURIComponent(input.trim())}`);
    };

    const handleCategorySelect = (category: string) => { onSelectCategory(category); navigate("/"); };

    const handleLogout = () => {
        clearCart();
        localStorage.removeItem("cart");
        logout();
        setDefaultAddress(null);
        navigate("/login");
    };

    const closeSearch = () => { setShowSearchResults(false); setInput(""); };
    const customerLink = isAuthenticated && user?.role === "CUSTOMER" ? "/orders" : "/login";

    return (
        <header>
            <nav className="navbar navbar-expand-xl fixed-top main-navbar">
                <div className="container-fluid px-3">
                    <Link to="/" className="navbar-brand main-logo">Dunique</Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation"><span className="navbar-toggler-icon" /></button>

                    <div className="collapse navbar-collapse" id="mainNavbar">
                        <div className="navbar-content">
                            <Link to="/" className="nav-home">Home</Link>

                            <Link to={isAuthenticated ? "/profile" : "/login"} className="delivery-link">
                                <span className="delivery-icon">🚚</span>
                                <span>
                                    <small>Deliver to</small>
                                    <strong>{isAuthenticated ? user?.firstName : "Sign in"}</strong>
                                    {defaultAddress && <small>{defaultAddress.city} - {defaultAddress.postalCode}</small>}
                                </span>
                            </Link>

                            <div className="dropdown">
                                <button className="nav-dropdown-btn dropdown-toggle" type="button" data-bs-toggle="dropdown">Categories</button>
                                <ul className="dropdown-menu nav-menu shadow">
                                    {categories.map(category => (
                                        <li key={category}><button className="dropdown-item" onClick={() => handleCategorySelect(category)}>{category}</button></li>
                                    ))}
                                </ul>
                            </div>

                            <form className="nav-search" onSubmit={handleSearchSubmit}>
                                <input type="search" className="form-control" placeholder="Search products..." value={input} onChange={e => handleSearch(e.target.value)} onFocus={() => input.trim() && setShowSearchResults(true)} />
                                <button type="submit" aria-label="Search">🔍</button>
                                {showSearchResults && (
                                    <ul className="search-results">
                                        {searchResults.length > 0 ? searchResults.map(result => (
                                            <li key={result.id}>
                                                <Link to={`/product/${result.id}`} onClick={closeSearch}>
                                                    <strong>{result.name}</strong>
                                                    {result.brand && <small>{result.brand}</small>}
                                                </Link>
                                            </li>
                                        )) : noResults && <li className="no-results">No products found</li>}
                                    </ul>
                                )}
                            </form>

                            <div className="dropdown">
                                <button className="nav-account dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                    <small>Hello, {isAuthenticated ? user?.firstName : "Sign in"}</small>
                                    <strong>Account</strong>
                                </button>

                                <ul className="dropdown-menu dropdown-menu-end nav-menu account-menu shadow">
                                    {isAuthenticated ? (
                                        <>
                                            {user?.role === "CUSTOMER" && (
                                                <>
                                                    <li><Link className="dropdown-item" to="/profile">👤 Your Profile</Link></li>
                                                    <li><Link className="dropdown-item" to="/orders">📦 Your Orders</Link></li>
                                                </>
                                            )}
                                            {user?.role === "VENDOR" && <li><Link className="dropdown-item" to="/vendor/dashboard">📊 Vendor Dashboard</Link></li>}
                                            {user?.role === "ADMIN" && <li><Link className="dropdown-item" to="/admin/dashboard">📊 Admin Dashboard</Link></li>}
                                            <li><hr className="dropdown-divider" /></li>
                                            <li><button className="dropdown-item logout-btn" onClick={handleLogout}>🚪 Logout</button></li>
                                        </>
                                    ) : (
                                        <>
                                            <li><Link className="dropdown-item" to="/login">🔐 Login</Link></li>
                                            <li><Link className="dropdown-item" to="/register">📝 Register</Link></li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            <Link to={customerLink} className="orders-link"><small>Returns</small><strong>& Orders</strong></Link>
                            <Link to={isAuthenticated ? "/cart" : "/login"} className="cart-link"><span>🛒</span><strong>Cart</strong></Link>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;