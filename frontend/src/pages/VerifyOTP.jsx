import { useState } from "react";
import api from "../api/axios";

function VerifyOTP() {

    const [otp, setOtp] = useState("");

    const verify = async () => {

        try {

            const res = await api.post(
                "/auth/verify",
                {
                    name:
                        localStorage.getItem(
                            "pending_name"
                        ),

                    email:
                        localStorage.getItem(
                            "pending_email"
                        ),

                    password:
                        localStorage.getItem(
                            "pending_password"
                        ),

                    otp
                }
            );

            localStorage.setItem(
                "token",
                res.data.access_token
            );

            alert(
                "Account Created"
            );

            window.location.href =
                "/home";

        } catch {

            alert("Invalid OTP");
        }
    };

    return (

        <div>

            <h1>Verify OTP</h1>

            <input
                placeholder="Enter OTP"
                onChange={(e) =>
                    setOtp(e.target.value)
                }
            />

            <button onClick={verify}>
                Verify
            </button>

        </div>

    );
}

export default VerifyOTP;