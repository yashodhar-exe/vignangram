import { useEffect } from "react";
import { useState } from "react";

import api from "../api/axios";
import Sidebar from "../components/Sidebar";

import useCurrentUser from "../hooks/useCurrentUser";

function Notifications() {

    const user = useCurrentUser();

    const [
        notifications,
        setNotifications
    ] = useState([]);

    useEffect(() => {

        if (!user)
            return;

        api.get(
            `/notifications/${user.id}`
        ).then((res) => {

            setNotifications(
                res.data
            );
            
            // Mark as read
            api.post('/notifications/mark-read').catch(console.error);

        }).catch((error) => {

            console.error(error);

        });

    }, [user]);

    if (!user)
        return <h1>Loading User...</h1>;

    return (

        <div className="home-page">
            <Sidebar />

            <main className="feed">
                <h2 style={{ color: 'white', marginBottom: '20px' }}>
                    Notifications
                </h2>

                {
                    notifications.length === 0 && (

                        <p style={{ color: '#8e8e8e' }}>
                            No notifications yet
                        </p>

                    )
                }

                {
                    notifications.map(
                        (notification) => (

                            <div
                                key={notification.id}
                                style={{
                                    border:
                                        "1px solid #262626",
                                    padding: "16px",
                                    marginBottom: "10px",
                                    borderRadius: "8px",
                                    color: "white",
                                    background: "#121212"
                                }}
                            >

                                <p>
                                    {notification.message}
                                </p>

                                {
                                    notification.created_at && (

                                        <small style={{ color: '#8e8e8e', marginTop: '8px', display: 'block' }}>
                                            {
                                                new Date(
                                                    notification.created_at
                                                ).toLocaleString()
                                            }
                                        </small>

                                    )
                                }

                            </div>

                        )
                    )
                }
            </main>

        </div>

    );
}

export default Notifications;