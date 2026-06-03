import { useState } from "react";
import api from "../api/axios";
import "./ForgotPassword.css";

import logo from "../assets/vignangram-logo-white.png";

function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const sendOTP = async () => {
        try {
            await api.post("/password/forgot", { email });
            setStep(2);
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to send OTP");
        }
    };

    const resetPassword = async () => {
        try {
            await api.post("/password/reset", {
                email,
                otp,
                new_password: newPassword
            });
            alert("Password updated successfully!");
            window.location.href = "/";
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to reset password");
        }
    };

    return (
        <div className="forgot-page">
            <img src={logo} alt="Vignangram" className="forgot-logo" />
            <div className="forgot-container">
                {step === 1 && (
                    <>
                        <h1>Find Your Account</h1>
                        <p className="forgot-subtitle">Enter your Email Address</p>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendOTP()}
                        />
                        <p className="forgot-message">
                            You will receive a OTP to your registered email address for verification.
                        </p>
                        <button onClick={sendOTP}>Continue</button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h1>Reset Password</h1>
                        <p className="forgot-subtitle">Enter the OTP sent to {email}</p>
                        <input
                            type="text"
                            placeholder="OTP Code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && resetPassword()}
                        />
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && resetPassword()}
                        />
                        <button onClick={resetPassword}>Update Password</button>
                    </>
                )}
            </div>
        </div>
    );
}

export default ForgotPassword;