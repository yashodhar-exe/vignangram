import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import api, { API_BASE_URL } from "../api/axios";
import Sidebar from "../components/Sidebar";

import vignanLogo from "../assets/vignan-white.png";
import homeIcon from "../assets/home.png";
import searchIcon from "../assets/search.png";
import likeIcon from "../assets/like.png";
import commentIcon from "../assets/comment.png";
import Avatar from "../components/Avatar";
import createIcon from "../assets/create.png";
import messageIcon from "../assets/message.png";
import notificationIcon from "../assets/notification.png";
import profileIcon from "../assets/profile.png";
import logoutIcon from "../assets/logout.png";

import "./Profile.css";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    
    // Modal state
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editBio, setEditBio] = useState("");
    const fileInputRef = useRef(null);

    const { id } = useParams();

    useEffect(() => {
        fetchProfileData();
    }, [id]);

    async function fetchProfileData() {
        window.dispatchEvent(new Event('show-loader'));
        try {
            let targetUserId = id;
            let isOwnProfile = false;

            const meRes = await api.get("/auth/me");
            const me = meRes.data;

            if (!id || id === String(me.id)) {
                targetUserId = me.id;
                isOwnProfile = true;
            }

            // Fetch profile stats
            const profileRes = await api.get(`/users/${targetUserId}`);
            const profileData = profileRes.data;
            profileData.isOwnProfile = isOwnProfile;
            setProfile(profileData);

            // Fetch user's posts
            const postsRes = await api.get(`/posts/user/${targetUserId}`);
            setPosts(postsRes.data);
            
            // Set edit form initial values
            if (isOwnProfile) {
                setEditName(profileData.name || "");
                setEditBio(profileData.bio || "");
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            window.dispatchEvent(new Event('hide-loader'));
        }
    }

    const handleSaveProfile = async () => {
        try {
            await api.put("/users/me", {
                name: editName,
                bio: editBio
            });
            setIsEditing(false);
            fetchProfileData();
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            await api.post("/users/me/profile_picture", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            });
            fetchProfileData();
        } catch (error) {
            console.error("Error uploading profile picture:", error);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
        try {
            await api.delete("/users/me");
            localStorage.removeItem("token");
            window.location.href = "/";
        } catch (error) {
            console.error("Error deleting account:", error);
            alert("Failed to delete account");
        }
    };

    const getImageUrl = (url) => {
        if (!url) return "";
        if (url.startsWith("http")) return url;
        return `${API_BASE_URL}${url}`;
    };

    if (!profile) return <div className="home-page"></div>;

    return (
        <div className="home-page">
            <Sidebar />

            <main className="profile-layout">
                <header className="profile-header">
                    <Avatar 
                        url={profile.profile_picture} 
                        name={profile.name || profile.username} 
                        className="profile-avatar-large" 
                        fontSize="60px"
                    />
                    <div className="profile-info">
                        <div className="profile-top-row">
                            <h2>{profile.name}</h2>
                            {profile.isOwnProfile && (
                                <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                                    Edit Profile
                                </button>
                            )}
                        </div>
                        <div className="profile-stats">
                            <div><span>{profile.posts}</span> posts</div>
                            <div><span>{profile.followers}</span> followers</div>
                            <div><span>{profile.following}</span> following</div>
                        </div>
                        <div className="profile-bio">
                            <h3>{profile.email}</h3>
                            <p>{profile.bio}</p>
                        </div>
                    </div>
                </header>

                <div className="profile-posts-grid">
                    {posts.map(post => (
                        <div key={post.id} className="profile-post-item">
                            {post.image_url && (
                                <img src={getImageUrl(post.image_url)} alt="post" />
                            )}
                        </div>
                    ))}
                </div>
            </main>

            {isEditing && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Edit Profile</h2>
                        
                        <label>Profile Picture</label>
                        <input 
                            type="file" 
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ marginBottom: '12px', color: 'white' }}
                        />

                        <label>Name</label>
                        <input 
                            type="text" 
                            className="modal-input" 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                        />

                        <label>Bio</label>
                        <textarea 
                            className="modal-input" 
                            rows="4"
                            value={editBio}
                            onChange={(e) => setEditBio(e.target.value)}
                            style={{ resize: 'none' }}
                        />

                        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button className="cancel-btn" style={{ backgroundColor: '#ed4956', color: 'white' }} onClick={handleDeleteAccount}>Delete Account</button>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                                <button className="save-btn" onClick={handleSaveProfile}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;