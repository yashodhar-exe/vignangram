import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";

import "./Gallery.css";

function GalleryFolder() {
    const { folderId } = useParams();
    const [folder, setFolder] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchFolderDetails();
        fetchPhotos();
    }, [folderId]);

    async function fetchFolderDetails() {
        try {
            const res = await api.get(`/gallery/folders/${folderId}`);
            setFolder(res.data);
        } catch (error) {
            console.error("Error fetching folder details:", error);
        }
    }

    async function fetchPhotos() {
        try {
            const res = await api.get(`/gallery/folders/${folderId}/photos`);
            setPhotos(res.data);
        } catch (error) {
            console.error("Error fetching photos:", error);
        }
    }

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setIsUploading(true);
        try {
            const res = await api.post(`/gallery/folders/${folderId}/photos`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setPhotos([res.data, ...photos]);
        } catch (error) {
            console.error("Error uploading photo:", error);
            alert("Failed to upload photo");
        } finally {
            setIsUploading(false);
            e.target.value = null; // reset input
        }
    };

    return (
        <div className="home-page">
            <Sidebar />

            <main className="gallery-layout">
                <div className="gallery-header">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Link to="/gallery" style={{ color: '#8e8e8e', textDecoration: 'none', marginRight: '10px', fontSize: '24px' }}>&larr;</Link>
                        <h2>{folder ? folder.title : "Loading..."}</h2>
                    </div>
                    <button 
                        className="login-btn create-folder-btn" 
                        onClick={handleUploadClick}
                        disabled={isUploading}
                    >
                        {isUploading ? "Uploading..." : "Add Photo"}
                    </button>
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        onChange={handleFileChange} 
                    />
                </div>

                <div className="gallery-photos-grid">
                    {photos.map(photo => (
                        <div key={photo.id} className="gallery-photo-item">
                            <img src={photo.image_url} alt="Gallery item" />
                        </div>
                    ))}
                    {photos.length === 0 && (
                        <p style={{ color: '#8e8e8e', textAlign: 'center', gridColumn: '1 / -1', marginTop: '40px' }}>
                            No photos in this folder yet. Be the first to add one!
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
}

export default GalleryFolder;
