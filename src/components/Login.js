import { useState } from 'react';
import { supabase } from '../supabaseClient';

const USUARIOS = [
  { nombre: "Oscar Gutiérrez", rol: "Gerencia" },
  { nombre: "Angela Almonte", rol: "Gerencia" },
  { nombre: "Miguelina Sanchez", rol: "Gerencia" },
  { nombre: "Pablo Polanco", rol: "Asesor Comercial" },
  { nombre: "Paola Taveras", rol: "Visitador Médico" },
];

export default function Login({ onLogin }) {
  const [seleccion, setSeleccion] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const entrar = async () => {
    if (!seleccion) { setError("Selecciona tu nombre."); return; }
    if (!clave) { setError("Escribe tu clave."); return; }
    setCargando(true);
    setError("");
    try {
      const { data } = await supabase
        .from("usuarios_config")
        .select("clave_hash")
        .eq("nombre", seleccion)
        .single();
      if (!data || data.clave_hash !== clave) {
        setError("Clave incorrecta.");
        setClave("");
      } else {
        onLogin(seleccion);
      }
    } catch {
      setError("Error de conexión.");
    }
    setCargando(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0F2B4C", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 40, width: "100%", maxWidth: 360, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>💊</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#0F2B4C", marginBottom: 4 }}>CRM Cadopharma</div>
        <div style={{ fontSize: 11, color: "#0E9E8B", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 32 }}>Visita Médica · Oncología</div>

        <div style={{ textAlign: "left", marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#4A5568", display: "block", marginBottom: 6 }}>Tu nombre</label>
          <select
            value={seleccion}
            onChange={e => { setSeleccion(e.target.value); setError(""); }}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "2px solid #E2E8F0", fontSize: 14, color: "#0F2B4C", background: "#fff", boxSizing: "border-box" }}
          >
            <option value="">— Selecciona tu nombre —</option>
            {USUARIOS.map(u => <option key={u.nombre} value={u.nombre}>{u.nombre} · {u.rol}</option>)}
          </select>
        </div>

        <div style={{ textAlign: "left", marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#4A5568", display: "block", marginBottom: 6 }}>🔒 Clave de acceso</label>
          <input
            type="password"
            placeholder="Escribe tu clave"
            value={clave}
            onChange={e => { setClave(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && entrar()}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "2px solid #E2E8F0", fontSize: 14, color: "#0F2B4C", boxSizing: "border-box" }}
          />
        </div>

        {error && (
          <div style={{ background: "#FFF5F5", color: "#E53E3E", padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={entrar}
          disabled={cargando}
          style={{ width: "100%", padding: "13px 0", borderRadius: 8, background: cargando ? "#ccc" : "#0E9E8B", color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: cargando ? "default" : "pointer" }}
        >
          {cargando ? "Verificando…" : "Entrar al sistema"}
        </button>

        <div style={{ fontSize: 11, color: "#A0AEC0", marginTop: 20 }}>
          v2.0 · Datos sincronizados en tiempo real
        </div>
      </div>
    </div>
  );
}