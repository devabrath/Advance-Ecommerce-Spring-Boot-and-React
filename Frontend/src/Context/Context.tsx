import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode
} from "react";

import API from "../axios";


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


export interface CartItem
    extends Product {

    quantity: number;
}


interface BackendCartItem {

    id: number;

    productId: number;

    productName: string;

    imageName?: string;

    quantity: number;

    unitPrice: number;

    totalPrice: number;
}


interface BackendCartResponse {

    id: number;

    items: BackendCartItem[];

    totalItems: number;

    subtotal: number;
}


interface ProductPageResponse {

    content: Product[];

    page: number;

    size: number;

    totalElements: number;

    totalPages: number;

    first: boolean;

    last: boolean;
}


interface AppContextType {

    data: Product[];

    isError: string;

    currentPage: number;

    totalPages: number;

    totalProducts: number;

    cart: CartItem[];

    addToCart: (
        product: Product
    ) => Promise<void>;

    removeFromCart: (
        productId: number
    ) => Promise<void>;

    updateCartQuantity: (
        productId: number,
        quantity: number
    ) => Promise<void>;

    refreshData: (
        page?: number
    ) => Promise<void>;

    refreshCart: () => Promise<void>;

    clearCart: () => void;
}


interface AppProviderProps {

    children: ReactNode;
}


const AppContext =
    createContext<
        AppContextType | undefined
    >(undefined);


export const AppProvider = ({
    children
}: AppProviderProps) => {


    const [data, setData] =
        useState<Product[]>([]);


    const [isError, setIsError] =
        useState<string>("");


    const [cart, setCart] =
        useState<CartItem[]>([]);


    const [currentPage, setCurrentPage] =
        useState(0);


    const [totalPages, setTotalPages] =
        useState(0);


    const [totalProducts, setTotalProducts] =
        useState(0);


    // =====================================================
    // PRODUCTS
    // =====================================================

    const refreshData = async (
        page: number = 0
    ) => {

        try {

            const response =
                await API.get<ProductPageResponse>(
                    `/products?page=${page}&size=20`
                );


            setData(
                response.data.content
            );


            setCurrentPage(
                response.data.page
            );


            setTotalPages(
                response.data.totalPages
            );


            setTotalProducts(
                response.data.totalElements
            );


            setIsError("");


        } catch (error) {

            console.error(
                "Failed to load products:",
                error
            );


            setIsError(
                "Failed to load products"
            );
        }
    };


    // =====================================================
    // CART
    // =====================================================

    const refreshCart = async () => {

        const token =
            localStorage.getItem("token");


        if (!token) {

            setCart([]);

            return;
        }


        try {

            const response =
                await API.get<BackendCartResponse>(
                    "/customer/cart"
                );


            const backendItems =
                response.data.items || [];


            /*
             * IMPORTANT:
             *
             * We no longer download ALL
             * 500 products.
             *
             * Instead, fetch only products
             * actually inside the cart.
             */

            const convertedCart =
                await Promise.all(

                    backendItems.map(
                        async (item) => {

                            let product:
                                Product | null =
                                null;


                            try {

                                const productResponse =
                                    await API.get<Product>(
                                        `/product/${item.productId}`
                                    );


                                product =
                                    productResponse.data;


                            } catch (error) {

                                console.error(
                                    "Unable to load cart product:",
                                    item.productId,
                                    error
                                );
                            }


                            return {

                                id:
                                    item.productId,

                                name:
                                    item.productName,

                                description:
                                    product?.description,

                                brand:
                                    product?.brand,

                                price:
                                    Number(
                                        item.unitPrice
                                    ),

                                categoryId:
                                    product?.categoryId,

                                categoryName:
                                    product?.categoryName,

                                vendorId:
                                    product?.vendorId,

                                shopName:
                                    product?.shopName,

                                releaseDate:
                                    product?.releaseDate,

                                productAvailable:
                                    product?.productAvailable ??
                                    true,

                                stockQuantity:
                                    product?.stockQuantity ??
                                    0,

                                imageName:
                                    item.imageName ||
                                    product?.imageName,

                                imageType:
                                    product?.imageType,

                                quantity:
                                    item.quantity
                            };
                        }
                    )
                );


            setCart(
                convertedCart
            );


        } catch (error) {

            console.error(
                "Failed to load cart:",
                error
            );


            setCart([]);
        }
    };


    // =====================================================
    // ADD TO CART
    // =====================================================

    const addToCart = async (
        product: Product
    ) => {

        try {

            await API.post(
                "/customer/cart/items",
                {
                    productId:
                        product.id,

                    quantity: 1
                }
            );


            await refreshCart();


        } catch (error: any) {

            console.error(
                "Error adding product to cart:",
                error
            );


            alert(
                error?.response?.data ||
                "Unable to add product to cart"
            );
        }
    };


    // =====================================================
    // UPDATE QUANTITY
    // =====================================================

    const updateCartQuantity = async (
        productId: number,
        quantity: number
    ) => {

        try {

            await API.put(
                `/customer/cart/items/${productId}`,
                {
                    quantity: quantity
                }
            );


            await refreshCart();


        } catch (error: any) {

            console.error(
                "Error updating cart:",
                error
            );


            alert(
                error?.response?.data ||
                "Unable to update cart"
            );
        }
    };


    // =====================================================
    // REMOVE
    // =====================================================

    const removeFromCart = async (
        productId: number
    ) => {

        try {

            await API.delete(
                `/customer/cart/items/${productId}`
            );


            await refreshCart();


        } catch (error: any) {

            console.error(
                "Error removing cart item:",
                error
            );


            alert(
                error?.response?.data ||
                "Unable to remove item"
            );
        }
    };


    // =====================================================
    // CLEAR CART
    // =====================================================

    const clearCart = () => {

        setCart([]);
    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        refreshData(0);


        const token =
            localStorage.getItem("token");


        if (token) {

            refreshCart();
        }

    }, []);


    return (

        <AppContext.Provider
            value={{

                data,

                isError,

                currentPage,

                totalPages,

                totalProducts,

                cart,

                addToCart,

                removeFromCart,

                updateCartQuantity,

                refreshData,

                refreshCart,

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