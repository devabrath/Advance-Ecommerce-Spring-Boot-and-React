import axios from "../axios";
import {
    useState,
    useEffect,
    createContext,
    useContext,
    type ReactNode
} from "react";

export interface Product {
    id: number;
    name: string;
    description?: string;
    brand?: string;
    price: number;
    categoryId?: number;
    categoryName?: string;
    vendorId?: number;
    shopName?: string;
    releaseDate?: string;
    productAvailable: boolean;
    stockQuantity: number;
    imageName?: string;
    imageType?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CartItem extends Product {
    quantity: number;
}

interface AppContextType {
    data: Product[];
    isError: string;
    cart: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: number) => void;
    refreshData: () => Promise<void>;
    clearCart: () => void;
}

const AppContext = createContext<AppContextType | undefined>(
    undefined
);

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider = ({
    children
}: AppProviderProps) => {

    const [data, setData] = useState<Product[]>([]);

    const [isError, setIsError] =
        useState<string>("");

    const [cart, setCart] = useState<CartItem[]>(
        () => {
            const savedCart =
                localStorage.getItem("cart");

            return savedCart
                ? JSON.parse(savedCart)
                : [];
        }
    );

    const addToCart = (product: Product) => {

        const existingProductIndex =
            cart.findIndex(
                (item) =>
                    item.id === product.id
            );

        if (existingProductIndex !== -1) {

            const updatedCart = cart.map(
                (item, index) =>
                    index === existingProductIndex
                        ? {
                              ...item,
                              quantity:
                                  item.quantity + 1
                          }
                        : item
            );

            setCart(updatedCart);

        } else {

            const updatedCart = [
                ...cart,
                {
                    ...product,
                    quantity: 1
                }
            ];

            setCart(updatedCart);
        }
    };

    const removeFromCart = (
        productId: number
    ) => {

        const updatedCart =
            cart.filter(
                (item) =>
                    item.id !== productId
            );

        setCart(updatedCart);
    };

    const refreshData = async () => {

        try {

            const response =
                await axios.get<Product[]>(
                    "/products"
                );

            setData(response.data);

            setIsError("");

        } catch (error) {

            console.error(error);

            setIsError(
                "Failed to load products"
            );
        }
    };

    const clearCart = () => {

        setCart([]);

    };

    useEffect(() => {

        refreshData();

    }, []);

    useEffect(() => {

        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );

    }, [cart]);

    return (
        <AppContext.Provider
            value={{
                data,
                isError,
                cart,
                addToCart,
                removeFromCart,
                refreshData,
                clearCart
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {

    const context =
        useContext(AppContext);

    if (!context) {

        throw new Error(
            "useAppContext must be used inside AppProvider"
        );
    }

    return context;
};

export default AppContext;