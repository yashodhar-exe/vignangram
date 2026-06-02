import { Link } from "react-router-dom";

import useCurrentUser from "../hooks/useCurrentUser";

function Navbar() {

    const user = useCurrentUser();

    return (

        <nav
            style={{
                display: "flex",
                gap: "20px",
                padding: "20px",
                borderBottom: "1px solid #ccc",
                alignItems: "center"
            }}
        >

            <Link to="/home">
                Home
            </Link>

            <Link to="/search">
                Search
            </Link>

            <Link to="/upload">
                Upload
            </Link>

            <Link to="/notifications">
                Notifications
            </Link>

            {
                user && (

                    <Link
                        to={`/profile/${user.id}`}
                    >
                        Profile
                    </Link>

                )
            }

            <div
                style={{
                    marginLeft: "auto"
                }}
            >

                {
                    user && (

                        <span>
                            {user.name}
                        </span>

                    )
                }

            </div>

        </nav>

    );
}

export default Navbar;