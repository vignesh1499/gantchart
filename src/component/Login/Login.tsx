import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import auth from "../../utils/firebase";

export default function Login() {
  const navigate = useNavigate();
  
  // State to store the user's data
  const [user, setUser] = useState<any>(null);

  const clientId = "644110699837-37k7f3gqefte011db52sdgi8b4e74j8g.apps.googleusercontent.com";
  
  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    if (token) {
      const displayName = localStorage.getItem("displayName");
      const email = localStorage.getItem("email");
      const photoURL = localStorage.getItem("photoURL");
      setUser({ displayName, email, photoURL });
      navigate("/chart"); // Redirect to the chart page if the user is logged in
    }
  }, [navigate]);

  const handleSuccess = (res: any) => {
    const provider = new GoogleAuthProvider();
    
    signInWithPopup(auth, provider)
      .then((result: any) => {
        // Storing user info in localStorage
        localStorage.setItem("token", result.user.accessToken);
        localStorage.setItem("displayName", result.user.displayName);
        localStorage.setItem("email", result.user.email);
        localStorage.setItem("photoURL", result.user.photoURL);

        const userInfo = {
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
        };

        setUser(userInfo); // Update state with the user's information
        toast.success("Login Successful!");
        navigate("/chart"); // Redirect to chart page
      })
      .catch((err) => {
        console.error("Error:", err);
        toast.error("Login failed. Please try again.");
      });
  };

  const handleFailure = () => {
    console.error("Google Login Failed");
    toast.error("Google Login Error");
  };

  const handleLogout = () => {
    // Clear the localStorage and reset the state
    localStorage.clear();
    setUser(null);
    navigate("/"); // Redirect to the login page
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-header">
          <h1>To-Do-List</h1>
          <p>
            Streamline your workflow and track progress effortlessly with our
            all-in-one task management app.
          </p>
        </div>
        {!user ? (
          <div className="login-button">
            <GoogleOAuthProvider clientId={clientId}>
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleFailure}
                type="standard"
                text="continue_with"
              />
            </GoogleOAuthProvider>
          </div>
        ) : (
          <div className="user-profile">
            <h2>Welcome, {user.displayName}!</h2>
            <img src={user.photoURL} alt="User Profile" />
            <p>Email: {user.email}</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );
}
