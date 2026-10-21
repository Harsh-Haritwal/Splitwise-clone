import { useEffect, useState } from "react";
import api from "../api";

function Home() {
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .get("/api/health")
      .then((data) => {
        setStatus("online");
        setMessage(data.msg);
      })
      .catch(() => {
        setStatus("offline");
      });
  }, []);

  return (
    <div className="container page">
      <div className="auth-card">
        <h1 className="auth-title">Splitwise Clone</h1>
        <p className="auth-subtitle">
          Share expenses with friends and settle up without the maths.
        </p>

        {status === "checking" && (
          <div className="alert alert-info">Checking backend connection...</div>
        )}
        {status === "online" && (
          <div className="alert alert-info">Backend connected: {message}</div>
        )}
        {status === "offline" && (
          <div className="alert alert-error">
            Backend is not reachable on http://localhost:5000
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
