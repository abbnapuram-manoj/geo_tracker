import { Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import HrLogin from "./pages/hr/HrLogin.jsx";
import EmpLogin from "./pages/emp/EmpLogin.jsx";
import Dashboard from "./pages/hr/Dashboard.jsx";
import Employees from "./pages/hr/Employees.jsx";
import EmployeeDetail from "./pages/hr/EmployeeDetail.jsx";
import AssignVisit from "./pages/hr/AssignVisit.jsx";
import Payroll from "./pages/hr/Payroll.jsx";
import MyVisits from "./pages/emp/MyVisits.jsx";
import Shift from "./pages/emp/Shift.jsx";
import MySalary from "./pages/emp/MySalary.jsx";

const getUser = () => JSON.parse(localStorage.getItem("user") || "null");

function Shell({ role, links, children }) {
  const nav = useNavigate();
  const user = getUser();
  if (!user || !localStorage.getItem("token")) return <Navigate to="/" replace />;
  if (user.role !== role) return <Navigate to={user.role === "hr" ? "/hr" : "/emp"} replace />;
  const logout = () => { localStorage.clear(); nav("/"); };
  return (
    <>
      <nav>
        {links.map(([to, label, end]) => <NavLink key={to} to={to} end={end}>{label}</NavLink>)}
        <span className="sp" />
        <span>{user.name}</span>
        <button className="gray" onClick={logout}>Logout</button>
      </nav>
      <main>{children}</main>
    </>
  );
}

const hrLinks = [["/hr", "Live map", true], ["/hr/employees", "Employees"], ["/hr/visits", "Assign visit"], ["/hr/payroll", "Payroll"]];
const empLinks = [["/emp", "My visits", true], ["/emp/shift", "Shift"], ["/emp/salary", "My salary"]];
const H = (el) => <Shell role="hr" links={hrLinks}>{el}</Shell>;
const E = (el) => <Shell role="employee" links={empLinks}>{el}</Shell>;

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/hr/login" element={<HrLogin />} />
      <Route path="/emp/login" element={<EmpLogin />} />
      
      <Route path="/hr" element={H(<Dashboard />)} />
      <Route path="/hr/employees" element={H(<Employees />)} />
      <Route path="/hr/employees/:id" element={H(<EmployeeDetail />)} />
      <Route path="/hr/visits" element={H(<AssignVisit />)} />
      <Route path="/hr/payroll" element={H(<Payroll />)} />
      
      <Route path="/emp" element={E(<MyVisits />)} />
      <Route path="/emp/shift" element={E(<Shift />)} />
      <Route path="/emp/salary" element={E(<MySalary />)} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}