import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import useCurrentUser from "../hooks/useCurrentUser";
import Sidebar from "../components/Sidebar";

import vignanLogo from "../assets/vignan-white.png";
import homeIcon from "../assets/home.png";
import searchIcon from "../assets/search.png";
import createIcon from "../assets/create.png";
import messageIcon from "../assets/message.png";
import notificationIcon from "../assets/notification.png";
import profileIcon from "../assets/profile.png";
import logoutIcon from "../assets/logout.png";

import "./Home.css"; // Ensure sidebar and home-page styles are loaded
import "./UploadPost.css";

function UploadPost() {
    const user = useCurrentUser();
    const navigate = useNavigate();

    const [caption, setCaption] = useState("");
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        } else {
            setFile(null);
            setPreviewUrl(null);
        }
    };

    const uploadPost = async () => {
        if (!user) {
            alert("Loading user...");
            return;
        }

        if (!file) {
            alert("Please select an image");
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            await api.post(
                `/posts/upload/${user.id}?caption=${encodeURIComponent(caption)}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            // Successfully uploaded
            setCaption("");
            setFile(null);
            setPreviewUrl(null);
            setIsUploading(false);
            
            // Redirect to home to see the new post
            navigate("/home");
            
        } catch (error) {
            console.error(error);
            setIsUploading(false);
            alert(
                error.response?.data?.detail ||
                error.message ||
                "Upload Failed"
            );
        }
    };

    if (!user) return <div className="home-page" style={{color: 'white', padding: '40px'}}>Loading User...</div>;

    return (
        <div className="home-page">
            <Sidebar />

            <main className="upload-layout">
                <div className="upload-container">
                    <div className="upload-header">
                        <h1>Create new post</h1>
                        <p>Share a photo with your friends</p>
                    </div>

                    <div className="upload-form-group">
                        <label>Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="upload-file-input"
                        />
                        {previewUrl && (
                            <img src={previewUrl} alt="Preview" className="upload-preview" />
                        )}
                    </div>

                    <div className="upload-form-group">
                        <label>Caption</label>
                        <textarea
                            className="upload-input"
                            placeholder="Write a caption..."
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            rows="4"
                        />
                    </div>

                    <button
                        className="upload-btn"
                        onClick={uploadPost}
                        disabled={isUploading || !file}
                    >
                        {isUploading ? "Uploading..." : "Share Post"}
                    </button>
                </div>
            </main>
        </div>
    );
}

export default UploadPost;