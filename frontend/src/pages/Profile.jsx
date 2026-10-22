
import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import "./Login.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Customer");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError("");

      try {
        const profileRef = doc(db, "users", currentUser.uid);
        const profileSnapshot = await getDoc(profileRef);

        if (profileSnapshot.exists()) {
          const profile = profileSnapshot.data();
          setName(profile.name || currentUser.displayName || "");
          setRole(profile.role || "Customer");
        } else {
          setName(currentUser.displayName || "");
          setRole("Customer");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setName(currentUser.displayName || "");
        setLoadError("Could not load your saved profile. Please refresh and try again.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async (event) => {
    event.preventDefault();

    if (!user || !name.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (loadError) {
      alert("Your saved profile could not be loaded. Refresh the page before saving.");
      return;
    }

    setSaving(true);

    try {
      const profileRef = doc(db, "users", user.uid);
      const profileSnapshot = await getDoc(profileRef);

      // Preserve the existing role instead of forcing Customer.
      const existingRole = profileSnapshot.exists()
        ? profileSnapshot.data().role || "Customer"
        : "Customer";

      await updateProfile(user, {
        displayName: name.trim(),
      });

      await setDoc(
        profileRef,
        {
          uid: user.uid,
          name: name.trim(),
          email: user.email || "",
          role: existingRole,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setRole(existingRole);
      setLoadError("");
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
      alert("Could not save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="auth-page">Loading profile...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">LPT</div>

        <h1>My Profile</h1>

        <p className="auth-subtitle">
          View and update your account information.
        </p>

        {loadError && (
          <p role="alert" style={{ color: "crimson" }}>
            {loadError}
          </p>
        )}

        <form onSubmit={handleSave}>
          <label htmlFor="profile-name">Full Name</label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your full name"
            autoComplete="name"
            required
          />

          <label htmlFor="profile-email">Email Address</label>
          <input
            id="profile-email"
            type="email"
            value={user.email || ""}
            readOnly
          />

          <label htmlFor="profile-role">Account Role</label>
          <input
            id="profile-role"
            type="text"
            value={role}
            readOnly
          />

          <button
            type="submit"
            className="auth-button"
            disabled={saving || Boolean(loadError)}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/dashboard">Back to Dashboard</Link>
        </p>
      </div>
    </div>
  );
}

export default Profile;
