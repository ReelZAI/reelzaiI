import { useState, useEffect } from "react";

const isMobileScreen = () => typeof window !== "undefined" && window.innerWidth < 768;
const rGrid = (cols = "1fr 1fr") => ({ display: "grid", gridTemplateColumns: isMobileScreen() ? "1fr" : cols });

const COLORS = {
  bg: "#09090f", sidebar: "#0d0d18", card: "#0f0f1c", cardHover: "#141425",
  border: "#1e1e30", border2: "#252535", accent: "#7c3aed", accentHover: "#6d28d9",
  accentSoft: "#7c3aed22", gold: "#f59e0b", green: "#10b981", red: "#ef4444",
  blue: "#3b82f6", text: "#e2e2f0", textMuted: "#6b6b88", textDim: "#9090aa",
};

const NAV = [
  { id: "dashboard", icon: "⊞", label: "Dashboard" },
  { id: "scripts", icon: "📄", label: "Scripts" },
  { id: "hooks", icon: "🪝", label: "Hooks" },
  { id: "hashtags", icon: "#", label: "Hashtags" },
  { id: "ideas", icon: "💡", label: "Ideas" },
  { id: "analytics", icon: "📊", label: "Analytics" },
  { id: "saved", icon: "🔖", label: "Saved" },
  { id: "templates", icon: "⊟", label: "Templates" },
];

const ACCOUNT_NAV = [
  { id: "profile", icon: "👤", label: "Profile" },
  { id: "subscription", icon: "💳", label: "Subscription" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

// ─────────────────────────────────────────────
// TIER CONFIGURATION  — single source of truth
// ─────────────────────────────────────────────
const TIER_CONFIG = {
  free:    { credits: 50,    savedLimit: 5,   scriptsPerDay: 3, hooksPerDay: 3, hashtags: false, ideas: false, analytics: false, templates: false, label: "Free",    icon: "🆓", color: "#10b981" },
  starter: { credits: 500,   savedLimit: 50,  scriptsPerDay: 999, hooksPerDay: 999, hashtags: true, ideas: true, analytics: false, templates: true,  label: "Starter", icon: "⚡", color: "#3b82f6" },
  pro:     { credits: 5000,  savedLimit: 999, scriptsPerDay: 999, hooksPerDay: 999, hashtags: true, ideas: true, analytics: true,  templates: true,  label: "Pro",     icon: "👑", color: "#7c3aed" },
  agency:  { credits: 99999, savedLimit: 999, scriptsPerDay: 999, hooksPerDay: 999, hashtags: true, ideas: true, analytics: true,  templates: true,  label: "Agency",  icon: "🏢", color: "#f59e0b" },
};

function UpgradePrompt({ feature, setPage }) {
  return (
    <Card style={{ textAlign: "center", padding: 60, border: `1px solid ${COLORS.accent}44` }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
      <div style={{ color: COLORS.text, fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{feature} is a paid feature</div>
      <div style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 24 }}>Upgrade your plan to unlock this and much more.</div>
      <Btn onClick={() => setPage("subscription")} style={{ margin: "0 auto" }}>⚡ View Plans</Btn>
    </Card>
  );
}



async function callClaude(prompt) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer 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",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  if (!data.choices || !data.choices[0]) throw new Error("Empty response from API");
  return data.choices[0].message.content;
}

function Btn({ children, variant = "primary", onClick, style = {}, small = false }) {
  const base = {
    border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600,
    display: "inline-flex", alignItems: "center", gap: 6, transition: "all 0.15s",
    fontFamily: "inherit", padding: small ? "6px 12px" : "9px 18px", fontSize: small ? 12 : 14,
  };
  const variants = {
    primary: { background: COLORS.accent, color: "#fff" },
    ghost: { background: COLORS.card, border: `1px solid ${COLORS.border2}`, color: COLORS.textDim },
    danger: { background: "#ef444422", border: "1px solid #ef444455", color: "#ef4444" },
    success: { background: "#10b98122", border: "1px solid #10b98155", color: "#10b981" },
  };
  return (
    <button onClick={onClick} style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
    >{children}</button>
  );
}

function Card({ children, style = {} }) {
  return <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 24, ...style }}>{children}</div>;
}

function Badge({ children, color = COLORS.accent }) {
  return <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{children}</span>;
}

function Input({ label, value, onChange, placeholder, type = "text", style = {} }) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      {label && <label style={{ display: "block", fontSize: 13, color: COLORS.textDim, marginBottom: 6 }}>{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width: "100%", background: "#141420", border: `1px solid ${COLORS.border2}`, borderRadius: 8, padding: "9px 12px", color: COLORS.text, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
        onFocus={e => e.target.style.borderColor = COLORS.accent}
        onBlur={e => e.target.style.borderColor = COLORS.border2}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      {label && <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>{label}</div>}
      <div style={{ position: "relative" }}>
        <select value={value} onChange={onChange} style={{ width: "100%", background: "#141420", border: `1px solid ${COLORS.border2}`, borderRadius: 8, padding: "9px 12px", color: COLORS.textDim, fontSize: 14, cursor: "pointer", appearance: "none", outline: "none", fontFamily: "inherit" }}>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
        <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: COLORS.textMuted, pointerEvents: "none" }}>▾</span>
      </div>
    </div>
  );
}

function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: COLORS.text }}>{title}</h1>
        {subtitle && <p style={{ margin: "5px 0 0", color: COLORS.textMuted, fontSize: 14 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: 10 }}>{actions}</div>}
    </div>
  );
}

function GeneratedResult({ title, content, onSave }) {
  const [copied, setCopied] = useState(false);
  return (
    <Card style={{ marginTop: 20, border: `1px solid ${COLORS.accent}44` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontWeight: 700, color: COLORS.text, fontSize: 15 }}>✨ {title}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost" small onClick={() => { navigator.clipboard?.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? "✓ Copied" : "📋 Copy"}</Btn>
          <Btn variant="success" small onClick={onSave}>🔖 Save</Btn>
        </div>
      </div>
      <div style={{ background: "#141420", borderRadius: 8, padding: 16, color: COLORS.textDim, fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap", maxHeight: 300, overflowY: "auto" }}>{content}</div>
    </Card>
  );
}

function Sidebar({ page, setPage, credits, collapsed, setCollapsed, onLogout }) {
  const w = collapsed ? 64 : 210;
  return (
    <aside style={{ width: w, minWidth: w, background: COLORS.sidebar, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", padding: "20px 0", flexShrink: 0, overflowY: "auto", overflowX: "hidden", transition: "width 0.25s ease, min-width 0.25s ease" }}>
      <div style={{ padding: "0 14px 24px", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", gap: 8 }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎬</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>Reel<span style={{ color: COLORS.accent }}>ZAI</span></div>
              <div style={{ fontSize: 10, color: COLORS.textMuted }}>AI-Powered Viral Reels</div>
            </div>
          </div>
        )}
        {collapsed && <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎬</div>}
        {!collapsed && <button onClick={() => setCollapsed(true)} style={{ background: COLORS.border, border: "none", borderRadius: 6, color: COLORS.textMuted, cursor: "pointer", padding: "4px 7px", fontSize: 14, lineHeight: 1, flexShrink: 0 }}>◀</button>}
      </div>
      {collapsed && <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><button onClick={() => setCollapsed(false)} style={{ background: COLORS.border, border: "none", borderRadius: 6, color: COLORS.textMuted, cursor: "pointer", padding: "4px 7px", fontSize: 14, lineHeight: 1 }}>▶</button></div>}
      <nav style={{ flex: 1, padding: "0 8px" }}>
        {NAV.map(item => (
          <div key={item.id} onClick={() => setPage(item.id)} title={collapsed ? item.label : ""}
            style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "10px 0" : "9px 12px", borderRadius: 8, marginBottom: 2, background: page === item.id ? COLORS.accent : "transparent", color: page === item.id ? "#fff" : COLORS.textMuted, cursor: "pointer", fontSize: 14, transition: "all 0.15s" }}
            onMouseEnter={e => { if (page !== item.id) e.currentTarget.style.background = COLORS.border; }}
            onMouseLeave={e => { if (page !== item.id) e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {!collapsed && item.label}
          </div>
        ))}
      </nav>
      <div style={{ padding: "0 8px", borderTop: `1px solid ${COLORS.border}`, paddingTop: 12, marginTop: 8 }}>
        {!collapsed && <div style={{ fontSize: 10, color: COLORS.textMuted, padding: "4px 12px 8px", letterSpacing: 1, textTransform: "uppercase" }}>Account</div>}
        {ACCOUNT_NAV.map(item => (
          <div key={item.id} onClick={() => setPage(item.id)} title={collapsed ? item.label : ""}
            style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "10px 0" : "8px 12px", borderRadius: 8, marginBottom: 2, background: page === item.id ? COLORS.border : "transparent", color: page === item.id ? COLORS.text : COLORS.textMuted, cursor: "pointer", fontSize: 14, transition: "all 0.15s" }}
            onMouseEnter={e => { if (page !== item.id) e.currentTarget.style.background = COLORS.border; }}
            onMouseLeave={e => { if (page !== item.id) e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {!collapsed && item.label}
          </div>
        ))}
        <div onClick={onLogout} title={collapsed ? "Logout" : ""}
          style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "10px 0" : "8px 12px", borderRadius: 8, marginBottom: 2, color: COLORS.red, cursor: "pointer", fontSize: 14, transition: "all 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "#ef444422"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <span style={{ fontSize: 18 }}>🚪</span>
          {!collapsed && "Log Out"}
        </div>
      </div>
      {!collapsed && (
        <div style={{ padding: "12px 12px 0" }}>
          <div style={{ background: "#141420", borderRadius: 10, padding: 14, border: `1px solid ${COLORS.border2}` }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#fff", marginBottom: 4 }}>Need more credits?</div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 12 }}>Generate unlimited content</div>
            <button onClick={() => setPage("subscription")} style={{ width: "100%", padding: "8px 0", background: COLORS.accent, color: "#fff", border: "none", borderRadius: 7, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>⚡ Buy Credits</button>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#fff", marginBottom: 6 }}>{credits.toLocaleString()} credits remaining</div>
              <div style={{ height: 6, background: COLORS.border2, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${Math.min((credits / Math.max((TIER_CONFIG[plan] || TIER_CONFIG.free).credits, 1)) * 100, 100)}%`, height: "100%", background: credits > 10 ? COLORS.accent : COLORS.red, borderRadius: 3 }} />
              </div>
              <div style={{ textAlign: "right", fontSize: 11, color: COLORS.textMuted, marginTop: 3 }}>{credits > 0 ? `${credits} left` : "Out of credits"}</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function TopBar({ credits, setPage, setCollapsed }) {
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 10, background: COLORS.bg + "ee", backdropFilter: "blur(12px)", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "12px 32px" }}>
      <button onClick={() => setCollapsed(c => !c)} style={{ background: COLORS.card, border: `1px solid ${COLORS.border2}`, borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18, color: COLORS.textMuted, flexShrink: 0 }}>☰</button>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border2}`, borderRadius: 8, padding: "7px 14px", display: "flex", alignItems: "center", gap: 7, fontSize: 14, color: COLORS.text }}>
          <span style={{ color: COLORS.gold }}>⚡</span>
          <span style={{ fontWeight: 600 }}>{credits.toLocaleString()} credits</span>
        </div>
        <div onClick={() => setPage("profile")} style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #f59e0b, #ef4444)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
      </div>
    </div>
  );
}

function DashboardPage({ setPage, savedItems, plan = "free" }) {
  const TEMPLATES = [
    { color: "#e74c3c", icon: "🎯", name: "Listicle", desc: "Perfect for tips, tricks, and step-by-step guides" },
    { color: "#9b59b6", icon: "🧠", name: "Story Time", desc: "Share engaging stories that hook your audience" },
    { color: "#27ae60", icon: "✅", name: "How To", desc: "Step-by-step tutorials and how-to guides" },
    { color: "#f39c12", icon: "⭐", name: "Motivational", desc: "Inspire your audience with powerful messages" },
    { color: "#3498db", icon: "💬", name: "Q&A", desc: "Answer common questions in your niche" },
    { color: "#e74c3c", icon: "🔥", name: "Controversial", desc: "Hot takes and bold opinions that spark engagement" },
  ];
  const PRO_TIPS = [
    { icon: "🎯", title: "Hook in 3 seconds", desc: "Grab attention immediately" },
    { icon: "👥", title: "Know your audience", desc: "Create content they want to see" },
    { icon: "📊", title: "Keep it short", desc: "15-60 seconds performs best" },
    { icon: "🔄", title: "Post consistently", desc: "Consistency builds your audience" },
    { icon: "🔥", title: "Follow trends", desc: "Use trending audio and topics" },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Create viral content 10x faster with AI 🚀" />
      {(() => {
        const tier = TIER_CONFIG[plan] || TIER_CONFIG.free;
        const isFree = plan === "free";
        return (
          <div style={{ background: isFree ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, border: isFree ? `1px solid ${COLORS.border2}` : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 26 }}>{tier.icon}</span>
              <div>
                <div style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>{tier.label} Plan{isFree ? "" : " Active"}</div>
                <div style={{ color: isFree ? COLORS.textMuted : "rgba(255,255,255,0.75)", fontSize: 13 }}>
                  {isFree ? "Upgrade to unlock all features and more credits" : "You have access to all included features"}
                </div>
              </div>
            </div>
            <Btn onClick={() => setPage("subscription")} style={{ background: isFree ? COLORS.accent : "rgba(255,255,255,0.15)", border: isFree ? "none" : "1px solid rgba(255,255,255,0.3)" }}>
              {isFree ? "⚡ Upgrade Now" : `${tier.icon} Manage Plan`}
            </Btn>
          </div>
        );
      })()}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {[{ id: "scripts", label: "✨ Script Generator" }, { id: "hooks", label: "🪝 Hook Generator" }, { id: "hashtags", label: "# Hashtag Finder" }, { id: "ideas", label: "💡 Video Ideas" }].map(t => (
            <Btn key={t.id} onClick={() => setPage(t.id)}>{t.label}</Btn>
          ))}
        </div>
        <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Quick access to all AI generators — click any above to get started.</div>
      </Card>
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>⭐</span>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: COLORS.text }}>Popular Templates</h2>
          </div>
          <button onClick={() => setPage("templates")} style={{ background: "none", border: "none", color: COLORS.accent, fontSize: 13, cursor: "pointer" }}>View all templates →</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobileScreen() ? "1fr" : "repeat(3, 1fr)", gap: 14 }}>
          {TEMPLATES.map(t => (
            <div key={t.name} style={{ background: "#141420", border: `1px solid ${COLORS.border2}`, borderRadius: 10, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: t.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{t.icon}</div>
                <span style={{ fontWeight: 600, color: COLORS.text, fontSize: 14 }}>{t.name}</span>
              </div>
              <p style={{ margin: "0 0 14px", fontSize: 12, color: COLORS.textMuted, lineHeight: 1.5 }}>{t.desc}</p>
              <button onClick={() => setPage("scripts")} style={{ width: "100%", background: "transparent", border: `1px solid ${COLORS.border2}`, borderRadius: 7, color: COLORS.textDim, padding: "7px 0", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>Use Template</button>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <span>💡</span>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: COLORS.gold }}>Pro Tips for Viral Content</h2>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {PRO_TIPS.map(tip => (
            <div key={tip.title} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{tip.icon}</div>
              <div style={{ fontWeight: 600, color: COLORS.text, fontSize: 13, marginBottom: 4 }}>{tip.title}</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>{tip.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ScriptsPage({ onSave, plan = "free", setPage }) {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Motivational");
  const [duration, setDuration] = useState("60 Seconds");
  const [language, setLanguage] = useState("English");
  const [template, setTemplate] = useState("None");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tier = TIER_CONFIG[plan] || TIER_CONFIG.free;
  const todayKey = "reelzai_scripts_" + new Date().toDateString();
  const usedToday = () => { try { return parseInt(localStorage.getItem(todayKey) || "0"); } catch { return 0; } };
  const bumpUsage = () => { try { localStorage.setItem(todayKey, String(usedToday() + 1)); } catch {} };

  const generate = async () => {
    if (!topic.trim()) return;
    if (usedToday() >= tier.scriptsPerDay) { setError(`Daily limit of ${tier.scriptsPerDay} scripts reached on the ${tier.label} plan. Upgrade for more.`); return; }
    setLoading(true); setResult(null); setError(null);
    try {
      const text = await callClaude(`Write a viral ${duration} ${tone.toLowerCase()} video script about: "${topic}". ${template !== "None" ? `Use a ${template} format.` : ""} Language: ${language}. Format with [HOOK], [MAIN CONTENT], and [CTA] sections. Make it engaging and shareable.`);
      setResult(text);
      bumpUsage();
    } catch (e) { setError("Failed to generate: " + e.message); }
    setLoading(false);
  };

  return (
    <div>
      <PageHeader title="✏️ Script Generator" subtitle="Generate viral video scripts powered by AI" actions={plan === "free" && <div style={{fontSize:12,color:COLORS.textMuted,background:COLORS.card,border:`1px solid ${COLORS.border2}`,borderRadius:8,padding:"5px 10px"}}>{usedToday()}/{tier.scriptsPerDay} scripts used today</div>} />
      <div style={{ ...rGrid(), gap: 16, marginBottom: 16 }}>
        <Card>
          <h3 style={{ margin: "0 0 16px", color: COLORS.text, fontSize: 15 }}>Script Settings</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, color: COLORS.textDim, marginBottom: 6 }}>What is your video about? *</label>
            <textarea value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., 5 morning habits that changed my life..." style={{ width: "100%", minHeight: 100, background: "#141420", border: `1px solid ${COLORS.border2}`, borderRadius: 8, padding: "10px 12px", color: COLORS.textDim, fontSize: 14, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <Select label="Tone" value={tone} onChange={e => setTone(e.target.value)} options={["Motivational", "Professional", "Casual", "Humorous", "Dramatic", "Educational"]} />
            <Select label="Duration" value={duration} onChange={e => setDuration(e.target.value)} options={["15 Seconds", "30 Seconds", "60 Seconds", "90 Seconds", "3 Minutes"]} />
            <Select label="Language" value={language} onChange={e => setLanguage(e.target.value)} options={["English", "Spanish", "French", "German", "Portuguese", "Italian"]} />
            <Select label="Template" value={template} onChange={e => setTemplate(e.target.value)} options={["None", "Listicle", "Story Time", "How To", "Motivational", "Q&A", "Controversial"]} />
          </div>
          <Btn onClick={generate} style={{ width: "100%", justifyContent: "center" }} variant={loading ? "ghost" : "primary"}>
            {loading ? "⏳ Generating..." : "✈️ Generate Script"}
          </Btn>
        </Card>
        <Card>
          <h3 style={{ margin: "0 0 14px", color: COLORS.text, fontSize: 15 }}>💡 Tips for Better Scripts</h3>
          {[
            { t: "Be Specific", d: "Instead of 'fitness tips', try '3 exercises to lose belly fat in 30 days'" },
            { t: "Add Emotion", d: "Scripts with emotional hooks get 3x more engagement" },
            { t: "Include a CTA", d: "Always end with a clear call-to-action for your audience" },
            { t: "Keep It Conversational", d: "Write like you speak — avoid formal language" },
          ].map(tip => (
            <div key={tip.t} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${COLORS.border}` }}>
              <div style={{ fontWeight: 600, color: COLORS.text, fontSize: 13, marginBottom: 4 }}>✅ {tip.t}</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>{tip.d}</div>
            </div>
          ))}
        </Card>
      </div>
      {loading && <Card style={{ textAlign: "center", padding: 40 }}><div style={{ fontSize: 32, marginBottom: 12 }}>✨</div><div style={{ color: COLORS.text, fontSize: 16, fontWeight: 600 }}>Generating your viral script...</div><div style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 6 }}>This usually takes 5-10 seconds</div></Card>}
      {error && <Card style={{ marginTop: 20, border: `1px solid ${COLORS.red}44` }}><div style={{ color: COLORS.red }}>{error}</div></Card>}
      {result && <GeneratedResult title="Generated Script" content={result} onSave={() => onSave({ type: "Script", content: result, topic, date: new Date().toLocaleDateString() })} />}
    </div>
  );
}

function HooksPage({ onSave, plan = "free", setPage }) {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("Question");
  const [count, setCount] = useState("5");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tier = TIER_CONFIG[plan] || TIER_CONFIG.free;
  const todayKey = "reelzai_hooks_" + new Date().toDateString();
  const usedToday = () => { try { return parseInt(localStorage.getItem(todayKey) || "0"); } catch { return 0; } };
  const bumpUsage = () => { try { localStorage.setItem(todayKey, String(usedToday() + 1)); } catch {} };

  const generate = async () => {
    if (!topic.trim()) return;
    if (usedToday() >= tier.hooksPerDay) { setError(`Daily limit of ${tier.hooksPerDay} hook sets reached on the ${tier.label} plan. Upgrade for more.`); return; }
    setLoading(true); setResult(null); setError(null);
    try {
      const text = await callClaude(`Generate ${count} viral video hooks for a video about: "${topic}". Style: ${style}. Each hook should grab attention within the first 3 seconds. Number them and make each one punchy and compelling. Include a brief explanation of why each hook works.`);
      setResult(text);
      bumpUsage();
    } catch (e) { setError("Failed to generate: " + e.message); }
    setLoading(false);
  };

  const STYLES = [
    { name: "Question", desc: "Start with a compelling question", ex: '"Did you know 90% of people are doing this wrong?"' },
    { name: "Shocking Stat", desc: "Lead with a surprising number", ex: '"I made $10k in 30 days doing this..."' },
    { name: "Controversy", desc: "Challenge a common belief", ex: '"Everything you know about X is a lie"' },
    { name: "Story", desc: "Start mid-story for intrigue", ex: '"I was about to quit when..."' },
    { name: "Challenge", desc: "Dare the viewer", ex: '"I bet you can\'t watch this without..."' },
  ];

  return (
    <div>
      <PageHeader title="🪝 Hook Generator" subtitle="Create attention-grabbing video openings that stop the scroll" actions={plan === "free" && <div style={{fontSize:12,color:COLORS.textMuted,background:COLORS.card,border:`1px solid ${COLORS.border2}`,borderRadius:8,padding:"5px 10px"}}>{usedToday()}/{tier.hooksPerDay} hooks used today</div>} />
      <div style={{ ...rGrid(), gap: 16, marginBottom: 20 }}>
        <Card>
          <h3 style={{ margin: "0 0 16px", color: COLORS.text, fontSize: 15 }}>Hook Settings</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, color: COLORS.textDim, marginBottom: 6 }}>Video Topic *</label>
            <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="What is your video about?" style={{ width: "100%", background: "#141420", border: `1px solid ${COLORS.border2}`, borderRadius: 8, padding: "10px 12px", color: COLORS.textDim, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <Select label="Hook Style" value={style} onChange={e => setStyle(e.target.value)} options={["Question", "Shocking Stat", "Controversy", "Story", "Challenge", "Bold Statement"]} />
            <Select label="How Many?" value={count} onChange={e => setCount(e.target.value)} options={["3", "5", "10"]} />
          </div>
          <Btn onClick={generate} style={{ width: "100%", justifyContent: "center" }} variant={loading ? "ghost" : "primary"}>
            {loading ? "⏳ Generating..." : "🪝 Generate Hooks"}
          </Btn>
        </Card>
        <Card>
          <h3 style={{ margin: "0 0 14px", color: COLORS.text, fontSize: 15 }}>Hook Style Examples</h3>
          {STYLES.map(s => (
            <div key={s.name} onClick={() => setStyle(s.name)} style={{ padding: "10px 12px", borderRadius: 8, marginBottom: 8, border: `1px solid ${style === s.name ? COLORS.accent : COLORS.border}`, background: style === s.name ? COLORS.accentSoft : "transparent", cursor: "pointer", transition: "all 0.15s" }}>
              <div style={{ fontWeight: 600, color: COLORS.text, fontSize: 13 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{s.desc}</div>
              <div style={{ fontSize: 12, color: COLORS.accent, marginTop: 4, fontStyle: "italic" }}>{s.ex}</div>
            </div>
          ))}
        </Card>
      </div>
      {loading && <Card style={{ textAlign: "center", padding: 40 }}><div style={{ fontSize: 32, marginBottom: 12 }}>🪝</div><div style={{ color: COLORS.text, fontSize: 16, fontWeight: 600 }}>Crafting attention-grabbing hooks...</div></Card>}
      {error && <Card style={{ marginTop: 20, border: `1px solid ${COLORS.red}44` }}><div style={{ color: COLORS.red }}>{error}</div></Card>}
      {result && <GeneratedResult title="Generated Hooks" content={result} onSave={() => onSave({ type: "Hooks", content: result, topic, date: new Date().toLocaleDateString() })} />}
    </div>
  );
}

function HashtagsPage({ onSave, plan = "free", setPage }) {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("TikTok");
  const [niche, setNiche] = useState("General");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setResult(null); setError(null);
    try {
      const text = await callClaude(`Generate the best hashtags for a ${platform} video about: "${topic}" in the ${niche} niche. Provide: 1) 5 mega hashtags (1M+ posts), 2) 10 medium hashtags (100k-1M posts), 3) 10 niche hashtags (under 100k posts). Format clearly with sections. Explain the strategy briefly.`);
      setResult(text);
    } catch (e) { setError("Failed to generate: " + e.message); }
    setLoading(false);
  };

  const hashtagTier = TIER_CONFIG[plan] || TIER_CONFIG.free;
  if (!hashtagTier.hashtags) {
    return (
      <div>
        <PageHeader title="# Hashtag Finder" subtitle="Discover the perfect hashtags to maximize your reach" />
        <UpgradePrompt feature="Hashtag Finder" setPage={setPage} />
      </div>
    );
  }
  return (
    <div>
      <PageHeader title="# Hashtag Finder" subtitle="Discover the perfect hashtags to maximize your reach" />
      <div style={{ ...rGrid(), gap: 16, marginBottom: 20 }}>
        <Card>
          <h3 style={{ margin: "0 0 16px", color: COLORS.text, fontSize: 15 }}>Hashtag Settings</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, color: COLORS.textDim, marginBottom: 6 }}>Video Topic *</label>
            <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="What is your video about?" style={{ width: "100%", background: "#141420", border: `1px solid ${COLORS.border2}`, borderRadius: 8, padding: "10px 12px", color: COLORS.textDim, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <Select label="Platform" value={platform} onChange={e => setPlatform(e.target.value)} options={["TikTok", "Instagram", "YouTube Shorts", "Facebook Reels"]} />
            <Select label="Niche" value={niche} onChange={e => setNiche(e.target.value)} options={["General", "Fitness", "Finance", "Food", "Travel", "Tech", "Fashion", "Beauty", "Gaming", "Education"]} />
          </div>
          <Btn onClick={generate} style={{ width: "100%", justifyContent: "center" }} variant={loading ? "ghost" : "primary"}>
            {loading ? "⏳ Finding..." : "# Find Hashtags"}
          </Btn>
        </Card>
        <Card>
          <h3 style={{ margin: "0 0 14px", color: COLORS.text, fontSize: 15 }}>📈 Hashtag Strategy</h3>
          {[
            { pct: "20%", label: "Mega Hashtags (1M+)", color: COLORS.accent, tip: "For maximum discovery — but lots of competition" },
            { pct: "40%", label: "Medium Hashtags (100k-1M)", color: COLORS.blue, tip: "Best balance of reach and competition" },
            { pct: "40%", label: "Niche Hashtags (<100k)", color: COLORS.green, tip: "Highly targeted — best for building your audience" },
          ].map(s => (
            <div key={s.label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: COLORS.text, fontWeight: 600 }}>{s.label}</span>
                <Badge color={s.color}>{s.pct}</Badge>
              </div>
              <div style={{ height: 6, background: COLORS.border2, borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
                <div style={{ width: s.pct, height: "100%", background: s.color, borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>{s.tip}</div>
            </div>
          ))}
        </Card>
      </div>
      {loading && <Card style={{ textAlign: "center", padding: 40 }}><div style={{ fontSize: 32, marginBottom: 12 }}>#</div><div style={{ color: COLORS.text, fontSize: 16, fontWeight: 600 }}>Analyzing trending hashtags...</div></Card>}
      {error && <Card style={{ marginTop: 20, border: `1px solid ${COLORS.red}44` }}><div style={{ color: COLORS.red }}>{error}</div></Card>}
      {result && <GeneratedResult title="Recommended Hashtags" content={result} onSave={() => onSave({ type: "Hashtags", content: result, topic, date: new Date().toLocaleDateString() })} />}
    </div>
  );
}

function IdeasPage({ onSave, plan = "free", setPage }) {
  const [niche, setNiche] = useState("");
  const [frequency, setFrequency] = useState("Daily");
  const [platform, setPlatform] = useState("TikTok");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async () => {
    if (!niche.trim()) return;
    setLoading(true); setResult(null); setError(null);
    try {
      const text = await callClaude(`Generate 10 viral video ideas for a ${platform} creator in the ${niche} niche who posts ${frequency.toLowerCase()}. For each idea provide: 1) A catchy title, 2) The hook, 3) Why it'll go viral, 4) Estimated difficulty (Easy/Medium/Hard). Format clearly and make the ideas trending and relevant.`);
      setResult(text);
    } catch (e) { setError("Failed to generate: " + e.message); }
    setLoading(false);
  };

  const ideasTier = TIER_CONFIG[plan] || TIER_CONFIG.free;
  if (!ideasTier.ideas) {
    return (
      <div>
        <PageHeader title="💡 Video Ideas" subtitle="Never run out of content with AI-powered idea generation" />
        <UpgradePrompt feature="Video Ideas" setPage={setPage} />
      </div>
    );
  }
  return (
    <div>
      <PageHeader title="💡 Video Ideas" subtitle="Never run out of content with AI-powered idea generation" />
      <div style={{ ...rGrid(), gap: 16, marginBottom: 20 }}>
        <Card>
          <h3 style={{ margin: "0 0 16px", color: COLORS.text, fontSize: 15 }}>Idea Generator</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, color: COLORS.textDim, marginBottom: 6 }}>Your Niche *</label>
            <input value={niche} onChange={e => setNiche(e.target.value)} placeholder="e.g., Fitness, Finance, Cooking, Travel..." style={{ width: "100%", background: "#141420", border: `1px solid ${COLORS.border2}`, borderRadius: 8, padding: "10px 12px", color: COLORS.textDim, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <Select label="Platform" value={platform} onChange={e => setPlatform(e.target.value)} options={["TikTok", "Instagram", "YouTube Shorts", "Facebook Reels"]} />
            <Select label="Posting Frequency" value={frequency} onChange={e => setFrequency(e.target.value)} options={["Daily", "3x/Week", "Weekly", "Multiple/Day"]} />
          </div>
          <Btn onClick={generate} style={{ width: "100%", justifyContent: "center" }} variant={loading ? "ghost" : "primary"}>
            {loading ? "⏳ Thinking..." : "💡 Generate Ideas"}
          </Btn>
        </Card>
        <Card>
          <h3 style={{ margin: "0 0 14px", color: COLORS.text, fontSize: 15 }}>🔥 Trending Formats</h3>
          {[
            { icon: "📚", name: "Storytime", growth: "+124%", desc: "Personal stories with dramatic reveals" },
            { icon: "🔢", name: "Listicles", growth: "+89%", desc: "Top 5/10 lists in your niche" },
            { icon: "🎭", name: "POV Videos", growth: "+203%", desc: "First-person perspective content" },
            { icon: "❓", name: "Q&A Sessions", growth: "+67%", desc: "Answer audience questions live" },
            { icon: "🧪", name: "Experiments", growth: "+156%", desc: "Test something and share results" },
          ].map(f => (
            <div key={f.name} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${COLORS.border}` }}>
              <span style={{ fontSize: 22 }}>{f.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: COLORS.text, fontSize: 13 }}>{f.name}</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>{f.desc}</div>
              </div>
              <Badge color={COLORS.green}>{f.growth}</Badge>
            </div>
          ))}
        </Card>
      </div>
      {loading && <Card style={{ textAlign: "center", padding: 40 }}><div style={{ fontSize: 32, marginBottom: 12 }}>💡</div><div style={{ color: COLORS.text, fontSize: 16, fontWeight: 600 }}>Brainstorming viral ideas for you...</div></Card>}
      {error && <Card style={{ marginTop: 20, border: `1px solid ${COLORS.red}44` }}><div style={{ color: COLORS.red }}>{error}</div></Card>}
      {result && <GeneratedResult title="Video Ideas" content={result} onSave={() => onSave({ type: "Ideas", content: result, topic: niche, date: new Date().toLocaleDateString() })} />}
    </div>
  );
}

function AnalyticsPage({ plan = "free", setPage }) {
  const stats = [
    { label: "Total Views", value: "248,392", change: "+12.4%", icon: "👁️", color: COLORS.accent },
    { label: "Followers Gained", value: "3,847", change: "+8.2%", icon: "👥", color: COLORS.green },
    { label: "Avg Engagement", value: "6.8%", change: "+2.1%", icon: "❤️", color: "#ef4444" },
    { label: "Scripts Generated", value: "142", change: "+34%", icon: "✏️", color: COLORS.gold },
  ];
  const topContent = [
    { title: "5 Morning Habits", views: "48,203", engagement: "8.2%", type: "Motivational" },
    { title: "How I Made $5k Online", views: "32,841", engagement: "11.4%", type: "Storytime" },
    { title: "Grocery Hacks 2025", views: "28,192", engagement: "7.6%", type: "Listicle" },
    { title: "Stop Doing This at the Gym", views: "21,004", engagement: "9.1%", type: "Controversial" },
    { title: "My Daily Routine (Honest)", views: "18,773", engagement: "6.3%", type: "POV" },
  ];
  const analyticsTier = TIER_CONFIG[plan] || TIER_CONFIG.free;
  if (!analyticsTier.analytics) {
    return (
      <div>
        <PageHeader title="📊 Analytics" subtitle="Track your content performance and growth" />
        <UpgradePrompt feature="Analytics" setPage={setPage} />
      </div>
    );
  }
  return (
    <div>
      <PageHeader title="📊 Analytics" subtitle="Track your content performance and growth" />
      <div style={{ display: "grid", gridTemplateColumns: isMobileScreen() ? "1fr 1fr" : "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map(s => (
          <Card key={s.label}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>{s.icon}</span>
              <Badge color={COLORS.green}>{s.change}</Badge>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.text, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted }}>{s.label}</div>
          </Card>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobileScreen() ? "1fr" : "2fr 1fr", gap: 16, marginBottom: 24 }}>
        <Card>
          <h3 style={{ margin: "0 0 20px", color: COLORS.text, fontSize: 15 }}>📈 Views Over Time (Last 30 Days)</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120 }}>
            {[40,55,45,70,60,80,65,90,75,100,85,110,95,120,105,88,115,130,118,140,125,145,132,160,148,170,155,180,168,190].map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${(h/190)*100}%`, background: i > 25 ? COLORS.accent : COLORS.accentSoft, borderRadius: "3px 3px 0 0", minWidth: 4 }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: COLORS.textMuted }}>
            <span>May 1</span><span>May 10</span><span>May 20</span><span>May 26</span>
          </div>
        </Card>
        <Card>
          <h3 style={{ margin: "0 0 16px", color: COLORS.text, fontSize: 15 }}>🎯 Content Mix</h3>
          {[
            { label: "Scripts", pct: 45, color: COLORS.accent },
            { label: "Hooks", pct: 28, color: COLORS.blue },
            { label: "Ideas", pct: 17, color: COLORS.green },
            { label: "Hashtags", pct: 10, color: COLORS.gold },
          ].map(c => (
            <div key={c.label} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
                <span style={{ color: COLORS.text }}>{c.label}</span>
                <span style={{ color: COLORS.textMuted }}>{c.pct}%</span>
              </div>
              <div style={{ height: 6, background: COLORS.border2, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${c.pct}%`, height: "100%", background: c.color, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </Card>
      </div>
      <Card>
        <h3 style={{ margin: "0 0 16px", color: COLORS.text, fontSize: 15 }}>🏆 Top Performing Content</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              {["Title", "Views", "Engagement", "Type", "Action"].map(h => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 12, color: COLORS.textMuted, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topContent.map((r, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: "12px", color: COLORS.text, fontSize: 14 }}>{r.title}</td>
                <td style={{ padding: "12px", color: COLORS.textDim, fontSize: 14 }}>{r.views}</td>
                <td style={{ padding: "12px" }}><Badge color={parseFloat(r.engagement) > 9 ? COLORS.green : COLORS.accent}>{r.engagement}</Badge></td>
                <td style={{ padding: "12px" }}><Badge color={COLORS.blue}>{r.type}</Badge></td>
                <td style={{ padding: "12px" }}><Btn variant="ghost" small>View</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function SavedPage({ savedItems, onDelete, plan = "free", setPage }) {
  const [filter, setFilter] = useState("All");
  const types = ["All", "Script", "Hooks", "Hashtags", "Ideas"];
  const filtered = filter === "All" ? savedItems : savedItems.filter(s => s.type === filter);
  return (
    <div>
      <PageHeader title="🔖 Saved Items" subtitle={`${savedItems.length} saved pieces of content`} actions={plan === "free" && <div style={{fontSize:12,color:COLORS.textMuted,background:COLORS.card,border:`1px solid ${COLORS.border2}`,borderRadius:8,padding:"5px 10px"}}>{savedItems.length}/{TIER_CONFIG.free.savedLimit} saves used <span onClick={() => setPage("subscription")} style={{color:COLORS.accent,cursor:"pointer",marginLeft:4}}>Upgrade →</span></div>} />
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{ background: filter === t ? COLORS.accent : COLORS.card, border: `1px solid ${filter === t ? COLORS.accent : COLORS.border}`, color: filter === t ? "#fff" : COLORS.textMuted, borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "inherit" }}>
            {t} ({t === "All" ? savedItems.length : savedItems.filter(s => s.type === t).length})
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔖</div>
          <div style={{ color: COLORS.text, fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No saved items yet</div>
          <div style={{ color: COLORS.textMuted, fontSize: 14 }}>Generate content and click "Save" to keep it here</div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {filtered.map((item, i) => (
            <Card key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <Badge color={COLORS.accent}>{item.type}</Badge>
                  <div style={{ marginTop: 8, fontWeight: 600, color: COLORS.text, fontSize: 14 }}>{item.topic}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn variant="ghost" small onClick={() => navigator.clipboard?.writeText(item.content)}>📋</Btn>
                  <Btn variant="danger" small onClick={() => onDelete(i)}>🗑️</Btn>
                </div>
              </div>
              <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.6, maxHeight: 80, overflow: "hidden" }}>{item.content.slice(0, 200)}...</div>
              <div style={{ marginTop: 12, fontSize: 12, color: COLORS.textMuted }}>Saved on {item.date}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function TemplatesPage({ setPage, plan = "free" }) {
  const [selected, setSelected] = useState(null);
  const [cat, setCat] = useState("All");
  const ALL_TEMPLATES = [
    { icon: "🎯", name: "Listicle", category: "Educational", difficulty: "Easy", color: "#e74c3c", desc: "Perfect for tips, tricks, and step-by-step guides", example: "5 Ways to [Achieve Goal] Without [Common Struggle]" },
    { icon: "🧠", name: "Story Time", category: "Entertainment", difficulty: "Medium", color: "#9b59b6", desc: "Share engaging stories that hook your audience", example: "I [Did Something Crazy] and Here's What Happened..." },
    { icon: "✅", name: "How To", category: "Educational", difficulty: "Easy", color: "#27ae60", desc: "Step-by-step tutorials and how-to guides", example: "How to [Achieve Result] in [Timeframe] (Step by Step)" },
    { icon: "⭐", name: "Motivational", category: "Lifestyle", difficulty: "Easy", color: "#f39c12", desc: "Inspire your audience with powerful messages", example: "If You're Struggling With [Problem], Watch This" },
    { icon: "💬", name: "Q&A", category: "Community", difficulty: "Easy", color: "#3498db", desc: "Answer common questions in your niche", example: 'You Asked, I Answered: "How Do I [Common Question]?"' },
    { icon: "🔥", name: "Controversial", category: "Engagement", difficulty: "Hard", color: "#e74c3c", desc: "Hot takes and bold opinions that spark engagement", example: "Unpopular Opinion: [Bold Statement About Your Niche]" },
    { icon: "🎭", name: "Before/After", category: "Transformation", difficulty: "Medium", color: "#8e44ad", desc: "Show transformation journeys compellingly", example: "[Timeframe] [Transformation]: Before vs After" },
    { icon: "🔬", name: "Experiment", category: "Entertainment", difficulty: "Hard", color: "#16a085", desc: "Test something surprising and share results", example: "I Tried [Unusual Method] for [Timeframe]. Here's What Happened" },
    { icon: "📰", name: "News Reaction", category: "Current Events", difficulty: "Easy", color: "#2980b9", desc: "React to trending news in your niche", example: "This Just Happened in [Niche] and It Changes Everything" },
  ];
  const CATS = ["All", "Educational", "Entertainment", "Lifestyle", "Engagement", "Transformation"];
  const filtered = cat === "All" ? ALL_TEMPLATES : ALL_TEMPLATES.filter(t => t.category === cat);
  const templatesTier = TIER_CONFIG[plan] || TIER_CONFIG.free;
  if (!templatesTier.templates) {
    return (
      <div>
        <PageHeader title="⊟ Templates" subtitle="Pre-built frameworks for viral content" />
        <UpgradePrompt feature="Templates" setPage={setPage} />
      </div>
    );
  }
  return (
    <div>
      <PageHeader title="⊟ Templates" subtitle="Pre-built frameworks for viral content" />
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{ background: cat === c ? COLORS.accent : COLORS.card, border: `1px solid ${cat === c ? COLORS.accent : COLORS.border}`, color: cat === c ? "#fff" : COLORS.textMuted, borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "inherit" }}>{c}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobileScreen() ? "1fr" : "repeat(3, 1fr)", gap: 16 }}>
        {filtered.map(t => (
          <Card key={t.name} style={{ cursor: "pointer", border: `1px solid ${selected?.name === t.name ? COLORS.accent : COLORS.border}` }} onClick={() => setSelected(selected?.name === t.name ? null : t)}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: t.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{t.icon}</div>
              <div>
                <div style={{ fontWeight: 700, color: COLORS.text, fontSize: 15 }}>{t.name}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  <Badge color={COLORS.accent}>{t.category}</Badge>
                  <Badge color={t.difficulty === "Easy" ? COLORS.green : t.difficulty === "Medium" ? COLORS.gold : COLORS.red}>{t.difficulty}</Badge>
                </div>
              </div>
            </div>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: COLORS.textMuted, lineHeight: 1.5 }}>{t.desc}</p>
            <div style={{ background: "#141420", borderRadius: 6, padding: "8px 10px", fontSize: 12, color: COLORS.textDim, fontStyle: "italic", marginBottom: 14 }}>"{t.example}"</div>
            <Btn onClick={(e) => { e.stopPropagation(); setPage("scripts"); }} style={{ width: "100%", justifyContent: "center" }}>Use Template</Btn>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProfilePage({ user = {}, onLogout, plan = "free" }) {
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [username, setUsername] = useState("@" + (user.name || "user").toLowerCase().replace(/\s+/g, ""));
  const [bio, setBio] = useState("Content creator powered by ReelZAI.");
  const [saved, setSaved] = useState(false);
  return (
    <div>
      <PageHeader title="👤 Profile" subtitle="Manage your account information" />
      <div style={{ display: "grid", gridTemplateColumns: isMobileScreen() ? "1fr" : "1fr 2fr", gap: 20 }}>
        <div>
          <Card style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #f59e0b, #ef4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 14px" }}>👤</div>
            <div style={{ fontWeight: 700, color: COLORS.text, fontSize: 16, marginBottom: 4 }}>{name}</div>
            <div style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 12 }}>{username}</div>
            <Badge color={(TIER_CONFIG[plan] || TIER_CONFIG.free).color}>{(TIER_CONFIG[plan] || TIER_CONFIG.free).icon} {(TIER_CONFIG[plan] || TIER_CONFIG.free).label} Plan</Badge>
          </Card>
          <Card>
            <h3 style={{ margin: "0 0 14px", color: COLORS.text, fontSize: 14 }}>📊 Stats</h3>
            {[{ label: "Scripts Generated", value: "142" }, { label: "Hooks Created", value: "89" }, { label: "Hashtag Sets", value: "234" }, { label: "Ideas Generated", value: "67" }].map(s => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ fontSize: 13, color: COLORS.textMuted }}>{s.label}</span>
                <span style={{ fontSize: 13, color: COLORS.text, fontWeight: 600 }}>{s.value}</span>
              </div>
            ))}
          </Card>
        </div>
        <Card>
          <h3 style={{ margin: "0 0 20px", color: COLORS.text, fontSize: 15 }}>Personal Information</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
            <Input label="Username" value={username} onChange={e => setUsername(e.target.value)} placeholder="@username" />
          </div>
          <Input label="Email Address" value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="your@email.com" />
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, color: COLORS.textDim, marginBottom: 6 }}>Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} style={{ width: "100%", minHeight: 80, background: "#141420", border: `1px solid ${COLORS.border2}`, borderRadius: 8, padding: "10px 12px", color: COLORS.textDim, fontSize: 14, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Btn onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>{saved ? "✓ Saved!" : "💾 Save Changes"}</Btn>
            <Btn variant="danger" onClick={onLogout}>🚪 Sign Out</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SubscriptionPage({ onAddCredits, currentPlan = "free", onUpgrade }) {
  const [billing, setBilling] = useState("monthly");
  const [bought, setBought] = useState(null);
  const plans = [
    { id: "starter", name: "Starter", price: { monthly: 9, yearly: 7 }, credits: "500", features: ["500 credits/mo", "Script Generator", "Hook Generator", "Hashtag Finder", "Video Ideas", "Email Support"], color: COLORS.blue },
    { id: "pro", name: "Pro", price: { monthly: 29, yearly: 23 }, credits: "5,000", features: ["5,000 credits/mo", "All generators", "Analytics Dashboard", "Priority Support", "Custom Templates"], color: COLORS.accent, popular: true },
    { id: "agency", name: "Agency", price: { monthly: 79, yearly: 63 }, credits: "Unlimited", features: ["Unlimited credits", "Everything in Pro", "Team Collaboration", "White Label", "Dedicated Support", "API Access"], color: COLORS.gold },
  ];
  const CREDIT_PACKS = [
    { label: "Starter Pack", credits: 100, price: 4.99, icon: "⚡", color: COLORS.blue, bonus: "" },
    { label: "Creator Pack", credits: 300, price: 11.99, icon: "🔥", color: COLORS.accent, bonus: "Save 20%" },
    { label: "Pro Pack", credits: 750, price: 24.99, icon: "💎", color: COLORS.gold, bonus: "Best Value" },
  ];

  const handleBuyPack = (pack) => {
    onAddCredits(pack.credits);
    setBought(pack.label);
    setTimeout(() => setBought(null), 3000);
  };

  return (
    <div>
      <PageHeader title="💳 Subscription & Credits" subtitle="Top up credits or choose a plan that fits your needs" />

      {/* One-time credit packs */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 20 }}>⚡</span>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: COLORS.text }}>Buy Credits</h2>
          <span style={{ fontSize: 12, color: COLORS.textMuted, marginLeft: 4 }}>One-time top-up, no subscription needed</span>
        </div>
        {bought && (
          <div style={{ background: "#10b98115", border: "1px solid #10b98133", borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, color: "#10b981", fontWeight: 600, fontSize: 14 }}>
            ✅ {bought} purchased! Credits added to your account.
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: isMobileScreen() ? "1fr" : "repeat(3, 1fr)", gap: 16 }}>
          {CREDIT_PACKS.map(pack => (
            <div key={pack.label} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 24, position: "relative", display: "flex", flexDirection: "column", gap: 12 }}>
              {pack.bonus && (
                <div style={{ position: "absolute", top: -10, right: 16, background: pack.color, color: "#fff", borderRadius: 6, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{pack.bonus}</div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: pack.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{pack.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, color: COLORS.text, fontSize: 15 }}>{pack.label}</div>
                  <div style={{ color: pack.color, fontWeight: 800, fontSize: 22 }}>{pack.credits} <span style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: 500 }}>credits</span></div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>~{Math.round(pack.credits / 10)} scripts or {pack.credits} hook sets</div>
              <Btn onClick={() => handleBuyPack(pack)} style={{ justifyContent: "center", background: pack.color, border: "none", color: "#fff" }}>
                Buy for ${pack.price}
              </Btn>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription plans */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>👑</span>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: COLORS.text }}>Monthly Plans</h2>
        <span style={{ fontSize: 12, color: COLORS.textMuted, marginLeft: 4 }}>Recurring credits every month</span>
      </div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ display: "inline-flex", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 4, gap: 4 }}>
          {["monthly", "yearly"].map(b => (
            <button key={b} onClick={() => setBilling(b)} style={{ background: billing === b ? COLORS.accent : "transparent", border: "none", color: billing === b ? "#fff" : COLORS.textMuted, borderRadius: 7, padding: "7px 20px", cursor: "pointer", fontWeight: 600, fontSize: 14, fontFamily: "inherit" }}>
              {b === "yearly" ? "Yearly (Save 20%)" : "Monthly"}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobileScreen() ? "1fr" : "repeat(3, 1fr)", gap: 20 }}>
        {plans.map(plan => (
          <div key={plan.name} style={{ background: COLORS.card, border: `2px solid ${plan.popular ? plan.color : COLORS.border}`, borderRadius: 14, padding: 24, position: "relative", transform: plan.popular ? "scale(1.02)" : "scale(1)" }}>
            {plan.popular && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: plan.color, color: "#fff", borderRadius: 6, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>MOST POPULAR</div>}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, color: COLORS.text, fontSize: 18, marginBottom: 4 }}>{plan.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: plan.color }}>${plan.price[billing]}</span>
                <span style={{ color: COLORS.textMuted, fontSize: 13 }}>/month</span>
              </div>
              <div style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 4 }}>{plan.credits} credits/month</div>
            </div>
            <div style={{ marginBottom: 20 }}>
              {plan.features.map(f => (
                <div key={f} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, color: COLORS.textDim }}>
                  <span style={{ color: COLORS.green }}>✓</span>{f}
                </div>
              ))}
            </div>
            <Btn onClick={() => { if (plan.id !== currentPlan) onUpgrade(plan.id); }} style={{ width: "100%", justifyContent: "center", background: plan.id === currentPlan ? "transparent" : (plan.popular ? plan.color : "transparent"), border: `1px solid ${plan.id === currentPlan ? COLORS.green : plan.color}`, color: plan.id === currentPlan ? COLORS.green : (plan.popular ? "#fff" : plan.color) }}>
              {plan.id === currentPlan ? "✓ Current Plan" : "Upgrade"}
            </Btn>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPage() {
  const [settings, setSettings] = useState({ emailNotifs: true, pushNotifs: false, weeklyReport: true, darkMode: true, autoSave: true });
  const [saved, setSaved] = useState(false);
  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));
  const Toggle = ({ label, desc, settingKey }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${COLORS.border}` }}>
      <div>
        <div style={{ fontWeight: 600, color: COLORS.text, fontSize: 14 }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{desc}</div>}
      </div>
      <div onClick={() => toggle(settingKey)} style={{ width: 44, height: 24, borderRadius: 12, cursor: "pointer", background: settings[settingKey] ? COLORS.accent : COLORS.border2, position: "relative", transition: "background 0.2s" }}>
        <div style={{ position: "absolute", top: 2, left: settings[settingKey] ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
      </div>
    </div>
  );
  return (
    <div>
      <PageHeader title="⚙️ Settings" subtitle="Customize your ReelZAI experience" />
      <div style={{ ...rGrid(), gap: 20 }}>
        <Card>
          <h3 style={{ margin: "0 0 4px", color: COLORS.text, fontSize: 15 }}>🔔 Notifications</h3>
          <Toggle label="Email Notifications" desc="Receive updates via email" settingKey="emailNotifs" />
          <Toggle label="Push Notifications" desc="Browser push notifications" settingKey="pushNotifs" />
          <Toggle label="Weekly Report" desc="Get a weekly performance summary" settingKey="weeklyReport" />
        </Card>
        <Card>
          <h3 style={{ margin: "0 0 4px", color: COLORS.text, fontSize: 15 }}>🎨 Appearance</h3>
          <Toggle label="Dark Mode" desc="Use dark theme (recommended)" settingKey="darkMode" />
          <Toggle label="Auto Save" desc="Automatically save generated content" settingKey="autoSave" />
        </Card>
      </div>
      <div style={{ marginTop: 20 }}>
        <Btn onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>{saved ? "✓ Saved!" : "💾 Save Settings"}</Btn>
      </div>
    </div>
  );
}


const MOBILE_NAV = [
  { id: "dashboard", icon: "⊞", label: "Home" },
  { id: "scripts", icon: "📄", label: "Scripts" },
  { id: "hooks", icon: "🪝", label: "Hooks" },
  { id: "hashtags", icon: "#", label: "Tags" },
  { id: "ideas", icon: "💡", label: "Ideas" },
];

function MobileBottomNav({ page, setPage }) {
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: COLORS.sidebar, borderTop: `1px solid ${COLORS.border}`, display: "flex", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom)" }}>
      {MOBILE_NAV.map(item => (
        <div key={item.id} onClick={() => setPage(item.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px 4px 8px", cursor: "pointer", color: page === item.id ? COLORS.accent : COLORS.textMuted, borderTop: page === item.id ? `2px solid ${COLORS.accent}` : "2px solid transparent" }}>
          <span style={{ fontSize: 20, marginBottom: 2 }}>{item.icon}</span>
          <span style={{ fontSize: 10, fontWeight: 600 }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function PlanSelectScreen({ onSelect }) {
  const plans = [
    {
      id: "free",
      icon: "🆓",
      name: "Free",
      price: "£0",
      sub: "forever",
      color: COLORS.green,
      desc: "Get started with the basics",
      features: ["50 credits to start", "Script Generator", "Hook Generator", "Limited saves (5)"],
      locked: ["Hashtag Finder", "Video Ideas", "Analytics", "Templates"],
      cta: "Continue Free",
      ghost: true,
    },
    {
      id: "starter",
      icon: "⚡",
      name: "Starter",
      price: "£9",
      sub: "/month",
      color: COLORS.blue,
      desc: "Perfect for solo creators",
      features: ["500 credits/month", "All generators", "Hashtag Finder", "Video Ideas", "Email Support"],
      locked: [],
      cta: "Get Starter",
      ghost: false,
    },
    {
      id: "pro",
      icon: "👑",
      name: "Pro",
      price: "£29",
      sub: "/month",
      color: COLORS.accent,
      desc: "For serious content creators",
      features: ["5,000 credits/month", "Everything in Starter", "Analytics Dashboard", "Priority Support", "Custom Templates"],
      locked: [],
      cta: "Get Pro",
      ghost: false,
      popular: true,
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 860 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 12px" }}>🎬</div>
          <div style={{ fontWeight: 800, fontSize: 26, color: "#fff" }}>Reel<span style={{ color: COLORS.accent }}>ZAI</span></div>
          <div style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 6 }}>Choose your plan to get started</div>
          <div style={{ display: "inline-block", marginTop: 10, background: COLORS.accentSoft, border: `1px solid ${COLORS.accent}44`, borderRadius: 8, padding: "4px 14px", fontSize: 12, color: COLORS.accent, fontWeight: 600 }}>
            🎉 Account created! Pick a plan below
          </div>
        </div>

        {/* Plan cards */}
        <div style={{ display: "grid", gridTemplateColumns: isMobileScreen() ? "1fr" : "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          {plans.map(plan => (
            <div key={plan.id} style={{ background: COLORS.card, border: `2px solid ${plan.popular ? plan.color : COLORS.border}`, borderRadius: 16, padding: 24, position: "relative", display: "flex", flexDirection: "column" }}>
              {plan.popular && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: plan.color, color: "#fff", borderRadius: 6, padding: "3px 14px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>MOST POPULAR</div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: plan.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{plan.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, color: COLORS.text, fontSize: 16 }}>{plan.name}</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted }}>{plan.desc}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 16 }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: plan.color }}>{plan.price}</span>
                <span style={{ fontSize: 13, color: COLORS.textMuted }}>{plan.sub}</span>
              </div>
              <div style={{ flex: 1, marginBottom: 20 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", gap: 8, marginBottom: 7, fontSize: 13, color: COLORS.textDim }}>
                    <span style={{ color: COLORS.green, flexShrink: 0 }}>✓</span>{f}
                  </div>
                ))}
                {plan.locked.map(f => (
                  <div key={f} style={{ display: "flex", gap: 8, marginBottom: 7, fontSize: 13, color: COLORS.textMuted, opacity: 0.5 }}>
                    <span style={{ flexShrink: 0 }}>🔒</span>{f}
                  </div>
                ))}
              </div>
              <button onClick={() => onSelect(plan.id)} style={{ width: "100%", padding: "12px 0", background: plan.ghost ? "transparent" : plan.color, border: `2px solid ${plan.color}`, color: plan.ghost ? plan.color : "#fff", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
              >{plan.cta}</button>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", fontSize: 12, color: COLORS.textMuted }}>
          You can upgrade at any time from your account settings · No credit card required for Free plan
        </div>
      </div>
    </div>
  );
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Simple in-memory "user store" using localStorage
  const handleSubmit = () => {
    setError("");
    if (!email.trim() || !password.trim()) { setError("Please fill in all fields."); return; }
    if (mode === "signup" && !name.trim()) { setError("Please enter your name."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    setTimeout(() => {
      try {
        const users = JSON.parse(localStorage.getItem("reelzai_users") || "{}");
        if (mode === "signup") {
          if (users[email]) { setError("An account with this email already exists."); setLoading(false); return; }
          users[email] = { name, password, credits: 50, plan: "free" };
          localStorage.setItem("reelzai_users", JSON.stringify(users));
          const session = { email, name, credits: 50, plan: "free", newSignup: true };
          localStorage.setItem("reelzai_session", JSON.stringify(session));
          onAuth(session);
        } else {
          if (!users[email] || users[email].password !== password) { setError("Incorrect email or password."); setLoading(false); return; }
          const credits = users[email].credits ?? 50;
          const plan = users[email].plan ?? "free";
          const session = { email, name: users[email].name, credits, plan };
          localStorage.setItem("reelzai_session", JSON.stringify(session));
          onAuth(session);
        }
      } catch (e) {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
    }, 600);
  };

  const inputStyle = {
    width: "100%", background: "#141420", border: `1px solid ${COLORS.border2}`,
    borderRadius: 10, padding: "12px 14px", color: COLORS.text, fontSize: 15,
    outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 14,
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 14px" }}>🎬</div>
          <div style={{ fontWeight: 800, fontSize: 28, color: "#fff" }}>Reel<span style={{ color: COLORS.accent }}>ZAI</span></div>
          <div style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 4 }}>AI-Powered Viral Reels</div>
        </div>

        {/* Card */}
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: 32 }}>
          {/* Tabs */}
          <div style={{ display: "flex", background: "#141420", borderRadius: 10, padding: 4, marginBottom: 28, gap: 4 }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{ flex: 1, background: mode === m ? COLORS.accent : "transparent", border: "none", color: mode === m ? "#fff" : COLORS.textMuted, borderRadius: 8, padding: "9px 0", cursor: "pointer", fontWeight: 600, fontSize: 14, fontFamily: "inherit", transition: "all 0.15s" }}>
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          {mode === "signup" && (
            <div style={{ background: "#10b98115", border: "1px solid #10b98133", borderRadius: 10, padding: "10px 14px", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>🎁</span>
              <div>
                <div style={{ fontWeight: 700, color: "#10b981", fontSize: 13 }}>50 Free Credits on Sign Up</div>
                <div style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 1 }}>No credit card required — start creating immediately</div>
              </div>
            </div>
          )}
          {mode === "signup" && (
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" style={inputStyle}
              onFocus={e => e.target.style.borderColor = COLORS.accent}
              onBlur={e => e.target.style.borderColor = COLORS.border2} />
          )}
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email" style={inputStyle}
            onFocus={e => e.target.style.borderColor = COLORS.accent}
            onBlur={e => e.target.style.borderColor = COLORS.border2} />
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" style={{ ...inputStyle, marginBottom: 6 }}
            onFocus={e => e.target.style.borderColor = COLORS.accent}
            onBlur={e => e.target.style.borderColor = COLORS.border2}
            onKeyDown={e => e.key === "Enter" && handleSubmit()} />

          {error && <div style={{ color: COLORS.red, fontSize: 13, marginBottom: 14, padding: "8px 12px", background: "#ef444411", borderRadius: 8, border: "1px solid #ef444433" }}>{error}</div>}

          <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", background: COLORS.accent, border: "none", color: "#fff", borderRadius: 10, padding: "13px 0", fontWeight: 700, fontSize: 16, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: loading ? 0.7 : 1, marginTop: 8, transition: "opacity 0.15s" }}>
            {loading ? "⏳ Please wait..." : mode === "login" ? "🚀 Log In" : "✨ Create Account"}
          </button>

          {mode === "login" && (
            <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: COLORS.textMuted }}>
              Don't have an account?{" "}
              <span onClick={() => { setMode("signup"); setError(""); }} style={{ color: COLORS.accent, cursor: "pointer", fontWeight: 600 }}>Sign up free</span>
            </div>
          )}
          {mode === "signup" && (
            <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: COLORS.textMuted }}>
              Already have an account?{" "}
              <span onClick={() => { setMode("login"); setError(""); }} style={{ color: COLORS.accent, cursor: "pointer", fontWeight: 600 }}>Log in</span>
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: COLORS.textMuted }}>
          By continuing, you agree to our Terms of Service
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("reelzai_session")); } catch { return null; }
  });
  const [page, setPage] = useState("dashboard");
  const [credits, setCredits] = useState(() => {
    try {
      const session = JSON.parse(localStorage.getItem("reelzai_session"));
      return session?.credits ?? 50;
    } catch { return 50; }
  });
  const [plan, setPlan] = useState(() => {
    try {
      const session = JSON.parse(localStorage.getItem("reelzai_session"));
      return session?.plan ?? "free";
    } catch { return "free"; }
  });
  const [showPlanSelect, setShowPlanSelect] = useState(() => {
    try {
      const session = JSON.parse(localStorage.getItem("reelzai_session"));
      return session?.newSignup === true;
    } catch { return false; }
  });
  const [savedItems, setSavedItems] = useState([]);
  const [collapsed, setCollapsed] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);

  useEffect(() => {
    const handler = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Persist credits and plan to localStorage whenever they change
  useEffect(() => {
    if (!user) return;
    try {
      const session = JSON.parse(localStorage.getItem("reelzai_session") || "{}");
      session.credits = credits;
      session.plan = plan;
      session.newSignup = false;
      localStorage.setItem("reelzai_session", JSON.stringify(session));
      const users = JSON.parse(localStorage.getItem("reelzai_users") || "{}");
      if (users[user.email]) {
        users[user.email].credits = credits;
        users[user.email].plan = plan;
        localStorage.setItem("reelzai_users", JSON.stringify(users));
      }
    } catch {}
  }, [credits, plan, user]);

  const isMobile = windowWidth < 768;

  if (!user) return <AuthScreen onAuth={(u) => { setUser(u); setCredits(u.credits ?? 50); setPlan(u.plan ?? "free"); setShowPlanSelect(u.newSignup === true); }} />;

  if (showPlanSelect) return <PlanSelectScreen onSelect={(selectedPlan) => {
    setPlan(selectedPlan);
    setShowPlanSelect(false);
    const tier = TIER_CONFIG[selectedPlan] || TIER_CONFIG.free;
    setCredits(tier.credits);
    // persist
    try {
      const session = JSON.parse(localStorage.getItem("reelzai_session") || "{}");
      session.plan = selectedPlan; session.credits = tier.credits;
      localStorage.setItem("reelzai_session", JSON.stringify(session));
      const users = JSON.parse(localStorage.getItem("reelzai_users") || "{}");
      if (session.email && users[session.email]) { users[session.email].plan = selectedPlan; users[session.email].credits = tier.credits; localStorage.setItem("reelzai_users", JSON.stringify(users)); }
    } catch {}
  }} />;

  const handleLogout = () => {
    localStorage.removeItem("reelzai_session");
    setUser(null);
    setPlan("free");
    setShowPlanSelect(false);
  };

  const handleSave = (item) => {
    const tier = TIER_CONFIG[plan] || TIER_CONFIG.free;
    setSavedItems(prev => {
      if (prev.length >= tier.savedLimit) {
        alert(`You've reached the ${tier.savedLimit}-item save limit on the ${tier.label} plan. Upgrade to save more.`);
        return prev;
      }
      return [item, ...prev];
    });
    setCredits(c => Math.max(0, c - 10));
  };
  const handleDelete = (i) => setSavedItems(prev => prev.filter((_, idx) => idx !== i));

  const handleAddCredits = (amount) => {
    setCredits(c => c + amount);
  };

  const pages = {
    dashboard: <DashboardPage setPage={setPage} savedItems={savedItems} plan={plan} />,
    scripts: <ScriptsPage onSave={handleSave} plan={plan} setPage={setPage} />,
    hooks: <HooksPage onSave={handleSave} plan={plan} setPage={setPage} />,
    hashtags: <HashtagsPage onSave={handleSave} plan={plan} setPage={setPage} />,
    ideas: <IdeasPage onSave={handleSave} plan={plan} setPage={setPage} />,
    analytics: <AnalyticsPage plan={plan} setPage={setPage} />,
    saved: <SavedPage savedItems={savedItems} onDelete={handleDelete} plan={plan} setPage={setPage} />,
    templates: <TemplatesPage setPage={setPage} plan={plan} />,
    profile: <ProfilePage user={user} onLogout={handleLogout} plan={plan} />,
    subscription: <SubscriptionPage onAddCredits={handleAddCredits} currentPlan={plan} onUpgrade={(p) => setPlan(p)} />,
    settings: <SettingsPage />,
  };

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Segoe UI', sans-serif", overflow: "hidden" }}>
        <div style={{ background: COLORS.sidebar, borderBottom: `1px solid ${COLORS.border}`, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🎬</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>Reel<span style={{ color: COLORS.accent }}>ZAI</span></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div onClick={() => setPage("subscription")} style={{ background: COLORS.card, border: `1px solid ${COLORS.border2}`, borderRadius: 8, padding: "5px 10px", fontSize: 13, color: COLORS.text, cursor: "pointer" }}>
              <span style={{ color: COLORS.gold }}>⚡</span> {credits.toLocaleString()}
            </div>
            <div onClick={() => setPage("profile")} style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #f59e0b, #ef4444)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👤</div>
            <div onClick={handleLogout} title="Sign Out" style={{ width: 32, height: 32, borderRadius: 8, background: "#ef444422", border: "1px solid #ef444433", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🚪</div>
          </div>
        </div>
        <main style={{ flex: 1, overflowY: "auto", padding: "16px", paddingBottom: "80px" }}>
          {pages[page] || pages.dashboard}
        </main>
        <MobileBottomNav page={page} setPage={setPage} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Segoe UI', sans-serif", overflow: "hidden" }}>
      <Sidebar page={page} setPage={setPage} credits={credits} collapsed={collapsed} setCollapsed={setCollapsed} onLogout={handleLogout} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar credits={credits} setPage={setPage} setCollapsed={setCollapsed} />
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
          {pages[page] || pages.dashboard}
        </main>
      </div>
    </div>
  );
}
