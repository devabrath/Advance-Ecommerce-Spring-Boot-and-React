import React from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "../components/AdminSidebar";

const AdminLayout = () => {

    return (

        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f8fafc"
            }}
        >

            <AdminSidebar />

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

export default AdminLayout;