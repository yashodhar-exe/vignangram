import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";

import logo from "../assets/vignangram-logo.png";

function Login() {

    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem("token")) {
            navigate("/home");
        }
    }, [navigate]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const login = async () => {

        try {

            const response = await api.post("/auth/login", { email, password });

            localStorage.setItem("token", response.data.access_token);

            navigate("/home");

        } catch {

            alert(
                "Invalid Email or Password"
            );

        }

    };

    return (

        <div className="login-page">

            <div className="login-container">

                <img
                    src={logo}
                    alt="VignanGram"
                    className="login-logo"
                />

                <input type="text" placeholder="Email Address or Username" value={email} onChange={(e) => setEmail(e.target.value)} className="login-input" />

                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="login-input" />

                <button
                    onClick={login}
                    className="login-btn"
                >
                    Log in
                </button>

                <p className="forgot-password" onClick={() => (window.location.href = "/forgot-password")}>Forgotten password?</p>

                <button
                    onClick={() =>
                        navigate(
                            "/register"
                        )
                    }
                    className="create-account-btn"
                >
                    Create new account
                </button>

            </div>

        </div>

    );
}

export default Login;