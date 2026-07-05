import { Bell, CheckCircle2, ClipboardCheck, LogOut, Search, ShieldCheck, UploadCloud } from "lucide-react";
import React from "react";
import { useEffect, useMemo, useState } from "react";
import { api } from "./api.js";

const emptyReport = {
  type: "lost",
  title: "",
  description: "",
  category: "Electronics",
  location: "",
  eventDate: new Date().toISOString().slice(0, 10),
  image: null
};

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState(readStoredUser);
  const [authMode, setAuthMode] = useState("login");
  const [auth, setAuth] = useState({ name: "", email: "", password: "", department: "", phone: "" });
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [report, setReport] = useState(emptyReport);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [claimProof, setClaimProof] = useState({});
  const [message, setMessage] = useState("");

  const isAdmin = user?.role === "admin";

  async function loadData() {
    if (!user) return;
    const params = {};
    if (filter !== "all") params.type = filter;
    if (query) params.q = query;

    const [itemsRes, claimsRes, notesRes] = await Promise.all([
      api.get("/items", { params }),
      api.get("/claims"),
      api.get("/notifications")
    ]);

    setItems(itemsRes.data.items);
    setClaims(claimsRes.data.claims);
    setNotifications(notesRes.data.notifications);

    if (isAdmin) {
      const adminRes = await api.get("/admin/dashboard");
      setStats(adminRes.data.stats);
    }
  }

  useEffect(() => {
    loadData().catch((error) => setMessage(error.response?.data?.message || error.message));
  }, [user, filter]);

  async function handleAuth(event) {
    event.preventDefault();
    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
      const { data } = await api.post(endpoint, auth);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      setMessage(`Welcome, ${data.user.name}`);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to connect to the server.");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  async function submitReport(event) {
    event.preventDefault();
    const formData = new FormData();
    Object.entries(report).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    await api.post("/items", formData, { headers: { "Content-Type": "multipart/form-data" } });
    setReport(emptyReport);
    setMessage("Report submitted for admin verification.");
    await loadData();
  }

  async function verifyItem(id, status) {
    await api.patch(`/admin/items/${id}/verify`, { status });
    setMessage(status === "verified" ? "Item verified and matching scan completed." : "Item updated.");
    await loadData();
  }

  async function submitClaim(itemId) {
    await api.post("/claims", { item: itemId, proof: claimProof[itemId] });
    setClaimProof({ ...claimProof, [itemId]: "" });
    setMessage("Claim sent for review.");
    await loadData();
  }

  async function reviewClaim(id, status) {
    await api.patch(`/admin/claims/${id}/review`, { status });
    setMessage(`Claim ${status}.`);
    await loadData();
  }

  const unread = useMemo(() => notifications.filter((note) => !note.read).length, [notifications]);

  if (!user) {
    return (
      <main className="auth-shell">
        <section className="auth-panel">
          <div>
            <p className="eyebrow">Campus Lost & Found</p>
            <h1>Report, match, verify, and return campus items faster.</h1>
          </div>
          <form onSubmit={handleAuth} className="auth-form">
            <div className="segmented">
              <button type="button" className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>
                Login
              </button>
              <button type="button" className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")}>
                Register
              </button>
            </div>
            {authMode === "register" && (
              <input placeholder="Full name" value={auth.name} onChange={(e) => setAuth({ ...auth, name: e.target.value })} required />
            )}
            <input placeholder="Campus email" type="email" value={auth.email} onChange={(e) => setAuth({ ...auth, email: e.target.value })} required />
            <input placeholder="Password" type="password" value={auth.password} onChange={(e) => setAuth({ ...auth, password: e.target.value })} required />
            {authMode === "register" && (
              <div className="two-col">
                <input placeholder="Department" value={auth.department} onChange={(e) => setAuth({ ...auth, department: e.target.value })} />
                <input placeholder="Phone" value={auth.phone} onChange={(e) => setAuth({ ...auth, phone: e.target.value })} />
              </div>
            )}
            <button className="primary" type="submit">{authMode === "login" ? "Login" : "Create account"}</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Campus Lost & Found</p>
          <h1>Operations Dashboard</h1>
        </div>
        <div className="top-actions">
          <span className="pill"><Bell size={16} /> {unread}</span>
          {isAdmin && <span className="pill admin"><ShieldCheck size={16} /> Admin</span>}
          <button className="icon-button" onClick={logout} title="Logout"><LogOut size={18} /></button>
        </div>
      </header>

      {message && <div className="toast">{message}</div>}

      {isAdmin && stats && (
        <section className="stats-grid">
          {Object.entries(stats).map(([key, value]) => (
            <article className="stat" key={key}>
              <span>{key.replace(/([A-Z])/g, " $1")}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </section>
      )}

      <section className="layout">
        <aside className="panel">
          <h2><UploadCloud size={20} /> New Report</h2>
          <form onSubmit={submitReport} className="stack">
            <div className="segmented">
              <button type="button" className={report.type === "lost" ? "active" : ""} onClick={() => setReport({ ...report, type: "lost" })}>Lost</button>
              <button type="button" className={report.type === "found" ? "active" : ""} onClick={() => setReport({ ...report, type: "found" })}>Found</button>
            </div>
            <input placeholder="Item title" value={report.title} onChange={(e) => setReport({ ...report, title: e.target.value })} required />
            <select value={report.category} onChange={(e) => setReport({ ...report, category: e.target.value })}>
              <option>Electronics</option>
              <option>ID & Cards</option>
              <option>Books</option>
              <option>Bags</option>
              <option>Keys</option>
              <option>Clothing</option>
              <option>Other</option>
            </select>
            <textarea placeholder="Description, marks, color, brand, contents" value={report.description} onChange={(e) => setReport({ ...report, description: e.target.value })} required />
            <div className="two-col">
              <input placeholder="Location" value={report.location} onChange={(e) => setReport({ ...report, location: e.target.value })} required />
              <input type="date" value={report.eventDate} onChange={(e) => setReport({ ...report, eventDate: e.target.value })} required />
            </div>
            <input type="file" accept="image/*" onChange={(e) => setReport({ ...report, image: e.target.files[0] })} />
            <button className="primary" type="submit">Submit</button>
          </form>
        </aside>

        <section className="feed">
          <div className="feed-tools">
            <div className="searchbox">
              <Search size={18} />
              <input placeholder="Search reports" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && loadData()} />
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
            <button onClick={loadData}>Refresh</button>
          </div>

          <div className="item-grid">
            {items.map((item) => (
              <article className="item-card" key={item._id}>
                <div className="item-image">
                  {item.image?.url ? <img src={`${api.defaults.baseURL.replace("/api", "")}${item.image.url}`} alt={item.title} /> : <ClipboardCheck size={36} />}
                </div>
                <div className="item-body">
                  <div className="item-head">
                    <span className={`status ${item.status}`}>{item.status}</span>
                    <span className="type">{item.type}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className="meta">{item.category} · {item.location} · {new Date(item.eventDate).toLocaleDateString()}</div>
                  {item.matchScore > 0 && <div className="match"><CheckCircle2 size={16} /> {item.matchScore}% possible match</div>}
                  {isAdmin && item.status === "pending" && (
                    <div className="actions">
                      <button onClick={() => verifyItem(item._id, "verified")}>Verify</button>
                      <button onClick={() => verifyItem(item._id, "rejected")}>Reject</button>
                    </div>
                  )}
                  {!isAdmin && item.type === "found" && item.status !== "claimed" && (
                    <div className="claim-box">
                      <textarea placeholder="Ownership proof" value={claimProof[item._id] || ""} onChange={(e) => setClaimProof({ ...claimProof, [item._id]: e.target.value })} />
                      <button onClick={() => submitClaim(item._id)} disabled={!claimProof[item._id]}>Claim</button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="panel">
          <h2><Bell size={20} /> Notifications</h2>
          <div className="mini-list">
            {notifications.slice(0, 6).map((note) => (
              <article key={note._id} className={note.read ? "" : "unread"}>
                <strong>{note.title}</strong>
                <p>{note.message}</p>
              </article>
            ))}
          </div>

          <h2><ClipboardCheck size={20} /> Claims</h2>
          <div className="mini-list">
            {claims.slice(0, 6).map((claim) => (
              <article key={claim._id}>
                <strong>{claim.item?.title}</strong>
                <p>{claim.proof}</p>
                <span className={`status ${claim.status}`}>{claim.status}</span>
                {isAdmin && claim.status === "pending" && (
                  <div className="actions">
                    <button onClick={() => reviewClaim(claim._id, "approved")}>Approve</button>
                    <button onClick={() => reviewClaim(claim._id, "rejected")}>Reject</button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
