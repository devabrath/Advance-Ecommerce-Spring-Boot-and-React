import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import API from "../axios";


interface OrderItem {

    productId?: number;

    productName?: string;

    quantity?: number;

    price?: number;

    totalPrice?: number;
}


interface Order {

    orderId: number;

    totalAmount: number;

    orderStatus: string;

    paymentStatus: string;

    shippingFullName: string;

    shippingPhone: string;

    shippingAddressLine: string;

    shippingCity: string;

    shippingState: string;

    shippingPostalCode: string;

    shippingLandmark?: string;

    items: OrderItem[];

    createdAt: string;
}


const ITEMS_PER_PAGE = 20;


const AdminOrders = () => {


    // =====================================================
    // STATE
    // =====================================================

    const [orders, setOrders] =
        useState<Order[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [currentPage, setCurrentPage] =
        useState(1);

    const [selectedOrder, setSelectedOrder] =
        useState<Order | null>(null);

    const [showDetails, setShowDetails] =
        useState(false);

    const [updatingStatus, setUpdatingStatus] =
        useState(false);


    // =====================================================
    // LOAD ORDERS
    // =====================================================

    const fetchOrders = async () => {

        try {

            setLoading(true);

            setError("");


            const response =
                await API.get<Order[]>(
                    "/admin/orders"
                );


            setOrders(
                response.data
            );


        } catch (err: any) {

            console.error(
                "Admin orders error:",
                err
            );


            setError(
                err?.response?.data ||
                "Unable to load orders."
            );


        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        fetchOrders();

    }, []);


    // =====================================================
    // FILTER ORDERS
    // =====================================================

    const filteredOrders =
        useMemo(() => {

            const searchValue =
                search
                    .trim()
                    .toLowerCase();


            return orders.filter(
                order => {

                    const matchesSearch =

                        String(
                            order.orderId
                        )
                            .toLowerCase()
                            .includes(
                                searchValue
                            )

                        ||

                        order.shippingFullName
                            ?.toLowerCase()
                            .includes(
                                searchValue
                            )

                        ||

                        order.shippingPhone
                            ?.toLowerCase()
                            .includes(
                                searchValue
                            );


                    const matchesStatus =

                        statusFilter === "ALL"

                        ||

                        order.orderStatus ===
                        statusFilter;


                    return (

                        matchesSearch

                        &&

                        matchesStatus

                    );
                }
            );

        }, [

            orders,

            search,

            statusFilter

        ]);


    // =====================================================
    // RESET PAGE WHEN FILTER CHANGES
    // =====================================================

    useEffect(() => {

        setCurrentPage(1);

    }, [

        search,

        statusFilter

    ]);


    // =====================================================
    // PAGINATION
    // =====================================================

    const totalPages =
        Math.ceil(
            filteredOrders.length /
            ITEMS_PER_PAGE
        );


    const startIndex =
        (currentPage - 1) *
        ITEMS_PER_PAGE;


    const endIndex =
        startIndex +
        ITEMS_PER_PAGE;


    const paginatedOrders =
        filteredOrders.slice(
            startIndex,
            endIndex
        );


    const goToPage = (
        page: number
    ) => {

        if (
            page < 1 ||
            page > totalPages
        ) {

            return;
        }


        setCurrentPage(page);
    };


    // =====================================================
    // STATUS LIST
    // =====================================================

    const statuses =
        Array.from(

            new Set(

                orders.map(
                    order =>
                        order.orderStatus
                )

            )

        );


    // =====================================================
    // VIEW ORDER
    // =====================================================

    const handleViewOrder = async (
        orderId: number
    ) => {

        try {

            const response =
                await API.get<Order>(
                    `/admin/orders/${orderId}`
                );


            setSelectedOrder(
                response.data
            );


            setShowDetails(true);


        } catch (err: any) {

            console.error(
                "Order details error:",
                err
            );


            alert(
                err?.response?.data ||
                "Unable to load order details."
            );
        }
    };


    // =====================================================
    // UPDATE ORDER STATUS
    // =====================================================

    const updateStatus = async (
        status: string
    ) => {

        if (!selectedOrder) {

            return;
        }


        try {

            setUpdatingStatus(true);


            const response =
                await API.put<Order>(
                    `/admin/orders/${selectedOrder.orderId}/status`,
                    {
                        status
                    }
                );


            setSelectedOrder(
                response.data
            );


            setOrders(
                previous =>
                    previous.map(
                        order =>

                            order.orderId ===
                            selectedOrder.orderId

                                ? response.data

                                : order
                    )
            );


        } catch (err: any) {

            console.error(
                "Update order status error:",
                err
            );


            alert(
                err?.response?.data ||
                "Unable to update order status."
            );


        } finally {

            setUpdatingStatus(false);
        }
    };


    // =====================================================
    // STATUS CLASS
    // =====================================================

    const getStatusClass = (
        status: string
    ) => {

        switch (
            status?.toUpperCase()
        ) {

            case "CANCELLED":

                return "disabled";


            case "DELIVERED":

                return "active";


            default:

                return "active";
        }
    };


    // =====================================================
    // CLOSE DETAILS
    // =====================================================

    const closeDetails = () => {

        setShowDetails(false);

        setSelectedOrder(null);
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="admin-customers-page">

                <div className="customer-loading">

                    Loading orders...

                </div>

            </div>
        );
    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="admin-customers-page">


            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="customers-header">

                <div>

                    <h1>
                        Manage Orders
                    </h1>

                    <p>
                        View and manage all customer
                        orders.
                    </p>

                </div>

            </div>


            {/* ================================================= */}
            {/* ERROR */}
            {/* ================================================= */}

            {error && (

                <div className="customer-error">

                    {error}

                </div>

            )}


            {/* ================================================= */}
            {/* TOOLBAR */}
            {/* ================================================= */}

            <div className="customer-toolbar">


                {/* SEARCH */}

                <input
                    type="text"
                    placeholder="Search Order ID, customer or phone..."
                    value={search}
                    onChange={e =>
                        setSearch(
                            e.target.value
                        )
                    }
                />


                {/* STATUS FILTER */}

                <select
                    value={statusFilter}
                    onChange={e =>
                        setStatusFilter(
                            e.target.value
                        )
                    }
                    className="admin-filter-select"
                >

                    <option value="ALL">

                        All Status

                    </option>


                    {statuses.map(
                        status => (

                            <option
                                key={status}
                                value={status}
                            >

                                {status}

                            </option>

                        )
                    )}

                </select>


                {/* COUNT */}

                <span>

                    {filteredOrders.length === 0

                        ? "Showing 0 orders"

                        : `Showing ${
                            startIndex + 1
                        } - ${
                            Math.min(
                                endIndex,
                                filteredOrders.length
                            )
                        } of ${
                            filteredOrders.length
                        } orders`

                    }

                </span>

            </div>


            {/* ================================================= */}
            {/* TABLE */}
            {/* ================================================= */}

            <div className="customer-table-container">

                <table className="customer-table">

                    <thead>

                        <tr>

                            <th>
                                Order ID
                            </th>

                            <th>
                                Customer
                            </th>

                            <th>
                                Amount
                            </th>

                            <th>
                                Payment
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Date
                            </th>

                            <th>
                                Actions
                            </th>

                        </tr>

                    </thead>


                    <tbody>


                        {/* EMPTY */}

                        {paginatedOrders.length === 0 ? (

                            <tr>

                                <td
                                    colSpan={7}
                                    className="empty-customers"
                                >

                                    No orders found.

                                </td>

                            </tr>

                        ) : (

                            paginatedOrders.map(
                                order => (

                                    <tr
                                        key={
                                            order.orderId
                                        }
                                    >


                                        {/* ORDER ID */}

                                        <td>

                                            <strong>

                                                #
                                                {
                                                    order.orderId
                                                }

                                            </strong>

                                        </td>


                                        {/* CUSTOMER */}

                                        <td>

                                            <strong>

                                                {
                                                    order.shippingFullName
                                                }

                                            </strong>

                                        </td>


                                        {/* AMOUNT */}

                                        <td>

                                            <strong>

                                                ₹
                                                {Number(
                                                    order.totalAmount
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}

                                            </strong>

                                        </td>


                                        {/* PAYMENT */}

                                        <td>

                                            <span
                                                className={
                                                    `customer-status ${
                                                        order.paymentStatus ===
                                                        "SUCCESS"
                                                            ? "active"
                                                            : "disabled"
                                                    }`
                                                }
                                            >

                                                {
                                                    order.paymentStatus
                                                }

                                            </span>

                                        </td>


                                        {/* ORDER STATUS */}

                                        <td>

                                            <span
                                                className={
                                                    `customer-status ${getStatusClass(
                                                        order.orderStatus
                                                    )}`
                                                }
                                            >

                                                {
                                                    order.orderStatus
                                                }

                                            </span>

                                        </td>


                                        {/* DATE */}

                                        <td>

                                            {
                                                order.createdAt

                                                    ? new Date(
                                                        order.createdAt
                                                    ).toLocaleDateString(
                                                        "en-IN"
                                                    )

                                                    : "-"
                                            }

                                        </td>


                                        {/* ACTION */}

                                        <td>

                                            <div className="customer-actions">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleViewOrder(
                                                            order.orderId
                                                        )
                                                    }
                                                >

                                                    View

                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                )
                            )

                        )}

                    </tbody>

                </table>

            </div>


            {/* ================================================= */}
            {/* PAGINATION */}
            {/* ================================================= */}

            {totalPages > 1 && (

                <div className="customer-pagination">


                    {/* PREVIOUS */}

                    <button
                        type="button"
                        className="admin-pagination-button"
                        disabled={
                            currentPage === 1
                        }
                        onClick={() =>
                            goToPage(
                                currentPage - 1
                            )
                        }
                    >

                        ← Previous

                    </button>


                    {/* PAGE NUMBERS */}

                    {Array.from(
                        {
                            length:
                                totalPages
                        },
                        (
                            _,
                            index
                        ) =>
                            index + 1
                    ).map(
                        page => (

                            <button
                                key={page}
                                type="button"
                                onClick={() =>
                                    goToPage(page)
                                }
                                className={
                                    `admin-pagination-button ${
                                        currentPage ===
                                        page
                                            ? "active"
                                            : ""
                                    }`
                                }
                            >

                                {page}

                            </button>

                        )
                    )}


                    {/* NEXT */}

                    <button
                        type="button"
                        className="admin-pagination-button"
                        disabled={
                            currentPage ===
                            totalPages
                        }
                        onClick={() =>
                            goToPage(
                                currentPage + 1
                            )
                        }
                    >

                        Next →

                    </button>

                </div>

            )}


            {/* ================================================= */}
            {/* ORDER DETAILS MODAL */}
            {/* ================================================= */}

            {showDetails &&
                selectedOrder && (

                    <div
                        className="customer-modal-overlay"
                        onClick={
                            closeDetails
                        }
                    >

                        <div
                            className="customer-modal"
                            onClick={e =>
                                e.stopPropagation()
                            }
                        >


                            {/* ================================= */}
                            {/* MODAL HEADER */}
                            {/* ================================= */}

                            <div className="customer-modal-header">

                                <div>

                                    <h2>

                                        Order #

                                        {
                                            selectedOrder.orderId
                                        }

                                    </h2>


                                    <small className="admin-muted-text">

                                        {
                                            selectedOrder.createdAt

                                                ? new Date(
                                                    selectedOrder.createdAt
                                                ).toLocaleString(
                                                    "en-IN"
                                                )

                                                : "-"
                                        }

                                    </small>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        closeDetails
                                    }
                                >

                                    ×

                                </button>

                            </div>


                            {/* ================================= */}
                            {/* CUSTOMER DETAILS */}
                            {/* ================================= */}

                            <div className="customer-detail-list">


                                {/* CUSTOMER */}

                                <div>

                                    <span>
                                        Customer
                                    </span>

                                    <strong>

                                        {
                                            selectedOrder.shippingFullName
                                        }

                                    </strong>

                                </div>


                                {/* PHONE */}

                                <div>

                                    <span>
                                        Phone
                                    </span>

                                    <strong>

                                        {
                                            selectedOrder.shippingPhone
                                        }

                                    </strong>

                                </div>


                                {/* PAYMENT */}

                                <div>

                                    <span>
                                        Payment
                                    </span>

                                    <strong>

                                        {
                                            selectedOrder.paymentStatus
                                        }

                                    </strong>

                                </div>


                                {/* ORDER STATUS */}

                                <div>

                                    <span>
                                        Order Status
                                    </span>

                                    <strong>

                                        {
                                            selectedOrder.orderStatus
                                        }

                                    </strong>

                                </div>


                                {/* TOTAL */}

                                <div>

                                    <span>
                                        Total Amount
                                    </span>

                                    <strong>

                                        ₹
                                        {Number(
                                            selectedOrder.totalAmount
                                        ).toLocaleString(
                                            "en-IN"
                                        )}

                                    </strong>

                                </div>


                                {/* ADDRESS */}

                                <div>

                                    <span>
                                        Address
                                    </span>

                                    <strong className="admin-order-address">

                                        {
                                            selectedOrder
                                                .shippingAddressLine
                                        }

                                        <br />

                                        {
                                            selectedOrder
                                                .shippingCity
                                        }

                                        {", "}

                                        {
                                            selectedOrder
                                                .shippingState
                                        }

                                        {" - "}

                                        {
                                            selectedOrder
                                                .shippingPostalCode
                                        }

                                        {
                                            selectedOrder
                                                .shippingLandmark

                                                ? ` (${selectedOrder.shippingLandmark})`

                                                : ""
                                        }

                                    </strong>

                                </div>

                            </div>


                            {/* ================================= */}
                            {/* ORDER ITEMS */}
                            {/* ================================= */}

                            <div className="admin-order-items">

                                <h3>

                                    Order Items

                                </h3>


                                {selectedOrder.items?.length === 0 && (

                                    <div className="admin-muted-text">

                                        No items found.

                                    </div>

                                )}


                                {selectedOrder.items?.map(
                                    (
                                        item,
                                        index
                                    ) => (

                                        <div
                                            key={index}
                                            className="admin-order-item"
                                        >

                                            <div>

                                                <strong>

                                                    {
                                                        item.productName

                                                        ||

                                                        `Product #${item.productId}`
                                                    }

                                                </strong>


                                                <div className="admin-order-item-meta">

                                                    Qty:
                                                    {" "}

                                                    {
                                                        item.quantity
                                                    }

                                                </div>

                                            </div>


                                            <strong>

                                                ₹
                                                {Number(

                                                    item.totalPrice

                                                    ??

                                                    (

                                                        (
                                                            item.price
                                                            ??
                                                            0
                                                        )

                                                        *

                                                        (
                                                            item.quantity
                                                            ??
                                                            0
                                                        )

                                                    )

                                                ).toLocaleString(
                                                    "en-IN"
                                                )}

                                            </strong>

                                        </div>

                                    )
                                )}

                            </div>


                            {/* ================================= */}
                            {/* UPDATE STATUS */}
                            {/* ================================= */}

                            <div className="admin-order-status-section">


                                <label className="admin-form-label">

                                    Update Order Status

                                </label>


                                <div className="admin-status-update-row">

                                    <select
                                        className="admin-filter-select"
                                        value={
                                            selectedOrder
                                                .orderStatus
                                        }
                                        disabled={
                                            updatingStatus
                                        }
                                        onChange={e =>
                                            updateStatus(
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="PLACED">
                                            PLACED
                                        </option>

                                        <option value="CONFIRMED">
                                            CONFIRMED
                                        </option>

                                        <option value="PROCESSING">
                                            PROCESSING
                                        </option>

                                        <option value="SHIPPED">
                                            SHIPPED
                                        </option>

                                        <option value="DELIVERED">
                                            DELIVERED
                                        </option>

                                        <option value="CANCELLED">
                                            CANCELLED
                                        </option>

                                    </select>

                                </div>


                                {updatingStatus && (

                                    <small className="admin-muted-text">

                                        Updating status...

                                    </small>

                                )}

                            </div>

                        </div>

                    </div>

                )}

        </div>
    );
};


export default AdminOrders;