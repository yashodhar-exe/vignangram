import Select from "react-select";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

import logo from "../assets/vignangram-logo-white.png";

import "./Register.css";

const customSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: "#1d1f2b",
        border: "1px solid #3a3f55",
        borderRadius: "12px",
        minHeight: "54px",
        boxShadow: "none",
        borderColor: state.isFocused
            ? "#0095f6"
            : "#3a3f55"
    }),

    valueContainer: (provided) => ({
        ...provided,
        padding: "0 16px"
    }),

    singleValue: (provided) => ({
        ...provided,
        color: "#ffffff"
    }),

    placeholder: (provided) => ({
        ...provided,
        color: "#a8a8a8"
    }),

    menu: (provided) => ({
        ...provided,
        backgroundColor: "#2b2d38",
        borderRadius: "12px",
        overflow: "hidden"
    }),

    menuList: (provided) => ({
        ...provided,
        maxHeight: "240px",

        scrollbarWidth: "thin",
        scrollbarColor: "#707070 #2b2d38"
    }),

    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused
            ? "#40424d"
            : "#2b2d38",
        color: "#ffffff",
        cursor: "pointer"
    }),

    indicatorSeparator: () => ({
        display: "none"
    }),

    dropdownIndicator: (provided) => ({
        ...provided,
        color: "#ffffff"
    })
};

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] =
        useState({

            name: "",

            username: "",

            roll_number: "",

            email: "",

            password: "",

            confirm_password: "",

            day: "",

            month: "",

            year: "",

            branch: "",

            academic_year: "",

            section: "",

            gender: ""

        });
      const dayOptions = Array.from(
    { length: 31 },
    (_, i) => ({
        value: i + 1,
        label: String(i + 1)
    })
);

const monthOptions = [

    { value:"January", label:"January" },
    { value:"February", label:"February" },
    { value:"March", label:"March" },
    { value:"April", label:"April" },
    { value:"May", label:"May" },
    { value:"June", label:"June" },
    { value:"July", label:"July" },
    { value:"August", label:"August" },
    { value:"September", label:"September" },
    { value:"October", label:"October" },
    { value:"November", label:"November" },
    { value:"December", label:"December" }

];

const yearOptions = Array.from(
    { length: 40 },
    (_, i) => ({
        value: 2025 - i,
        label: String(2025 - i)
    })
);

const branchOptions = [

    { value:"CSE", label:"CSE" },
    { value:"CSE-AI", label:"CSE-AI" },
    { value:"CSE-DS", label:"CSE-DS" },
    { value:"ECE", label:"ECE" },
    { value:"EEE", label:"EEE" },
    { value:"Mechanical", label:"Mechanical" }

];

const academicYearOptions = [

    { value:"1", label:"1st Year" },
    { value:"2", label:"2nd Year" },
    { value:"3", label:"3rd Year" },
    { value:"4", label:"4th Year" }

];

const genderOptions = [

    { value:"Male", label:"Male" },
    { value:"Female", label:"Female" },
    { value:"Other", label:"Other" }

];
    const [otp, setOtp] =
        useState("");

    const [otpSent, setOtpSent] =
        useState(false);

    const [otpVerified, setOtpVerified] =
        useState(false);

    const [usernameAvailable,
        setUsernameAvailable] =
        useState(null);

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]:
            e.target.value

        });

    };

    const checkUsername =
        async (username) => {

        try {

            const res =
                await api.get(
                    `/auth/check-username/${username}`
                );

            setUsernameAvailable(
                res.data.available
            );

        }

        catch {

            setUsernameAvailable(
                false
            );

        }

    };

    const sendOTP = async () => {
        const requiredFields = ["name", "username", "roll_number", "email", "password", "confirm_password", "day", "month", "year", "branch", "academic_year", "section", "gender"];
        if (requiredFields.some(field => !formData[field])) {
            return alert("Please fill out all fields.");
        }
        if (formData.password !== formData.confirm_password) {
            return alert("Passwords do not match");
        }

        try {

            await api.post(
                "/auth/register",
                {

                    email:
                    formData.email

                }
            );

            setOtpSent(true);

            alert(
                "OTP sent successfully"
            );

        }

        catch (err) {

            alert(

                err.response?.data?.detail ||

                "Failed to send OTP"

            );

        }

    };

    const verifyAndSubmit = async () => {
        try {
            await api.post("/auth/verify-otp", { email: formData.email, otp });
            await api.post("/auth/create-account", {
                ...formData,
                dob: `${formData.year}-${formData.month}-${formData.day}`
            });
            alert("Account created successfully");
            navigate("/");
        } catch (err) {
            alert(err.response?.data?.detail || "Registration failed");
        }
    };

    return (

        <div className="register-page">

            <img
                src={logo}
                alt="logo"
                className="register-logo"
            />

            <div className="register-container">

                <h1>
                    Get Started on Vignangram!
                </h1>

                <p>
                    Sign up to see photos and
                    videos from your friends.
                </p>

                <input
                    name="name"
                    placeholder="Full Name"
                    onChange={handleChange}
                />

                <input
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) => {

                        handleChange(e);

                        checkUsername(
                            e.target.value
                        );

                    }}
                />

                {usernameAvailable === true && (

                    <span className="success">

                        Username Available

                    </span>

                )}

                {usernameAvailable === false && (

                    <span className="error">

                        Username Already Taken

                    </span>

                )}

                <input
                    name="roll_number"
                    placeholder="Roll Number"
                    onChange={handleChange}
                />

                <input
                    name="email"
                    placeholder="College Email"
                    onChange={handleChange}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                />

                <input
                    type="password"
                    name="confirm_password"
                    placeholder="Confirm Password"
                    onChange={handleChange}
                />

                <label>
                    Date of Birth
                </label>

                <div className="dob-row">
                    <Select
                        styles={customSelectStyles}
                        options={dayOptions}
                        placeholder="Day"
                        classNamePrefix="instagram"
                        onChange={(selected) =>
                            setFormData({
                                ...formData,
                                day: selected.value,
                            })
                        }
                    />

                    <Select
                        styles={customSelectStyles}
                        options={monthOptions}
                        placeholder="Month"
                        classNamePrefix="instagram"
                        onChange={(selected) =>
                            setFormData({
                                ...formData,
                                month: selected.value,
                            })
                        }
                    />

                    <Select
                        styles={customSelectStyles}
                        options={yearOptions}
                        placeholder="Year"
                        classNamePrefix="instagram"
                        onChange={(selected) =>
                            setFormData({
                                ...formData,
                                year: selected.value,
                            })
                        }
                    />
                </div>

                <Select
                    styles={customSelectStyles}
                    options={branchOptions}
                    placeholder="Branch"
                    classNamePrefix="instagram"
                    onChange={(selected) =>
                        setFormData({
                            ...formData,
                            branch: selected.value,
                        })
                    }
                />

                <Select
                    styles={customSelectStyles}
                    options={academicYearOptions}
                    placeholder="Academic Year"
                    classNamePrefix="instagram"
                    onChange={(selected) =>
                        setFormData({
                            ...formData,
                            academic_year: selected.value,
                        })
                    }
                />

                <input
                    name="section"
                    placeholder="Section"
                    onChange={handleChange}
                />

                <Select
                    styles={customSelectStyles}
                    options={genderOptions}
                    placeholder="Gender"
                    classNamePrefix="instagram"
                    onChange={(selected) =>
                        setFormData({
                            ...formData,
                            gender: selected.value,
                        })
                    }
                />

                {!otpSent ? (
                    <button onClick={sendOTP}>Send OTP</button>
                ) : (
                    <>
                        <input
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <button onClick={verifyAndSubmit}>Verify & Submit</button>
                    </>
                )}

                <Link to="/">
                    I already have an account
                </Link>

            </div>

        </div>

    );

}

export default Register;