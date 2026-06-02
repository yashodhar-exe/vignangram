import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../api/axios";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";

import vignanLogo from "../assets/vignan-white.png";
import Avatar from "../components/Avatar";

import homeIcon from "../assets/home.png";
import searchIcon from "../assets/search.png";
import createIcon from "../assets/create.png";
import messageIcon from "../assets/message.png";
import notificationIcon from "../assets/notification.png";
import profileIcon from "../assets/profile.png";
import logoutIcon from "../assets/logout.png";
import likeIcon from "../assets/like.png";
import commentIcon from "../assets/comment.png";

import "./Home.css";

function Home() {
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState({});
    const [commentInputs, setCommentInputs] = useState({});

    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {

    fetchCurrentUser();

    fetchPosts();

}, []);


async function fetchCurrentUser() {

    try {

        const res = await api.get(
            "/auth/me"
        );

        setCurrentUser(
            res.data
        );

    }

    catch (err) {

        console.log(
            "Failed to load user",
            err
        );

    }

};


async function fetchPosts() {

    try {

        const res = await api.get(
            "/posts"
        );

        setPosts(
            res.data
        );

    }

    catch (err) {

        console.log(
            "Failed to load posts",
            err
        );

    }

};


const loadComments = async (
    postId
) => {

    try {

        const res = await api.get(

            `/posts/${postId}/comments`

        );

        setComments(prev => ({

            ...prev,

            [postId]: res.data

        }));

    }

    catch (err) {

        console.log(err);

    }

};


const handleLike = async (postId) => {
    if (!currentUser) return;
    try {
        const checkRes = await api.get(`/posts/${postId}/liked/${currentUser.id}`);
        if (checkRes.data.liked) {
            await api.delete(`/posts/${postId}/like/${currentUser.id}`);
        } else {
            await api.post(`/posts/${postId}/like/${currentUser.id}`);
        }
        fetchPosts();
    } catch (err) {
        console.log(err);
    }
};


const addComment = async (
    postId
) => {

    if (!currentUser)
        return;

    if (
        !commentInputs[postId]?.trim()
    )
        return;

    try {

        await api.post(

            `/posts/${postId}/comment/${currentUser.id}`,

            {

                text:
                commentInputs[postId]

            }

        );

        setCommentInputs(prev => ({

            ...prev,

            [postId]: ""

        }));

        await loadComments(
            postId
        );

        await fetchPosts();

    }

    catch (err) {

        console.log(err);

    }

};

    const getImageUrl = (url) => {
        if (!url) return "";
        if (url.startsWith("http")) {
            return url;
        }
        return `${API_BASE_URL}${url}`;
    };

    return (
        <div className="home-page">
            <Sidebar />
            {/* Feed */}
            <main className="feed">
                {posts.map((post) => (
                    <div key={post.id} className="post-card">
                            <div className="post-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Avatar 
                                    url={post.profile_picture} 
                                    name={post.username} 
                                    size="30px" 
                                />
                                <div className="post-user" style={{ margin: 0 }}>{post.username}</div>
                            </div>

                            {post.image_url && (
                                <img
                                    src={getImageUrl(post.image_url)}
                                    alt="post"
                                    className="post-image"
                                />
                            )}

                            <div className="post-content">
                                <p>{post.caption}</p>

                                <div className="post-actions">
                                    <div className="action-item" onClick={() => handleLike(post.id)}>
                                        <img src={likeIcon} alt="" className="action-icon" />
                                        <span>{post.likes}</span>
                                    </div>

                                    <div className="action-item" onClick={() => loadComments(post.id)}>
                                        <img src={commentIcon} alt="" className="action-icon" />
                                        <span>{post.comments}</span>
                                    </div>
                                </div>

                                <div className="comment-section">
                                    {comments[post.id]?.map((comment) => (
                                        <div key={comment.id} className="comment">
                                            {comment.content}
                                        </div>
                                    ))}

                                    <div className="comment-input-row">
                                        <input
                                            type="text"
                                            placeholder="Add a comment..."
                                            value={commentInputs[post.id] || ""}
                                            onChange={(e) =>
                                                setCommentInputs((prev) => ({
                                                    ...prev,
                                                    [post.id]: e.target.value,
                                                }))
                                            }
                                        />

                                        <button onClick={() => addComment(post.id)}>Post</button>
                                    </div>
                                </div>
                            </div>
                    </div>
                ))}
            </main>
        </div>
    );
}

export default Home;