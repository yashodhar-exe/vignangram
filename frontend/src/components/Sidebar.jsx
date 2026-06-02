import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios";

import vignanLogo from "../assets/vignan-white.png";
import homeIcon from "../assets/home.png";
import searchIcon from "../assets/search.png";
import createIcon from "../assets/create.png";
import messageIcon from "../assets/message.png";
import notificationIcon from "../assets/notification.png";
import profileIcon from "../assets/profile.png";
import communitiesIcon from "../assets/communties.png";
import logoutIcon from "../assets/logout.png";

import "./Sidebar.css";

function Sidebar() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadNotifCount, setUnreadNotifCount] = useState(0);
    const [unreadCommCount, setUnreadCommCount] = useState(0);

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const res = await api.get("/messages/unread/count");
                setUnreadCount(res.data.unread_count);

                const notifRes = await api.get("/notifications/unread/count");
                setUnreadNotifCount(notifRes.data.count);

                const commRes = await api.get("/communities/me");
                let commUnread = 0;
                commRes.data.forEach(c => {
                    commUnread += c.unread_count;
                });
                setUnreadCommCount(commUnread);
            } catch (e) {
                console.error(e);
            }
        };
        fetchUnread();
        
        const interval = setInterval(fetchUnread, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    return (
        <aside className="sidebar">
            <img src={vignanLogo} alt="Vignangram" className="sidebar-logo" />
            <nav>
                <Link to="/home"><img src={homeIcon} alt="" /></Link>
                <Link to="/search"><img src={searchIcon} alt="" /></Link>
                <Link to="/upload"><img src={createIcon} alt="" /></Link>
                <Link to="/notifications" className="message-icon-wrapper">
                    <img src={notificationIcon} alt="" />
                    {unreadNotifCount > 0 && <span className="unread-dot sidebar-dot"></span>}
                </Link>
                <Link to="/messages" className="message-icon-wrapper">
                    <img src={messageIcon} alt="" />
                    {unreadCount > 0 && <span className="unread-dot sidebar-dot"></span>}
                </Link>
                <Link to="/communities" className="message-icon-wrapper">
                    <img src={communitiesIcon} alt="Communities" />
                    {unreadCommCount > 0 && <span className="unread-dot sidebar-dot"></span>}
                </Link>
                <Link to="/profile"><img src={profileIcon} alt="" /></Link>
            </nav>
            <div onClick={handleLogout} className="menu-button" style={{ cursor: "pointer" }}>
                <img src={logoutIcon} alt="Logout" />
            </div>
        </aside>
    );
}

export default Sidebar;