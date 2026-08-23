import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import VendorSidebar from "../components/VendorSidebar";

const VendorLayout = () => {

    const [darkMode, setDarkMode] =
        useState<boolean>(() => {

            return (
                localStorage.getItem(
                    "vendorDarkMode"
                ) === "true"
            );
        });


    useEffect(() => {

        localStorage.setItem(
            "vendorDarkMode",
            String(darkMode)
        );

    }, [darkMode]);


    return (

        <div
            className={
                darkMode
                    ? "admin-theme-dark"
                    : "admin-theme-light"
            }
            style={{
                minHeight: "100vh",

                backgroundColor:
                    darkMode
                        ? "#0f172a"
                        : "#f8fafc",

                color:
                    darkMode
                        ? "#f9fafb"
                        : "#111827",

                transition:
                    "background-color 0.2s ease"
            }}
        >

            <VendorSidebar
                darkMode={darkMode}
                setDarkMode={setDarkMode}
            />


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