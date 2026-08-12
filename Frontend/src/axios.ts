import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8080/api"
});

const token =
    localStorage.getItem("token");

if (token) {

    API.defaults.headers.common[
        "Authorization"
    ] = `Bearer ${token}`;
}

export default API;