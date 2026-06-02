import { useState } from "react";
import { useEffect } from "react";

import api, { API_BASE_URL } from "../api/axios";

function PostCard({ post }) {

    const [likes, setLikes] = useState(
        post.likes
    );

    const [liked, setLiked] = useState(
        false
    );

    const [commentText, setCommentText] =
        useState("");

    const [comments, setComments] =
        useState([]);

    const [commentCount, setCommentCount] =
        useState(post.comments);

    useEffect(() => {

        loadLikeStatus();

        loadComments();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function loadLikeStatus() {

        try {

            const res = await api.get(
                `/posts/${post.id}/liked/1`
            );

            setLiked(
                res.data.liked
            );

        } catch (error) {

            console.log(error);
        }
    };

    async function loadComments() {

        try {

            const res = await api.get(
                `/posts/${post.id}/comments`
            );

            setComments(
                res.data
            );

        } catch (error) {

            console.log(error);
        }
    };

    const handleLike = async () => {

        try {

            if (!liked) {

                await api.post(
                    `/posts/${post.id}/like/1`
                );

                setLikes(
                    prev => prev + 1
                );

                setLiked(true);

            } else {

                await api.delete(
                    `/posts/${post.id}/like/1`
                );

                setLikes(
                    prev => prev - 1
                );

                setLiked(false);
            }

        } catch (error) {

            console.log(error);
        }
    };

    const addComment = async () => {

        if (!commentText.trim())
            return;

        try {

            await api.post(
                `/posts/${post.id}/comment/1`,
                {
                    text: commentText
                }
            );

            setCommentCount(
                prev => prev + 1
            );

            setCommentText("");

            loadComments();

        } catch (error) {

            console.log(error);
        }
    };

    return (

        <div
            style={{
                border: "1px solid #444",
                padding: "20px",
                marginBottom: "20px",
                borderRadius: "12px",
                maxWidth: "600px",
                margin: "20px auto"
            }}
        >

            <img
                src={
                    post.image_url.startsWith("http")
                        ? post.image_url
                        : API_BASE_URL +
                        post.image_url
                }
                alt="post"
                width="100%"
                style={{
                    borderRadius: "12px"
                }}
            />

            <h2
                style={{
                    textAlign: "center"
                }}
            >
                {post.caption}
            </h2>

            <p
                style={{
                    textAlign: "center"
                }}
            >
                ❤️ {likes}
            </p>

            <p
                style={{
                    textAlign: "center"
                }}
            >
                💬 {commentCount}
            </p>

            <div
                style={{
                    textAlign: "center",
                    marginBottom: "15px"
                }}
            >

                <button
                    onClick={handleLike}
                >
                    {
                        liked
                            ? "💔 Unlike"
                            : "❤️ Like"
                    }
                </button>

            </div>

            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "15px"
                }}
            >

                <input
                    value={commentText}
                    placeholder="Add comment..."
                    onChange={(e) =>
                        setCommentText(
                            e.target.value
                        )
                    }
                    style={{
                        flex: 1
                    }}
                />

                <button
                    onClick={addComment}
                >
                    Comment
                </button>

            </div>

            <div>

                {
                    comments.length === 0 && (

                        <p>
                            No comments yet
                        </p>

                    )
                }

                {
                    comments.map(comment => (

                        <div
                            key={comment.id}
                            style={{
                                padding: "8px",
                                borderBottom:
                                    "1px solid #333"
                            }}
                        >

                            💬 {

                                comment.content ||

                                comment.text

                            }

                        </div>

                    ))
                }

            </div>

        </div>

    );
}

export default PostCard;