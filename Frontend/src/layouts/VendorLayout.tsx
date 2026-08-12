import React from "react";
import { Outlet } from "react-router-dom";

import VendorSidebar from "../components/VendorSidebar";

const VendorLayout = () => {
    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f8fafc"
            }}
        >

            <VendorSidebar />

            <main
                style={{
                    marginLeft: "250px",
                    minHeight: "100vh",
                    padding: "1px 30px"
                }}
            >
                <Outlet />
            </main>

        </div>
    );
};

export default VendorLayout;