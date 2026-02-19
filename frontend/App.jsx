import { useState, useEffect, createContext, useContext } from "react";

// =============================================
//   AUTH CONTEXT
// =============================================
const AuthContext = createContext(null);

const useAuth = () => useContext(AuthContext);

const API = "http://localhost:8080/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

// =============================================
//   MAIN APP
// =============================================
export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [page, setPage] = useState("login");

  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    setToken(data.token);
    setUser(data);
    setPage("dashboard");
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    setPage("login");
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      <div style={{ fontFamily: "Segoe UI, sans-serif", minHeight: "100vh", background: "#f0f4f8" }}>
        {!token ? (
          page === "login" ? (
            <LoginPage onSwitch={() => setPage("register")} />
          ) : (
            <RegisterPage onSwitch={() => setPage("login")} />
          )
        ) : (
          <MainApp currentPage={page} setPage={setPage} />
        )}
      </div>
    </AuthContext.Provider>
  );
}

// =============================================
//   NAVBAR
// =============================================
function Navbar({ setPage }) {
  const { user, logout } = useAuth();
  return (
    <nav style={{ background: "linear-gradient(135deg,#1a237e,#283593)", color: "#fff", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>
      <div style={{ fontSize: 20, fontWeight: 700, cursor: "pointer" }} onClick={() => setPage("dashboard")}>
        💰 EcoFlex Platform
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <span style={{ fontSize: 14 }}>👤 {user?.username}</span>
        <button onClick={() => setPage("profile")} style={navBtn}>Profile</button>
        <button onClick={logout} style={{ ...navBtn, background: "#ef5350" }}>Logout</button>
      </div>
    </nav>
  );
}
const navBtn = { padding: "6px 14px", borderRadius: 6, border: "none", background: "rgba(255,255,255,0.2)", color: "#fff", cursor: "pointer", fontSize: 13 };

// =============================================
//   MAIN APP ROUTER
// =============================================
function MainApp({ currentPage, setPage }) {
  return (
    <div>
      <Navbar setPage={setPage} />
      {currentPage === "dashboard" && <Dashboard setPage={setPage} />}
      {currentPage === "profile" && <ProfileSetup setPage={setPage} />}
      {currentPage === "economic" && <EconomicStability setPage={setPage} />}
      {currentPage === "shock" && <ShockSimulation setPage={setPage} />}
      {currentPage === "opportunity" && <OpportunityMode setPage={setPage} />}
      {currentPage === "resilience" && <ResilienceTracker setPage={setPage} />}
    </div>
  );
}

// =============================================
//   LOGIN PAGE
// =============================================
function LoginPage({ onSwitch }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) login(data);
      else setError(data.message || "Login failed");
    } catch { setError("Server error. Make sure backend is running."); }
    setLoading(false);
  };

  return (
    <div style={pageCenter}>
      <div style={card}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 48 }}>💰</div>
          <h2 style={{ margin: 0, color: "#1a237e" }}>EcoFlex Platform</h2>
          <p style={{ color: "#666", margin: "4px 0 0" }}>Economic Flexibility for All</p>
        </div>
        {error && <div style={errorBox}>{error}</div>}
        <Input label="Username" value={form.username} onChange={v => setForm({ ...form, username: v })} />
        <Input label="Password" type="password" value={form.password} onChange={v => setForm({ ...form, password: v })} />
        <button style={primaryBtn} onClick={handleSubmit} disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        <p style={{ textAlign: "center", color: "#666", marginTop: 12 }}>
          Don't have an account? <span style={link} onClick={onSwitch}>Register</span>
        </p>
      </div>
    </div>
  );
}

// =============================================
//   REGISTER PAGE
// =============================================
function RegisterPage({ onSwitch }) {
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "", email: "", phone: "", role: "INDIVIDUAL", name: "", city: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) { setError("Passwords don't match"); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`${API}/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) { setSuccess("Registered! Please login."); setTimeout(onSwitch, 1500); }
      else setError(data.message || "Registration failed");
    } catch { setError("Server error."); }
    setLoading(false);
  };

  return (
    <div style={pageCenter}>
      <div style={{ ...card, maxWidth: 480 }}>
        <h2 style={{ textAlign: "center", color: "#1a237e", marginTop: 0 }}>Create Account</h2>
        {error && <div style={errorBox}>{error}</div>}
        {success && <div style={successBox}>{success}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Username *" value={form.username} onChange={v => setForm({ ...form, username: v })} />
          <Input label="Email *" value={form.email} onChange={v => setForm({ ...form, email: v })} />
          <Input label="Password *" type="password" value={form.password} onChange={v => setForm({ ...form, password: v })} />
          <Input label="Confirm Password *" type="password" value={form.confirmPassword} onChange={v => setForm({ ...form, confirmPassword: v })} />
          <Input label="Phone *" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
          <div>
            <label style={labelStyle}>Role *</label>
            <select style={inputStyle} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="INDIVIDUAL">Individual</option>
              <option value="FAMILY">Family</option>
            </select>
          </div>
          <Input label="Name (optional)" value={form.name} onChange={v => setForm({ ...form, name: v })} />
          <Input label="City (optional)" value={form.city} onChange={v => setForm({ ...form, city: v })} />
        </div>
        <button style={{ ...primaryBtn, marginTop: 16 }} onClick={handleSubmit} disabled={loading}>{loading ? "Registering..." : "Register"}</button>
        <p style={{ textAlign: "center", color: "#666" }}>Already have an account? <span style={link} onClick={onSwitch}>Login</span></p>
      </div>
    </div>
  );
}

// =============================================
//   DASHBOARD
// =============================================
function Dashboard({ setPage }) {
  const features = [
    { id: "economic", icon: "📊", title: "Economic Stability", desc: "View your Economic Flexibility Score and risk level breakdown.", color: "#1565c0" },
    { id: "shock", icon: "⚡", title: "Shock Simulation Lab", desc: "Simulate financial crises and compare survival strategies.", color: "#6a1b9a" },
    { id: "opportunity", icon: "🌱", title: "Opportunity Mode", desc: "Test future growth decisions before committing resources.", color: "#2e7d32" },
    { id: "resilience", icon: "🏆", title: "Resilience Tracker", desc: "Track monthly habits and watch your financial strength grow.", color: "#e65100" },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <h1 style={{ color: "#1a237e", margin: 0 }}>Welcome to EcoFlex</h1>
        <p style={{ color: "#555", marginTop: 8 }}>Your Personal Economic Decision Intelligence Platform</p>
        <button onClick={() => setPage("profile")} style={{ ...primaryBtn, display: "inline-block", width: "auto", padding: "10px 24px", marginTop: 12 }}>
          ⚙️ Setup / Update My Profile
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {features.map(f => (
          <div key={f.id} onClick={() => setPage(f.id)} style={{ background: "#fff", borderRadius: 16, padding: 28, cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", borderLeft: `5px solid ${f.color}`, transition: "transform 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            <div style={{ fontSize: 40 }}>{f.icon}</div>
            <h3 style={{ color: f.color, margin: "10px 0 6px" }}>{f.title}</h3>
            <p style={{ color: "#666", margin: 0, fontSize: 14 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================
//   PROFILE SETUP (Wizard)
// =============================================
function ProfileSetup({ setPage }) {
  const [step, setStep] = useState(1);
  const [financial, setFinancial] = useState({ familyName: "", address: "", city: "", state: "", pincode: "", totalSavings: "", totalDebt: "", monthlyExpenses: "", rentAmount: "", schoolFees: "", emiAmount: "" });
  const [members, setMembers] = useState([{ fullName: "", age: "", gender: "Male", educationLevel: "", isEarner: false, incomeType: "", monthlyIncome: "", incomeStability: "STABLE", skills: "" }]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const saveFinancial = async () => {
    setError("");
    try {
      const res = await fetch(`${API}/profile/financial`, { method: "POST", headers: authHeaders(), body: JSON.stringify(financial) });
      if (res.ok) setStep(2);
      else setError("Failed to save financial data");
    } catch { setError("Server error"); }
  };

  const saveMembers = async () => {
    setError("");
    try {
      const res = await fetch(`${API}/profile/members`, { method: "POST", headers: authHeaders(), body: JSON.stringify(members) });
      if (res.ok) { setMsg("✅ Profile setup complete!"); setTimeout(() => setPage("dashboard"), 1500); }
      else setError("Failed to save members");
    } catch { setError("Server error"); }
  };

  const addMember = () => setMembers([...members, { fullName: "", age: "", gender: "Male", educationLevel: "", isEarner: false, incomeType: "DAILY_WAGE", monthlyIncome: "", incomeStability: "STABLE", skills: "" }]);
  const removeMember = (i) => setMembers(members.filter((_, idx) => idx !== i));
  const updateMember = (i, key, val) => { const m = [...members]; m[i] = { ...m[i], [key]: val }; setMembers(m); };

  return (
    <div style={{ maxWidth: 720, margin: "32px auto", padding: "0 20px" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        {/* Progress */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {["1. Household & Finance", "2. Members & Income"].map((s, i) => (
            <div key={i} style={{ flex: 1, padding: "8px 0", textAlign: "center", borderRadius: 8, fontSize: 13, fontWeight: 600, background: step === i + 1 ? "#1a237e" : step > i + 1 ? "#43a047" : "#e0e0e0", color: step >= i + 1 ? "#fff" : "#666" }}>{s}</div>
          ))}
        </div>

        {error && <div style={errorBox}>{error}</div>}
        {msg && <div style={successBox}>{msg}</div>}

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <h3 style={{ color: "#1a237e", marginTop: 0 }}>📋 Step 1: Household & Financial Details</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Family Name" value={financial.familyName} onChange={v => setFinancial({ ...financial, familyName: v })} />
              <Input label="City" value={financial.city} onChange={v => setFinancial({ ...financial, city: v })} />
              <Input label="State" value={financial.state} onChange={v => setFinancial({ ...financial, state: v })} />
              <Input label="Pincode" value={financial.pincode} onChange={v => setFinancial({ ...financial, pincode: v })} />
            </div>
            <Input label="Address" value={financial.address} onChange={v => setFinancial({ ...financial, address: v })} />
            <hr style={{ margin: "20px 0", borderColor: "#e0e0e0" }} />
            <h4 style={{ color: "#333", marginTop: 0 }}>💰 Financial Summary</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Input label="Total Savings (₹) *" type="number" value={financial.totalSavings} onChange={v => setFinancial({ ...financial, totalSavings: v })} />
              <Input label="Total Debt (₹) *" type="number" value={financial.totalDebt} onChange={v => setFinancial({ ...financial, totalDebt: v })} />
              <Input label="Monthly Expenses (₹) *" type="number" value={financial.monthlyExpenses} onChange={v => setFinancial({ ...financial, monthlyExpenses: v })} />
              <Input label="Rent (₹, optional)" type="number" value={financial.rentAmount} onChange={v => setFinancial({ ...financial, rentAmount: v })} />
              <Input label="School Fees (₹, optional)" type="number" value={financial.schoolFees} onChange={v => setFinancial({ ...financial, schoolFees: v })} />
              <Input label="EMI (₹, optional)" type="number" value={financial.emiAmount} onChange={v => setFinancial({ ...financial, emiAmount: v })} />
            </div>
            <button style={primaryBtn} onClick={saveFinancial}>Next →</button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <h3 style={{ color: "#1a237e", marginTop: 0 }}>👨‍👩‍👧 Step 2: Family Members</h3>
            {members.map((m, i) => (
              <div key={i} style={{ border: "1px solid #e0e0e0", borderRadius: 12, padding: 16, marginBottom: 16, background: "#fafafa" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <strong style={{ color: "#1a237e" }}>Member {i + 1}</strong>
                  {members.length > 1 && <button onClick={() => removeMember(i)} style={{ background: "#ef5350", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>Remove</button>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <Input label="Full Name" value={m.fullName} onChange={v => updateMember(i, "fullName", v)} />
                  <Input label="Age" type="number" value={m.age} onChange={v => updateMember(i, "age", v)} />
                  <div>
                    <label style={labelStyle}>Gender</label>
                    <select style={inputStyle} value={m.gender} onChange={e => updateMember(i, "gender", e.target.value)}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <Input label="Education Level" value={m.educationLevel} onChange={v => updateMember(i, "educationLevel", v)} />
                  <div>
                    <label style={labelStyle}>Is Earner?</label>
                    <select style={inputStyle} value={m.isEarner ? "yes" : "no"} onChange={e => updateMember(i, "isEarner", e.target.value === "yes")}>
                      <option value="no">No</option><option value="yes">Yes</option>
                    </select>
                  </div>
                </div>
                {m.isEarner && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
                    <div>
                      <label style={labelStyle}>Income Type</label>
                      <select style={inputStyle} value={m.incomeType} onChange={e => updateMember(i, "incomeType", e.target.value)}>
                        <option value="DAILY_WAGE">Daily Wage</option>
                        <option value="SALARY">Fixed Salary</option>
                        <option value="BUSINESS">Business</option>
                        <option value="SELF_EMPLOYED">Self Employed</option>
                      </select>
                    </div>
                    <Input label="Monthly Income (₹)" type="number" value={m.monthlyIncome} onChange={v => updateMember(i, "monthlyIncome", v)} />
                    <div>
                      <label style={labelStyle}>Income Stability</label>
                      <select style={inputStyle} value={m.incomeStability} onChange={e => updateMember(i, "incomeStability", e.target.value)}>
                        <option value="STABLE">Stable</option>
                        <option value="SEMI_STABLE">Semi-Stable</option>
                        <option value="SEASONAL">Seasonal</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: "span 3" }}>
                      <Input label="Skills (comma-separated, e.g. Tailoring, Driving)" value={m.skills} onChange={v => updateMember(i, "skills", v)} />
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button onClick={addMember} style={{ ...primaryBtn, background: "#43a047", marginBottom: 12 }}>+ Add Member</button>
            <button style={primaryBtn} onClick={saveMembers}>Save & Complete Setup ✓</button>
            <button onClick={() => setStep(1)} style={{ ...primaryBtn, background: "#78909c", marginTop: 8 }}>← Back</button>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================
//   ECONOMIC STABILITY
// =============================================
function EconomicStability({ setPage }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/economic-score`, { headers: authHeaders() })
      .then(r => r.json()).then(d => {
        if (d.message) setError(d.message);
        else setData(d);
      }).catch(() => setError("Server error"));
  }, []);

  const riskColor = { "HIGH RISK": "#ef5350", "MODERATE": "#ff9800", "STRONG": "#43a047" };

  return (
    <div style={{ maxWidth: 800, margin: "32px auto", padding: "0 20px" }}>
      <BackBtn onClick={() => setPage("dashboard")} />
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <h2 style={{ color: "#1565c0", marginTop: 0 }}>📊 Economic Stability</h2>
        {error && <div style={errorBox}>{error} <br /><small>Please complete your profile first.</small></div>}
        {!data && !error && <p style={{ color: "#666" }}>Loading your data...</p>}
        {data && (
          <>
            {/* Score card */}
            <div style={{ textAlign: "center", background: "linear-gradient(135deg,#1565c0,#1a237e)", color: "#fff", borderRadius: 16, padding: "32px 24px", marginBottom: 28 }}>
              <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 4 }}>Economic Flexibility Score</div>
              <div style={{ fontSize: 72, fontWeight: 900 }}>{data.economicFlexibilityScore}</div>
              <div style={{ fontSize: 18, marginTop: 8, background: riskColor[data.riskLevel], display: "inline-block", padding: "4px 20px", borderRadius: 20 }}>{data.riskLevel}</div>
            </div>

            {/* Metrics grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 28 }}>
              {[
                { label: "Survival Months", value: data.survivalMonths, icon: "⏳" },
                { label: "Emergency Buffer", value: data.emergencyBufferRatio, icon: "🛡️" },
                { label: "Income Diversity", value: data.incomeDiversityScore, icon: "💼" },
                { label: "Dependency Ratio", value: data.dependencyRatio, icon: "👨‍👩‍👧" },
                { label: "Stability Factor", value: data.incomeStabilityFactor, icon: "📈" },
                { label: "Skill Score", value: data.skillScore, icon: "🎯" },
              ].map(m => (
                <div key={m.label} style={{ background: "#f5f5f5", borderRadius: 12, padding: "16px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 24 }}>{m.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#1a237e", margin: "4px 0" }}>{m.value}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Summary table */}
            <h4 style={{ color: "#333" }}>💰 Financial Summary</h4>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <tbody>
                {[["Total Monthly Income", `₹${data.totalIncome}`], ["Monthly Expenses", `₹${data.totalExpenses}`], ["Total Savings", `₹${data.totalSavings}`], ["Total Debt", `₹${data.totalDebt}`], ["Earners", data.earnerCount], ["Dependents", data.dependentCount]].map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", color: "#555" }}>{k}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", fontWeight: 600, color: "#1a237e" }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

// =============================================
//   SHOCK SIMULATION
// =============================================
function ShockSimulation({ setPage }) {
  const [shockType, setShockType] = useState("JOB_LOSS");
  const [shockValue, setShockValue] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const shockOptions = [
    { value: "JOB_LOSS", label: "💀 Complete Job Loss" },
    { value: "INCOME_DROP_20", label: "📉 20% Income Drop" },
    { value: "INCOME_DROP_30", label: "📉 30% Income Drop" },
    { value: "MEDICAL_EMERGENCY", label: "🏥 Medical Emergency (enter amount)" },
    { value: "MIGRATION_COST", label: "✈️ Migration Cost (enter amount)" },
    { value: "SCHOOL_FEE_INCREASE", label: "📚 School Fee Increase/month (enter amount)" },
  ];

  const simulate = async () => {
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${API}/shock-simulate`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ shockType, shockValue: parseFloat(shockValue) || 0 })
      });
      const data = await res.json();
      if (data.message && !data.shockType) setError(data.message);
      else setResult(data);
    } catch { setError("Server error"); }
    setLoading(false);
  };

  const riskColor = { HIGH: "#ef5350", MEDIUM: "#ff9800", LOW: "#43a047" };

  return (
    <div style={{ maxWidth: 800, margin: "32px auto", padding: "0 20px" }}>
      <BackBtn onClick={() => setPage("dashboard")} />
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <h2 style={{ color: "#6a1b9a", marginTop: 0 }}>⚡ Shock Simulation Lab</h2>
        <p style={{ color: "#666", margin: "0 0 20px" }}>Rehearse financial crises before they happen. Select a scenario below.</p>

        {error && <div style={errorBox}>{error}</div>}

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Select Shock Scenario</label>
          <select style={inputStyle} value={shockType} onChange={e => setShockType(e.target.value)}>
            {shockOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {["MEDICAL_EMERGENCY", "MIGRATION_COST", "SCHOOL_FEE_INCREASE"].includes(shockType) && (
          <Input label="Amount (₹)" type="number" value={shockValue} onChange={setShockValue} />
        )}

        <button style={{ ...primaryBtn, background: "#6a1b9a" }} onClick={simulate} disabled={loading}>{loading ? "Simulating..." : "⚡ Simulate Shock"}</button>

        {result && (
          <div style={{ marginTop: 24 }}>
            <div style={{ background: riskColor[result.riskLevel] + "22", border: `2px solid ${riskColor[result.riskLevel]}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 12px", color: riskColor[result.riskLevel] }}>⚠️ {result.shockType}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[["Original Income", `₹${result.originalIncome}`], ["New Income", `₹${result.newIncome}`], ["Monthly Deficit", `₹${result.monthlyDeficit}`], ["Survival Months", result.survivalMonths], ["Risk Level", result.riskLevel], ["Savings Left", `₹${result.newSavings}`]].map(([k, v]) => (
                  <div key={k} style={{ background: "#fff", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 12, color: "#666" }}>{k}</div>
                    <div style={{ fontWeight: 700, color: "#333" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <h4 style={{ color: "#333" }}>📊 Strategy Comparison</h4>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th style={th}>Strategy</th>
                  <th style={th}>Survival Months</th>
                  <th style={th}>Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {result.strategies?.map((s, i) => (
                  <tr key={i}>
                    <td style={td}>{s.strategy}</td>
                    <td style={td}>{String(s.survivalMonths)}</td>
                    <td style={{ ...td, color: riskColor[s.riskLevel], fontWeight: 600 }}>{s.riskLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================
//   OPPORTUNITY MODE
// =============================================
function OpportunityMode({ setPage }) {
  const [form, setForm] = useState({ investmentCost: "", expectedIncomeIncrease: "", successProbability: "0.7" });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const simulate = async () => {
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${API}/opportunity-simulate`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ investmentCost: parseFloat(form.investmentCost), expectedIncomeIncrease: parseFloat(form.expectedIncomeIncrease), successProbability: parseFloat(form.successProbability) })
      });
      const data = await res.json();
      if (data.message && !data.currentIncome) setError(data.message);
      else setResult(data);
    } catch { setError("Server error"); }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 800, margin: "32px auto", padding: "0 20px" }}>
      <BackBtn onClick={() => setPage("dashboard")} />
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <h2 style={{ color: "#2e7d32", marginTop: 0 }}>🌱 Opportunity Mode</h2>
        <p style={{ color: "#666", margin: "0 0 20px" }}>Calculate if an investment opportunity is worth taking.</p>
        {error && <div style={errorBox}>{error}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <Input label="Investment Cost (₹)" type="number" value={form.investmentCost} onChange={v => setForm({ ...form, investmentCost: v })} />
          <Input label="Expected Income Increase/month (₹)" type="number" value={form.expectedIncomeIncrease} onChange={v => setForm({ ...form, expectedIncomeIncrease: v })} />
          <div>
            <label style={labelStyle}>Success Probability</label>
            <select style={inputStyle} value={form.successProbability} onChange={e => setForm({ ...form, successProbability: e.target.value })}>
              <option value="0.5">50% (Risky)</option>
              <option value="0.7">70% (Moderate)</option>
              <option value="0.8">80% (Likely)</option>
              <option value="0.9">90% (Confident)</option>
            </select>
          </div>
        </div>
        <button style={{ ...primaryBtn, background: "#2e7d32" }} onClick={simulate} disabled={loading}>{loading ? "Calculating..." : "🌱 Simulate Opportunity"}</button>

        {result && (
          <div style={{ marginTop: 24 }}>
            <div style={{ background: "#e8f5e9", border: "2px solid #43a047", borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <div style={{ fontWeight: 600, color: "#2e7d32", fontSize: 16, marginBottom: 12 }}>{result.recommendation}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[["Current Income", `₹${result.currentIncome}`], ["New Expected Income", `₹${result.newExpectedIncome}`], ["Investment Cost", `₹${result.investmentCost}`], ["Break-Even", `${result.breakEvenMonths} months`], ["Risk Level", result.riskLevel], ["Survival (Before)", `${result.survivalBeforeInvestment} months`], ["Survival (After)", `${result.survivalAfterInvestment} months`], ["Monthly Savings Before", `₹${result.monthlySavingsBefore}`], ["Monthly Savings After", `₹${result.monthlySavingsAfter}`]].map(([k, v]) => (
                  <div key={k} style={{ background: "#fff", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 12, color: "#666" }}>{k}</div>
                    <div style={{ fontWeight: 700, color: "#1a237e" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================
//   RESILIENCE TRACKER
// =============================================
function ResilienceTracker({ setPage }) {
  const [form, setForm] = useState({ totalIncome: "", totalExpenses: "", totalSavings: "", totalDebt: "", incomeSourceCount: "", skillCount: "", dependentCount: "", earnerCount: "" });
  const [history, setHistory] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/resilience-tracker/history`, { headers: authHeaders() })
      .then(r => r.json()).then(setHistory).catch(() => {});
  }, []);

  const saveEntry = async () => {
    setError(""); setMsg("");
    try {
      const res = await fetch(`${API}/resilience-tracker`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ ...form, month: new Date().toISOString().slice(0, 10).replace(/\d{2}$/, "01") })
      });
      const data = await res.json();
      if (data.success) {
        setMsg(`✅ Saved! Resilience Score: ${data.resilienceScore}/100`);
        const h = await fetch(`${API}/resilience-tracker/history`, { headers: authHeaders() });
        setHistory(await h.json());
      } else setError("Failed to save");
    } catch { setError("Server error"); }
  };

  const latestScore = history.length ? history[history.length - 1].resilienceScore : null;

  return (
    <div style={{ maxWidth: 800, margin: "32px auto", padding: "0 20px" }}>
      <BackBtn onClick={() => setPage("dashboard")} />
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <h2 style={{ color: "#e65100", marginTop: 0 }}>🏆 Resilience Tracker</h2>

        {latestScore !== null && (
          <div style={{ textAlign: "center", background: "linear-gradient(135deg,#e65100,#bf360c)", color: "#fff", borderRadius: 14, padding: "20px 24px", marginBottom: 24 }}>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Current Resilience Score</div>
            <div style={{ fontSize: 60, fontWeight: 900 }}>{Math.round(latestScore)}/100</div>
            <div style={{ fontSize: 14, opacity: 0.85 }}>Based on {history.length} monthly entries</div>
          </div>
        )}

        {error && <div style={errorBox}>{error}</div>}
        {msg && <div style={successBox}>{msg}</div>}

        <h4 style={{ color: "#333", margin: "0 0 12px" }}>📝 Record This Month's Data</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Total Income (₹)" type="number" value={form.totalIncome} onChange={v => setForm({ ...form, totalIncome: v })} />
          <Input label="Total Expenses (₹)" type="number" value={form.totalExpenses} onChange={v => setForm({ ...form, totalExpenses: v })} />
          <Input label="Total Savings (₹)" type="number" value={form.totalSavings} onChange={v => setForm({ ...form, totalSavings: v })} />
          <Input label="Total Debt (₹)" type="number" value={form.totalDebt} onChange={v => setForm({ ...form, totalDebt: v })} />
          <Input label="Number of Income Sources" type="number" value={form.incomeSourceCount} onChange={v => setForm({ ...form, incomeSourceCount: v })} />
          <Input label="Number of Skills" type="number" value={form.skillCount} onChange={v => setForm({ ...form, skillCount: v })} />
          <Input label="Number of Dependents" type="number" value={form.dependentCount} onChange={v => setForm({ ...form, dependentCount: v })} />
          <Input label="Number of Earners" type="number" value={form.earnerCount} onChange={v => setForm({ ...form, earnerCount: v })} />
        </div>
        <button style={{ ...primaryBtn, background: "#e65100" }} onClick={saveEntry}>💾 Save Monthly Entry</button>

        {history.length > 0 && (
          <>
            <h4 style={{ color: "#333", marginTop: 24 }}>📈 Resilience Trend</h4>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
              {history.map((h, i) => {
                const score = Math.round(h.resilienceScore);
                const height = Math.max(20, score * 2);
                const color = score < 40 ? "#ef5350" : score < 70 ? "#ff9800" : "#43a047";
                return (
                  <div key={i} style={{ textAlign: "center", minWidth: 56 }}>
                    <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>{score}</div>
                    <div style={{ background: color, height: height, borderRadius: 4, width: 40, margin: "0 auto" }} />
                    <div style={{ fontSize: 10, color: "#888", marginTop: 4 }}>{h.month?.slice(0, 7)}</div>
                  </div>
                );
              })}
            </div>

            <h4 style={{ color: "#333", marginTop: 20 }}>📊 History</h4>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  {["Month", "Income", "Expenses", "Savings", "Debt", "Score"].map(h => <th key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i}>
                    <td style={td}>{h.month?.slice(0, 7)}</td>
                    <td style={td}>₹{h.totalIncome}</td>
                    <td style={td}>₹{h.totalExpenses}</td>
                    <td style={td}>₹{h.totalSavings}</td>
                    <td style={td}>₹{h.totalDebt}</td>
                    <td style={{ ...td, fontWeight: 700, color: h.resilienceScore > 60 ? "#43a047" : h.resilienceScore > 40 ? "#ff9800" : "#ef5350" }}>{Math.round(h.resilienceScore)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

// =============================================
//   SHARED COMPONENTS & STYLES
// =============================================
function Input({ label, type = "text", value, onChange }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} style={inputStyle} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function BackBtn({ onClick }) {
  return <button onClick={onClick} style={{ background: "none", border: "none", color: "#1a237e", cursor: "pointer", fontSize: 14, marginBottom: 16, fontWeight: 600 }}>← Back to Dashboard</button>;
}

const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 4 };
const inputStyle = { width: "100%", padding: "9px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none" };
const primaryBtn = { display: "block", width: "100%", padding: "12px", background: "#1a237e", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 16 };
const pageCenter = { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: 20 };
const card = { background: "#fff", borderRadius: 20, padding: 36, boxShadow: "0 8px 40px rgba(0,0,0,0.12)", width: "100%", maxWidth: 420 };
const errorBox = { background: "#ffebee", border: "1px solid #ef5350", color: "#c62828", padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: 14 };
const successBox = { background: "#e8f5e9", border: "1px solid #43a047", color: "#1b5e20", padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: 14 };
const link = { color: "#1a237e", cursor: "pointer", fontWeight: 600 };
const th = { padding: "10px 12px", textAlign: "left", fontSize: 13, color: "#555", borderBottom: "2px solid #e0e0e0" };
const td = { padding: "9px 12px", fontSize: 13, borderBottom: "1px solid #f0f0f0", color: "#333" };
