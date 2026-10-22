
import { useState } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";

function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (loading) return;

    setLoading(true);

    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      alert("Unable to log out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className="logout-button"
      onClick={handleLogout}
      disabled={loading}
      aria-label="Log out of your account"
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}

export default LogoutButton;
