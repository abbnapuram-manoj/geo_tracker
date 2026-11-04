import { Link, Navigate } from "react-router-dom";

export default function Landing() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (user) return <Navigate to={user.role === "hr" ? "/hr" : "/emp"} replace />;

  return (
    <main style={{ maxWidth: 400, marginTop: "100px" }}>
      <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
        <h2 style={{ marginBottom: 30 }}>Geo Tracker</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <Link to="/hr/login"><button style={{ width: "100%", padding: 12 }}>HR Admin Portal</button></Link>
          <Link to="/emp/login"><button className="gray" style={{ width: "100%", padding: 12 }}>Employee Portal</button></Link>
        </div>
      </div>
    </main>
  );
}