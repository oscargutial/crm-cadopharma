import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { COLORS, REPRESENTANTES, S, SEED_MEDICOS, SEED_MUESTRAS } from './constants';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Medicos from './components/Medicos';
import Visitas from './components/Visitas';
import Muestras from './components/Muestras';
import Calendario from './components/Calendario';
import Reportes from './components/Reportes';

const MENU = [
  { id: "dashboard", icon: "⬛", label: "Dashboard" },
  { id: "medicos", icon: "👥", label: "Médicos" },
  { id: "visitas", icon: "📋", label: "Visitas" },
  { id: "muestras", icon: "💊", label: "Muestras" },
  { id: "calendario", icon: "📅", label: "Calendario" },
  { id: "reportes", icon: "📊", label: "Reportes" },
];

const TAB_TITLES = {
  dashboard: "Dashboard general", medicos: "Gestión de médicos",
  visitas: "Registro de visitas", muestras: "Control de muestras",
  calendario: "Calendario de rutas", reportes: "Reportes y KPIs",
};

export default function App() {
  const [usuario, setUsuario] = useState(() => localStorage.getItem("crm_usuario") || null);
  const [tab, setTab] = useState("dashboard");
  const [medicos, setMedicos] = useState([]);
  const [visitas, setVisitas] = useState([]);
  const [muestras, setMuestras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncMsg, setSyncMsg] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── CARGA INICIAL ──────────────────────────────────────────────────────────
  const cargarDatos = useCallback(async () => {
    const [{ data: m }, { data: v }, { data: mu }] = await Promise.all([
      supabase.from("medicos").select("*").order("nombre"),
      supabase.from("visitas").select("*").order("fecha", { ascending: false }),
      supabase.from("muestras").select("*").order("producto"),
    ]);
    if (m) setMedicos(m);
    if (v) setVisitas(v);
    if (mu) setMuestras(mu);
    setLoading(false);
  }, []);

  useEffect(() => {
    cargarDatos();

    // Suscripción en tiempo real
    const canal = supabase
      .channel("crm-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "medicos" }, () => cargarDatos())
      .on("postgres_changes", { event: "*", schema: "public", table: "visitas" }, () => cargarDatos())
      .on("postgres_changes", { event: "*", schema: "public", table: "muestras" }, () => cargarDatos())
      .subscribe();

    return () => supabase.removeChannel(canal);
  }, [cargarDatos]);

  const showSync = (msg = "✓ Guardado") => {
    setSyncMsg(msg);
    setTimeout(() => setSyncMsg(""), 2000);
  };

  // ── HANDLERS MÉDICOS ───────────────────────────────────────────────────────
  const addMedico = async (data) => {
    const { error } = await supabase.from("medicos").insert([data]);
    if (!error) { showSync("✓ Médico guardado"); await cargarDatos(); }
  };
  const updateMedico = async (id, data) => {
    const { error } = await supabase.from("medicos").update(data).eq("id", id);
    if (!error) { showSync("✓ Médico actualizado"); await cargarDatos(); }
  };
  const deleteMedico = async (id) => {
    const { error } = await supabase.from("medicos").delete().eq("id", id);
    if (!error) { showSync("✓ Eliminado"); await cargarDatos(); }
  };

  // ── HANDLERS VISITAS ───────────────────────────────────────────────────────
  const addVisita = async (data) => {
    const { error } = await supabase.from("visitas").insert([data]);
    if (!error) { showSync("✓ Visita registrada"); await cargarDatos(); }
  };
  const updateVisita = async (id, data) => {
    const { error } = await supabase.from("visitas").update(data).eq("id", id);
    if (!error) { showSync("✓ Visita actualizada"); await cargarDatos(); }
  };
  const deleteVisita = async (id) => {
    const { error } = await supabase.from("visitas").delete().eq("id", id);
    if (!error) { showSync("✓ Eliminada"); await cargarDatos(); }
  };

  // ── HANDLERS MUESTRAS ──────────────────────────────────────────────────────
  const addMuestra = async (data) => {
    const { error } = await supabase.from("muestras").insert([data]);
    if (!error) { showSync("✓ Producto guardado"); await cargarDatos(); }
  };
  const updateMuestra = async (id, data) => {
    const { error } = await supabase.from("muestras").update(data).eq("id", id);
    if (!error) { showSync("✓ Stock actualizado"); await cargarDatos(); }
  };

  // ── LOGIN / LOGOUT ─────────────────────────────────────────────────────────
  const handleLogin = (nombre) => {
    localStorage.setItem("crm_usuario", nombre);
    setUsuario(nombre);
  };
  const handleLogout = () => {
    localStorage.removeItem("crm_usuario");
    setUsuario(null);
  };

  if (!usuario) return <Login onLogin={handleLogin} />;

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.navy }}>
        <div style={{ color: COLORS.white, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💊</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Cargando CRM Cadopharma…</div>
          <div style={{ fontSize: 12, color: COLORS.teal, marginTop: 6 }}>Conectando con la base de datos</div>
        </div>
      </div>
    );
  }

  const stockCritico = muestras.filter(m => m.stock <= m.unidad_minima).length;

  return (
    <div style={S.app}>
      {/* Overlay móvil */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 99, display: "none" }} className="mobile-overlay" />
      )}

      {/* Sidebar */}
      <div style={{ ...S.sidebar, position: window.innerWidth < 768 ? "fixed" : "relative", left: window.innerWidth < 768 ? (sidebarOpen ? 0 : -220) : 0, top: 0, height: "100vh", zIndex: 100, transition: "left .25s" }}>
        <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ color: COLORS.white, fontSize: 15, fontWeight: 700 }}>💊 CRM Cadopharma</div>
          <div style={{ color: COLORS.teal, fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>Visita Médica · Oncología</div>
        </div>
        <nav style={S.nav}>
          {MENU.map(item => (
            <div key={item.id} style={S.navItem(tab === item.id, COLORS)} onClick={() => { setTab(item.id); setSidebarOpen(false); }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Sesión activa</div>
          <div style={{ fontSize: 13, color: COLORS.tealLight, fontWeight: 700 }}>👤 {usuario}</div>
          <button onClick={handleLogout} style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.4)", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
            Cambiar usuario →
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={S.main}>
        <div style={S.topbar}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setSidebarOpen(o => !o)} style={{ ...S.btn("ghost"), padding: "6px 10px", display: window.innerWidth < 768 ? "block" : "none" }}>☰</button>
            <span style={{ fontSize: 17, fontWeight: 700 }}>{TAB_TITLES[tab]}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {syncMsg && <span style={{ fontSize: 11, color: COLORS.teal, fontWeight: 600 }}>{syncMsg}</span>}
            <span style={{ fontSize: 12, color: COLORS.slateLight }}>
              {medicos.length} médicos · {visitas.length} visitas
              {stockCritico > 0 ? ` · ⚠️ ${stockCritico} alertas` : " · ✓ OK"}
            </span>
          </div>
        </div>

        <div style={S.content}>
          {tab === "dashboard" && <Dashboard medicos={medicos} visitas={visitas} muestras={muestras} usuario={usuario} />}
          {tab === "medicos" && <Medicos medicos={medicos} onAdd={addMedico} onUpdate={updateMedico} onDelete={deleteMedico} visitas={visitas} />}
          {tab === "visitas" && <Visitas visitas={visitas} medicos={medicos} onAdd={addVisita} onUpdate={updateVisita} onDelete={deleteVisita} usuario={usuario} />}
          {tab === "muestras" && <Muestras muestras={muestras} onAdd={addMuestra} onUpdate={updateMuestra} />}
          {tab === "calendario" && <Calendario visitas={visitas} medicos={medicos} />}
          {tab === "reportes" && <Reportes visitas={visitas} medicos={medicos} muestras={muestras} />}
        </div>
      </div>
    </div>
  );
}
