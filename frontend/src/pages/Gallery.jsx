import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import createIcon from "../assets/create.png";

import "./Gallery.css";

function Gallery() {
    const [folders, setFolders] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchFolders();
    }, []);

    async function fetchFolders() {
        try {
            const res = await api.get("/gallery/folders");
            setFolders(res.data);
        } catch (error) {
            console.error("Error fetching folders:", error);
        }
    }

    const handleCreateFolder = async () => {
        if (!newTitle.trim()) {
            alert("Title is required");
            return;
        }

        const formData = new FormData();
        formData.append("title", newTitle.trim());

        const file = fileInputRef.current?.files[0];
        if (file) {
            formData.append("file", file);
        }

        try {
            const res = await api.post("/gallery/folders", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setFolders([res.data, ...folders]);
            setIsCreating(false);
            setNewTitle("");
        } catch (error) {
            console.error("Error creating folder:", error);
            alert("Failed to create folder");
        }
    };

    return (
        <div className="home-page">
            <Sidebar />

            <main className="gallery-layout">
                <div className="gallery-header">
                    <h2>Gallery</h2>
                    <button className="login-btn create-folder-btn" onClick={() => setIsCreating(true)}>
                        <img src={createIcon} alt="Create" style={{ width: '20px', height: '20px', marginRight: '8px', filter: 'brightness(0) invert(1)' }} />
                        Create Folder
                    </button>
                </div>

                {isCreating && (
                    <div className="create-folder-modal">
                        <div className="create-folder-content">
                            <h3>Create New Folder</h3>
                            <input
                                type="text"
                                placeholder="Folder Title"
                                className="login-input"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                            />
                            <div style={{ marginTop: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f5' }}>Cover Image (optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    style={{ color: '#f5f5f5' }}
                                />
                            </div>
                            <div className="create-folder-actions">
                                <button className="login-btn cancel-btn" onClick={() => setIsCreating(false)}>Cancel</button>
                                <button className="login-btn" onClick={handleCreateFolder}>Create</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="gallery-grid">
                    {folders.map(folder => (
                        <Link to={`/gallery/${folder.id}`} key={folder.id} className="gallery-folder-card">
                            <div className="folder-cover">
                                {folder.cover_image_url ? (
                                    <img src={folder.cover_image_url} alt={folder.title} />
                                ) : (
                                    <div className="folder-cover-placeholder">
                                        <img src={createIcon} alt="" style={{ opacity: 0.2, width: '40px', height: '40px' }} />
                                    </div>
                                )}
                            </div>
                            <div className="folder-info">
                                <h4>{folder.title}</h4>
                            </div>
                        </Link>
                    ))}
                    {folders.length === 0 && !isCreating && (
                        <p style={{ color: '#8e8e8e', textAlign: 'center', gridColumn: '1 / -1', marginTop: '40px' }}>
                            No folders yet. Be the first to create one!
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Gallery;
