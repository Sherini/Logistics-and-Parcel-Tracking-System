
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      alert("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      // 1. Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // 2. Get the Firebase ID token
      const idToken = await userCredential.user.getIdToken();

      // 3. Verify the token with the Spring Boot backend
      const response = await fetch(
        "http://localhost:8081/api/auth/verify",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || result.authenticated !== true) {
        throw new Error(
          result.error || "Backend token verification failed."
        );
      }

      // 4. Navigate only after successful verification
      console.log("Backend verification successful:", result);
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login error:", error);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        alert("Incorrect email or password. Please try again.");
      } else if (error.code === "auth/too-many-requests") {
        alert("Too many attempts. Please try again later.");
      } else if (
        error instanceof TypeError ||
        error.message.includes("Backend token verification")
      ) {
        alert(
          "Unable to verify your login with the backend. Check that the backend is running."
        );
      } else {
        alert("Login failed: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">LPT</div>

        <h1>Welcome Back</h1>

        <p className="auth-subtitle">
          Sign in to your Logistics &amp; Parcel Tracking account.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <a href="/register">Create an account</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
