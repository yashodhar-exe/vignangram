import { useState, useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
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

import "./Messages.css";

function Messages() {
    const [currentUser, setCurrentUser] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [activeContact, setActiveContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");
    const fileInputRef = useRef(null);

    // Fetch user and contacts on mount
    useEffect(() => {
        fetchCurrentUser();
        fetchContacts();
    }, []);

    async function fetchCurrentUser() {
        try {
            const res = await api.get("/auth/me");
            setCurrentUser(res.data);
        } catch (err) {
            console.error("Failed to load user", err);
        }
    }

    // Fetch messages when active contact changes
    useEffect(() => {
        if (activeContact) {
            fetchMessages(activeContact.id);
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setMessages([]);
        }
    }, [activeContact]);

    async function fetchContacts() {
        try {
            const res = await api.get("/messages/contacts");
            setContacts(res.data);
        } catch (error) {
            console.error("Error fetching contacts:", error);
        }
    }

    async function fetchMessages(otherUserId) {
        try {
            const res = await api.get(`/messages/${otherUserId}`);
            setMessages(res.data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    }

    const handleSend = async () => {
        if (!messageText.trim() || !activeContact) return;
        try {
            const res = await api.post(`/messages/${activeContact.id}`, {
                content: messageText
            });
            setMessages([...messages, res.data]);
            setMessageText("");
            
            // Optionally, refresh contacts to update the 'last message' snippet
            fetchContacts();
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !activeContact) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await api.post(`/messages/${activeContact.id}/image`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setMessages([...messages, res.data]);
            fetchContacts();
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    return (
        <div className="home-page">
            <Sidebar />

            <main className="messages-layout">
                <div className="messages-sidebar">
                    <h2 className="messages-title">Messages</h2>
                    {contacts.length === 0 && <p style={{color: '#8e8e8e', fontSize: '14px'}}>No contacts found.</p>}
                    {contacts.map((contact) => (
                        <div 
                            key={contact.id} 
                            className={`contact-item ${activeContact?.id === contact.id ? 'active' : ''}`}
                            onClick={() => {
                                setActiveContact(contact);
                                // Optimistically clear unread on click
                                setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, unread_count: 0 } : c));
                            }}
                        >
                            <Avatar url={contact.profile_picture} name={contact.name || contact.username} className="contact-avatar" fontSize="20px" />
                            <div className="contact-info">
                                <h4>{contact.username}</h4>
                                <p className={contact.unread_count > 0 ? "unread-text" : ""}>
                                    {contact.last_message || "Start a conversation"}
                                </p>
                            </div>
                            {contact.unread_count > 0 && <div className="contact-dot"></div>}
                        </div>
                    ))}
                </div>

                <div className="chat-area">
                    {activeContact ? (
                        <>
                            <div className="chat-header">
                                <Avatar url={activeContact.profile_picture} name={activeContact.name || activeContact.username} className="contact-avatar small" fontSize="16px" />
                                <h3>{activeContact.username}</h3>
                            </div>

                            <div className="chat-history">
                                {messages.map((msg) => {
                                    const isMe = currentUser && msg.sender_id === currentUser.id;
                                    return (
                                        <div key={msg.id} className={`chat-bubble ${isMe ? 'me' : 'other'}`}>
                                            {msg.image_url ? (
                                                <img src={msg.image_url} alt="Uploaded" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                                            ) : (
                                                msg.content
                                            )}
                                        </div>
                                    );
                                })}
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
                            <p>Select a contact to start messaging</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Messages;
