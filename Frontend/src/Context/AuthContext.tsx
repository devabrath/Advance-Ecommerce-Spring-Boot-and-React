import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode
} from "react";

import API from "../axios";

export interface User {
    token: string;
    userId: number;
    firstName: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (userData: User) => void;
    logout: () => void;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext =
    createContext<AuthContextType | null>(null);

export const AuthProvider = ({
    children
}: AuthProviderProps) => {

    const [user, setUser] =
        useState<User | null>(() => {

            const savedUser =
                localStorage.getItem("user");

            if (!savedUser) {
                return null;
            }

            try {
                return JSON.parse(savedUser) as User;
            } catch {
                localStorage.removeItem("user");
                localStorage.removeItem("token");

                return null;
            }
        });

    useEffect(() => {

        if (user?.token) {

            API.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${user.token}`;

        } else {

            delete API.defaults.headers.common[
                "Authorization"
            ];
        }

    }, [user]);

    const login = (userData: User) => {

        localStorage.setItem(
            "token",
            userData.token
        );

        localStorage.setItem(
            "user",
            JSON.stringify(userData)
        );

        setUser(userData);
    };

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        delete API.defaults.headers.common[
            "Authorization"
        ];

        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: user !== null,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {

    const context =
        useContext(AuthContext);

    if (context === null) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};

export default AuthContext;