import axios from "axios";


// =========================================================
// AXIOS API INSTANCE
// =========================================================

const api = axios.create({

    baseURL: "http://localhost:6060",

    headers: {
        "Content-Type": "application/json",
    },

});


// =========================================================
// JWT REQUEST INTERCEPTOR
// =========================================================
// Har API request se pehle localStorage se adminToken
// automatically uthaya jayega.
//
// Protected backend APIs ko request:
// Authorization: Bearer <JWT_TOKEN>
// ke saath jayegi.
// =========================================================

api.interceptors.request.use(

    (config) => {

        const token =
            localStorage.getItem("adminToken");


        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }


        return config;

    },

    (error) => {

        return Promise.reject(error);

    }

);


// =========================================================
// RESPONSE INTERCEPTOR
// =========================================================
// Agar backend 401 Unauthorized return kare,
// to stored authentication clear kar di jayegi.
//
// Example:
// JWT expire/invalid → logout
// =========================================================

api.interceptors.response.use(

    (response) => {

        return response;

    },

    (error) => {

        if (
            error.response?.status === 401 &&
            localStorage.getItem("adminToken")
        ) {

            localStorage.removeItem("adminToken");

            localStorage.removeItem("admin");

        }


        return Promise.reject(error);

    }

);


export default api;