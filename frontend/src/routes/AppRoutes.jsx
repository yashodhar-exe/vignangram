import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";

import Login from "../pages/Login";
import Register from "../pages/Register";
import VerifyOTP from "../pages/VerifyOTP";
import Home from "../pages/Home";
import Search from "../pages/Search";
import Profile from "../pages/Profile";
import UploadPost from "../pages/UploadPost";
import Notifications from "../pages/Notifications";
import NotFound from "../pages/NotFound";
import ForgotPassword from "../pages/ForgotPassword";
import Messages from "../pages/Messages";
import Communities from "../pages/Communities";
import Gallery from "../pages/Gallery";
import GalleryFolder from "../pages/GalleryFolder";

function AppRoutes() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/verify"
                    element={<VerifyOTP />}
                />

                <Route
                    path="/home"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/search"
                    element={
                        <ProtectedRoute>
                            <Search />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile/:id"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/upload"
                    element={
                        <ProtectedRoute>
                            <UploadPost />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/notifications"
                    element={
                        <ProtectedRoute>
                            <Notifications />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/messages"
                    element={
                        <ProtectedRoute>
                            <Messages />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/communities"
                    element={
                        <ProtectedRoute>
                            <Communities />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/gallery"
                    element={
                        <ProtectedRoute>
                            <Gallery />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/gallery/:folderId"
                    element={
                        <ProtectedRoute>
                            <GalleryFolder />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="*"
                    element={<NotFound />}
                />

                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />

            </Routes>

        </BrowserRouter>

    );
}

export default AppRoutes;