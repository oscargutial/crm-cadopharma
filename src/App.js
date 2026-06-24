import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { COLORS, S, ADMIN_USUARIO } from './constants';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Medicos from './components/Medicos';
import Visitas from './components/Visitas';
import Muestras from './components/Muestras';
import Calendario from './components/Calendario';
import Reportes from './components/Reportes';
import Recordatorios from './components/Recordatorios';
import Cumpleanos from './components/Cumpleanos';

const MENU = [
  { id: "dashboard", icon: "⬛", label: "Dashboard" },
  { id: "medicos", icon: "👥", label: "Médicos" },
  { id: "visitas", icon: "📋", label: "Visitas" },
  { id: "muestras", icon: "💊", label: "Muestras" },
  { id: "calendario", icon: "📅", label: "Calendario" },
  { id: "recordatorios", icon: "🔔", label: "Recordatorios" },
  { id: "cumpleanos", icon: "🎂", label: "Cumpleaños" },
  { id: "reportes", icon: "📊", label: "Reportes" },
];

const TAB_TITLES = {
  dashboard: "Dashboard general", medicos: "Gestión de médicos",
  visitas: "Registro de visitas", muestras: "Control de muestras",
  calendario: "Calendario de rutas", reportes: "Reportes y KPIs",
  recordatorios: "Recordatorios", cumpleanos: "Cumpleaños de médicos",
};

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [medicos, setMedicos] = useState([]);
  const [visitas, setVisitas] = useState([]);
  const [muestras, setMuestras] = useState([]);
  const [recordatorios, setRecordatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncMsg, setSyncMsg] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const esAdmin = usuario === ADMIN_USUARIO;

  const cargarDatos = useCallback(async () => {
    const [{ data: m }, { data: v }, { data: mu }, { data: r }] = await Promise.all([
      supabase.from("medicos").select("*").order("nombre"),
      supabase.from("visitas").select("*").order("fecha", { ascending: false }),
      supabase.from("muestras").select("*").order("producto"),
      supabase.from("recordatorios").select("*").order("fecha"),
    ]);
    if (m) setMedicos(m);
    if (v) setVisitas(v);
    if (mu) setMuestras(mu);
    if (r) setRecordatorios(r);
    setLoading(false);
  }, []);

  useEffect(() => {
    cargarDatos();
    const canal = supabase.channel("crm-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "medicos" }, cargarDatos)
      .on("postgres_changes", { event: "*", schema: "public", table: "visitas" }, cargarDatos)
      .on("postgres_changes", { event: "*", schema: "public", table: "muestras" }, cargarDatos)
      .on("postgres_changes", { event: "*", schema: "public", table: "recordatorios" }, cargarDatos)
      .subscribe();
    return () => supabase.removeChannel(canal);
  }, [cargarDatos]);

  const showSync = (msg = "✓ Guardado") => { setSyncMsg(msg); setTimeout(() => setSyncMsg(""), 2000); };

  // MÉDICOS
  const addMedico = async (data) => { await supabase.from("medicos").insert([data]); showSync("✓ Médico guardado"); await cargarDatos(); };
  const updateMedico = async (id, data) => { await supabase.from("medicos").update(data).eq("id", id); showSync("✓ Actualizado"); await cargarDatos(); };
  const deleteMedico = async (id) => { if (!esAdmin) return; await supabase.from("medicos").delete().eq("id", id); showSync("✓ Eliminado"); await cargarDatos(); };

  // VISITAS — solo admin puede modificar/eliminar
  const addVisita = async (data) => {
    await supabase.from("visitas").insert([data]);
    // Crear recordatorio automático
    if (data.fecha) {
      const fechaRec = new Date(data.fecha + "T00:00:00");
      fechaRec.setDate(fechaRec.getDate() - 1);
      const fechaStr = fechaRec.toISOString().split("T")[0];
      const med = medicos.find(m => m.id === Number(data.medico_id));
      await supabase.from("recordatorios").insert([{
        titulo: `Visita mañana: ${med?.nombre || "Médico"}`,
        tipo: "Visita médica programada",
        fecha: fechaStr,
        hora: data.hora || "08:00",
        descripcion: `Recordatorio automático — ${data.objetivo || ""}`,
        medico_id: Number(data.medico_id) || null,
        completado: false,
        usuario_creador: usuario,
      }]);
    }
    showSync("✓ Visita registrada"); await cargarDatos();
  };
  const updateVisita = async (id, data) => {
    if (!esAdmin) { alert("Solo Oscar Gutiérrez puede modificar visitas."); return; }
    await supabase.from("visitas").update(data).eq("id", id); showSync("✓ Actualizado"); await cargarDatos();
  };
  const deleteVisita = async (id) => {
    if (!esAdmin) { alert("Solo Oscar Gutiérrez puede eliminar visitas."); return; }
    await supabase.from("visitas").delete().eq("id", id); showSync("✓ Eliminada"); await cargarDatos();
  };

  // MUESTRAS — solo admin puede modificar/eliminar
  const addMuestra = async (data) => { await supabase.from("muestras").insert([data]); showSync("✓ Guardado"); await cargarDatos(); };
  const updateMuestra = async (id, data) => {
    if (!esAdmin) { alert("Solo Oscar Gutiérrez puede modificar el inventario."); return; }
    await supabase.from("muestras").update(data).eq("id", id); showSync("✓ Stock actualizado"); await cargarDatos();
  };

  // RECORDATORIOS
  const addRecordatorio = async (data) => { await supabase.from("recordatorios").insert([data]); showSync("✓ Recordatorio guardado"); await cargarDatos(); };
  const updateRecordatorio = async (id, data) => { await supabase.from("recordatorios").update(data).eq("id", id); showSync("✓ Actualizado"); await cargarDatos(); };
  const deleteRecordatorio = async (id) => { if (!esAdmin) return; await supabase.from("recordatorios").delete().eq("id", id); showSync("✓ Eliminado"); await cargarDatos(); };

  const handleLogin = (nombre) => {  setUsuario(nombre); };
  const handleLogout = () => {  setUsuario(null); };

  // Recordatorios de hoy para el badge
  const hoy = new Date().toISOString().split("T")[0];
  const recordatoriosHoy = recordatorios.filter(r => r.fecha === hoy && !r.completado).length;
  const stockCritico = muestras.filter(m => m.stock <= m.unidad_minima).length;

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

  return (
    <div style={S.app}>
      <div style={{ ...S.sidebar, position: "relative", zIndex: 100 }}>
        <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ color: COLORS.white, fontSize: 15, fontWeight: 700 }}>💊 CRM Cadopharma</div>
          <div style={{ color: COLORS.teal, fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>Visita Médica · Oncología</div>
        </div>
        <nav style={S.nav}>
          {MENU.map(item => (
            <div key={item.id} style={S.navItem(tab === item.id, COLORS)} onClick={() => setTab(item.id)}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.id === "recordatorios" && recordatoriosHoy > 0 && (
                <span style={{ marginLeft: "auto", background: "#F59E0B", color: COLORS.white, fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}>{recordatoriosHoy}</span>
              )}
            </div>
          ))}
        </nav>
        <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Sesión activa</div>
          <div style={{ fontSize: 13, color: COLORS.tealLight, fontWeight: 700 }}>👤 {usuario}</div>
          {esAdmin && <div style={{ fontSize: 10, color: "#F59E0B", fontWeight: 600, marginTop: 2 }}>⭐ Administrador</div>}
          <button onClick={handleLogout} style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.4)", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>Cambiar usuario →</button>
        </div>
      </div>

      <div style={S.main}>
        <div style={S.topbar}>
          <span style={{ fontSize: 17, fontWeight: 700 }}>{TAB_TITLES[tab]}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {syncMsg && <span style={{ fontSize: 11, color: COLORS.teal, fontWeight: 600 }}>{syncMsg}</span>}
            <span style={{ fontSize: 12, color: COLORS.slateLight }}>
              {medicos.length} médicos · {visitas.length} visitas
              {stockCritico > 0 ? ` · ⚠️ ${stockCritico} alertas` : ""}
              {recordatoriosHoy > 0 ? ` · 🔔 ${recordatoriosHoy} hoy` : ""}
            </span>
          </div>
        </div>

        <div style={S.content}>
          {tab === "dashboard" && <Dashboard medicos={medicos} visitas={visitas} muestras={muestras} usuario={usuario} />}
          {tab === "medicos" && <Medicos medicos={medicos} onAdd={addMedico} onUpdate={updateMedico} onDelete={deleteMedico} visitas={visitas} esAdmin={esAdmin} />}
          {tab === "visitas" && <Visitas visitas={visitas} medicos={medicos} onAdd={addVisita} onUpdate={updateVisita} onDelete={deleteVisita} usuario={usuario} esAdmin={esAdmin} />}
          {tab === "muestras" && <Muestras muestras={muestras} onAdd={addMuestra} onUpdate={updateMuestra} esAdmin={esAdmin} />}
          {tab === "calendario" && <Calendario visitas={visitas} medicos={medicos} />}
          {tab === "recordatorios" && <Recordatorios recordatorios={recordatorios} onAdd={addRecordatorio} onUpdate={updateRecordatorio} onDelete={deleteRecordatorio} usuario={usuario} medicos={medicos} />}
          {tab === "cumpleanos" && <Cumpleanos medicos={medicos} onUpdate={updateMedico} />}
          {tab === "reportes" && <Reportes visitas={visitas} medicos={medicos} muestras={muestras} />}
        </div>
      </div>
    </div>
  );
}
