import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { errMsg } from "../../api";

export default function EmpLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const { data } = await api.post("/auth/emp-login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      nav("/emp");
    } catch (x) { setErr(errMsg(x)); }
  };

  return (
    <main style={{ maxWidth: 360 }}>
      <div className="card">
        <h2>Employee Login</h2>
        <form onSubmit={submit}>
          <div className="row"><input style={{ width: "100%" }} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="row"><input style={{ width: "100%" }} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <button className="gray" type="submit" style={{ width: "100%", marginTop: 10 }}>Login</button>
          <p className="err">{err}</p>
        </form>
        <div style={{ textAlign: "center", marginTop: 15 }}><Link to="/">Back</Link></div>
      </div>
    </main>
  );
}