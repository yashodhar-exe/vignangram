import { useState, useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Avatar from "../components/Avatar";
import createIcon from "../assets/create.png";

import "./Communities.css";

function Communities() {
    const [currentUser, setCurrentUser] = useState(null);
    const [communities, setCommunities] = useState([]);
    const [activeCommunity, setActiveCommunity] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchCurrentUser();
        fetchCommunities();
    }, []);

    async function fetchCurrentUser() {
        try {
            const res = await api.get("/auth/me");
            setCurrentUser(res.data);
        } catch (err) {
            console.error("Failed to load user", err);
        }
    }

    useEffect(() => {
        let interval;
        if (activeCommunity) {
            fetchMessages(activeCommunity.id);
            markCommunityRead(activeCommunity.id);
            interval = setInterval(() => {
                fetchMessages(activeCommunity.id);
            }, 3000);
        } else {
            setMessages([]);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [activeCommunity]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages.length]);

    async function markCommunityRead(communityId) {
        try {
            await api.post(`/communities/${communityId}/mark-read`);
            setCommunities(prev => prev.map(c => c.id === communityId ? { ...c, unread_count: 0 } : c));
        } catch (error) {
            console.error("Error marking community as read:", error);
        }
    }

    async function fetchCommunities() {
        try {
            const res = await api.get("/communities/me");
            setCommunities(res.data);
        } catch (error) {
            console.error("Error fetching communities:", error);
        }
    }

    async function fetchMessages(communityId) {
        try {
            const res = await api.get(`/communities/${communityId}/messages`);
            setMessages(prev => {
                if (prev.length > 0 && res.data.length > 0 && prev.length === res.data.length && prev[prev.length-1].id === res.data[res.data.length-1].id) {
                    return prev;
                }
                return res.data;
            });
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    }

    const handleSend = async () => {
        if (!messageText.trim() || !activeCommunity) return;
        try {
            const res = await api.post(`/communities/${activeCommunity.id}/messages`, {
                content: messageText
            });
            setMessages([...messages, res.data]);
            setMessageText("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !activeCommunity) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await api.post(`/communities/${activeCommunity.id}/messages/image`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setMessages([...messages, res.data]);
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    const handleCreateCommunity = async () => {
        const name = window.prompt("Enter new community name:");
        if (!name || !name.trim()) return;
        try {
            const res = await api.post("/communities/", { name: name.trim() });
            setCommunities([...communities, res.data]);
            setActiveCommunity(res.data);
        } catch (error) {
            alert(error.response?.data?.detail || "Failed to create community");
        }
    };

    return (
        <div className="home-page">
            <Sidebar />

            <main className="messages-layout">
                <div className="messages-sidebar">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '20px', marginBottom: '24px' }}>
                        <h2 className="messages-title" style={{ margin: 0 }}>Communities</h2>
                        <img 
                            src={createIcon} 
                            alt="Create" 
                            style={{ width: '24px', height: '24px', cursor: 'pointer' }} 
                            onClick={handleCreateCommunity}
                        />
                    </div>
                    {communities.length === 0 && <p style={{color: '#8e8e8e', fontSize: '14px', paddingLeft: '20px'}}>No communities found.</p>}
                    {communities.map((community) => (
                        <div 
                            key={community.id} 
                            className={`contact-item ${activeCommunity?.id === community.id ? 'active' : ''}`}
                            onClick={() => {
                                setActiveCommunity(community);
                            }}
                        >
                            <Avatar url={community.image_url} name={community.name} className="contact-avatar" fontSize="20px" />
                            <div className="contact-info" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <h4>{community.name}</h4>
                                {community.unread_count > 0 && (
                                    <span className="unread-dot" style={{ position: 'static', marginLeft: '8px' }}></span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="chat-area">
                    {activeCommunity ? (
                        <>
                            <div className="chat-header">
                                <Avatar url={activeCommunity.image_url} name={activeCommunity.name} className="contact-avatar small" fontSize="16px" />
                                <h3>{activeCommunity.name}</h3>
                            </div>

                            <div className="chat-history">
                                {messages.map((msg) => {
                                    const isMe = currentUser && msg.sender_id === currentUser.id;
                                    return (
                                        <div key={msg.id} className={`chat-bubble-container ${isMe ? 'me' : 'other'}`}>
                                            {!isMe && <span className="sender-name">{msg.sender_username}</span>}
                                            <div className={`chat-bubble ${isMe ? 'me' : 'other'}`}>
                                                {msg.image_url ? (
                                                    <img src={msg.image_url} alt="Uploaded" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                                                ) : (
                                                    msg.content
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="chat-input-container">
                                <img 
                                    src={createIcon} 
                                    alt="Upload Image" 
                                    style={{ width: '24px', height: '24px', cursor: 'pointer', marginRight: '10px' }} 
                                    onClick={() => fileInputRef.current?.click()}
                                />
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    ref={fileInputRef} 
                                    style={{ display: 'none' }} 
                                    onChange={handleImageUpload} 
                                />
                                <input
                                    type="text"
                                    placeholder="Message..."
                                    className="login-input chat-input"
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                />
                                <button className="login-btn send-btn" onClick={handleSend}>
                                    Send
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8e8e8e' }}>
                            <p>Select a community to start messaging</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Communities;
