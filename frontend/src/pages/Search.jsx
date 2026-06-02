import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api, { API_BASE_URL } from "../api/axios";
import Sidebar from "../components/Sidebar";
import Avatar from "../components/Avatar";

import vignanLogo from "../assets/vignan-white.png";
import homeIcon from "../assets/home.png";
import searchIcon from "../assets/search.png";
import createIcon from "../assets/create.png";
import messageIcon from "../assets/message.png";
import notificationIcon from "../assets/notification.png";
import profileIcon from "../assets/profile.png";
import logoutIcon from "../assets/logout.png";

import "./Home.css"; // Ensure sidebar and home-page styles are loaded
import "./Search.css";

function Search() {
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [followingIds, setFollowingIds] = useState(new Set());

    useEffect(() => {
        fetchCurrentUserAndFollows();
    }, []);

    const fetchCurrentUserAndFollows = async () => {
        try {
            const userRes = await api.get("/auth/me");
            setCurrentUser(userRes.data);
            const followsRes = await api.get(`/follows/following/${userRes.data.id}`);
            const ids = new Set(followsRes.data.map(f => f.following_id));
            setFollowingIds(ids);
        } catch (e) {
            console.error(e);
        }
    };

    const handleFollow = async (e, targetUserId, isFollowing) => {
        e.preventDefault();
        e.stopPropagation();
        if (!currentUser) return;
        try {
            if (isFollowing) {
                await api.delete(`/follows/${currentUser.id}/${targetUserId}`);
                setFollowingIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(targetUserId);
                    return newSet;
                });
            } else {
                await api.post(`/follows/${currentUser.id}/${targetUserId}`);
                setFollowingIds(prev => {
                    const newSet = new Set(prev);
                    newSet.add(targetUserId);
                    return newSet;
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const searchUsers = async () => {
        if (!query.trim()) return;

        try {
            const res = await api.get(`/users/search/${query}`);
            setUsers(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const getImageUrl = (url) => {
        if (!url) return "";
        if (url.startsWith("http")) return url;
        return `${API_BASE_URL}${url}`;
    };

    return (
        <div className="home-page">
            <Sidebar />

            <main className="search-layout">
                <div className="search-header">
                    <h1>Search Users</h1>
                    <div className="search-input-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by name or email"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') searchUsers();
                            }}
                        />
                        <button className="search-btn" onClick={searchUsers}>
                            Search
                        </button>
                    </div>
                </div>

                <div className="search-results">
                    {users.map(user => (
                        <Link
                            key={user.id}
                            to={`/profile/${user.id}`}
                            className="search-result-item"
                        >
                            <Avatar 
                                url={user.profile_picture} 
                                name={user.name || user.username} 
                                className="search-avatar" 
                                fontSize="20px"
                            />
                            <div className="search-user-info">
                                <span className="search-user-name">{user.name}</span>
                                <span className="search-user-email">{user.email}</span>
                            </div>
                            {currentUser && currentUser.id !== user.id && (
                                <button
                                    className={`follow-btn ${followingIds.has(user.id) ? 'following' : ''}`}
                                    onClick={(e) => handleFollow(e, user.id, followingIds.has(user.id))}
                                >
                                    {followingIds.has(user.id) ? 'Following' : 'Follow'}
                                </button>
                            )}
                        </Link>
                    ))}
                    
                    {users.length === 0 && query.trim() !== "" && (
                        <p style={{ color: '#b3b3b3', marginTop: '20px' }}>No results found.</p>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Search;