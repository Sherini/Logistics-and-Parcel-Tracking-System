
import { useEffect, useState } from "react";

function BackendTest() {
  const [message, setMessage] = useState("Connecting to backend...");

  useEffect(() => {
    fetch("http://localhost:8081/api/health")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Backend request failed");
        }
        return response.json();
      })
      .then((data) => {
        setMessage(data.message);
      })
      .catch(() => {
        setMessage("Could not connect to backend. Check whether it is running.");
      });
  }, []);

  return (
    <div style={{ padding: "30px", fontFamily: "Arial, sans-serif" }}>
      <h1>Logistics Backend Connection Test</h1>
      <p>{message}</p>
    </div>
  );
}

export default BackendTest;
