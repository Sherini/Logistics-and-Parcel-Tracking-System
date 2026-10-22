
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Navigate, Link } from "react-router-dom";
import { auth } from "../firebase/config";
import LogoutButton from "../components/LogoutButton";
import "./Login.css";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  if (checkingAuth) {
    return <div className="auth-page">Checking login...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="auth-page dashboard-page">
      <div className="dashboard-card">
        <div className="auth-logo">LPT</div>

        <p className="dashboard-tagline">
          LOGISTICS &amp; PARCEL TRACKING
        </p>

        <h1>Customer Dashboard</h1>

        <p className="auth-subtitle">
          Welcome, {user.displayName || user.email}!
        </p>

        <p className="dashboard-description">
          Manage your account and access your parcel tracking services
          from one place.
        </p>

        <div className="dashboard-section">
          <div className="dashboard-icon">👤</div>
          <div className="dashboard-section-text">
            <h2>My Profile</h2>
            <p>View and update your personal information.</p>
          </div>
          <Link className="dashboard-link" to="/profile">
            View Profile →
          </Link>
        </div>

        <div className="dashboard-section">
          <div className="dashboard-icon">📦</div>
          <div className="dashboard-section-text">
            <h2>Parcel Tracking</h2>
            <p>Track your shipments and view delivery updates.</p>
          </div>
          <span className="dashboard-coming-soon">
            Coming soon
          </span>
        </div>

        <div className="dashboard-logout-box">
          <div>
            <h2>Sign out</h2>
            <p>Finished using your account? Sign out securely.</p>
          </div>
          <LogoutButton />
        </div>

        <p className="dashboard-footer">
          Logistics &amp; Parcel Tracking System
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
