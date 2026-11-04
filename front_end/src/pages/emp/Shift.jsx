import { useEffect, useState, useRef } from "react";
import api, { errMsg } from "../../api";

export default function Shift() {
  const [shift, setShift] = useState(null);
  const [msg, setMsg] = useState("");
  const [tracking, setTracking] = useState(false);
  const watchId = useRef(null);

  const load = () => api.get("/emp/shift/current").then(r => {
    setShift(r.data);
    if (r.data && !tracking) startTracking();
  }).catch(() => {});

  useEffect(() => {
    load();
    return stopTracking;
  }, []);

  const postLocation = async (pos) => {
    try {
      const res = await api.post("/emp/location", { lat: pos.coords.latitude, lng: pos.coords.longitude });
      if (res.data.verified && res.data.verified.length > 0) {
        setMsg(`Verified visit at: ${res.data.verified.join(", ")}`);
        setTimeout(() => setMsg(""), 5000);
      }
    } catch (e) {
      console.error("Location post failed", e);
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) return setMsg("Geolocation not supported");
    setTracking(true);
    watchId.current = navigator.geolocation.watchPosition(
      postLocation,
      (err) => console.error(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const stopTracking = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setTracking(false);
  };

  const toggleShift = async () => {
    setMsg("");
    try {
      if (shift) {
        await api.post("/emp/shift/end");
        setShift(null);
        stopTracking();
      } else {
        const res = await api.post("/emp/shift/start");
        setShift(res.data);
        startTracking();
      }
    } catch (e) {
      setMsg(errMsg(e));
    }
  };

  return (
    <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
      <h2>Shift Control</h2>
      <p>
        Status: <strong className={shift ? "ok" : "err"}>{shift ? "Active" : "Inactive"}</strong>
      </p>
      {shift && <p>Started at: {new Date(shift.startTime).toLocaleTimeString()}</p>}
      <button 
        onClick={toggleShift} 
        style={{ padding: "15px 30px", fontSize: "18px", marginTop: "20px", backgroundColor: shift ? "#dc2626" : "#16a34a" }}
      >
        {shift ? "End Shift" : "Start Shift"}
      </button>
      <p style={{ marginTop: "20px", color: "#6b7280", fontSize: "14px" }}>
        {tracking ? "📍 GPS is active and tracking your route." : "GPS is off. Location is only tracked during an active shift."}
      </p>
      <p className="ok" style={{ fontWeight: "bold" }}>{msg}</p>
    </div>
  );
}