import { useState } from 'react';
import { COLORS, S } from '../constants';
import { supabase } from '../supabaseClient';

const USUARIOS = [
  { nombre: "Oscar Gutiérrez", rol: "Gerencia" },
  { nombre: "Angela Almonte", rol: "Gerencia" },
  { nombre: "Miguelina Sanchez", rol: "Gerencia" },
  { nombre: "Pablo Polanco", rol: "Asesor Comercial" },
  { nombre: "Paola Taveras", rol: "Visitador Médico" },
];

const iconRol = {
  "Gerencia": "👔",
  "Visitador Médico": "🏥",
  "Asesor Comercial": "💼",
};

export default function Login({ onLogin }) {
  const [seleccion, setSeleccion] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const usuario = USUARIOS.find(u => u.nombre === seleccion);

  const handleEntrar = async () => {
    if (!seleccion || !clave) { setError("Debes seleccionar tu nombre e ingresar tu clave."); return; }
    setError("");
    setLoading(true);

    const { data, error: dbError } = await supabase
      .from("usuarios_config")
      .select("clave_hash")
      .eq("nombre", seleccion)
      .single();

    setLoading(false);

    if (dbError || !data) { setError("Error verificando clave. Intenta de nuevo."); return; }
    if (data.clave_hash !== clave) {
      setError("Clave incorrecta. Intenta de nuevo.");
      setClave("");
      return;
    }

    onLogin(seleccion);
  };

  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.navy }}>
      <div style={{ background: COLORS.white, borderRadius: 14, padding: 40, width: "100%", maxWidth: 380, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", margin: "0 16px" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>💊</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.navy, marginBottom: 4 }}>CRM Cadopharma</div>
        <div style={{ fontSize: 11, color: COLORS.teal, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 28 }}>Visita Médica · Oncología</div>

        <label style={{ ...S.label, textAlign: "left" }}>Tu nombre</label>
        <select
          style={{ ...S.select, marginBottom: 12 }}
          value={seleccion}
          onChange={e => { setSeleccion(e.target.value); setClave(""); setError(""); }}
        >
          <option value="">— Selecciona quién eres —</option>
          {USUARIOS.map(u => (
            <option key={u.nombre} value={u.nombre}>{u.nombre}</option>
          ))}
        </select>

        {usuario && (
          <div style={{ background: COLORS.tealBg, border: `1px solid ${COLORS.teal}`, borderRadius: 8, padding: "6px 14px", marginBottom: 14, fontSize: 13, color: COLORS.teal, fontWeight: 600 }}>
            {iconRol[usuario.rol] || "👤"} {usuario.rol}
          </div>
        )}

        <label style={{ ...S.label, textAlign: "left" }}>🔒 Clave de acceso</label>
        <input
          style={{ ...S.input, letterSpacing: 2, marginBottom: 14 }}
          type="password"
          placeholder="Ingresa tu clave"
          value={clave}
          onChange={e => { setClave(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleEntrar()}
        />

        {error && (
          <div style={{ color: COLORS.danger, fontSize: 12, marginBottom: 12, fontWeight: 600, background: COLORS.dangerBg, padding: "6px 10px", borderRadius: 6 }}>
            ⚠️ {error}
          </div>
        )}

        <button
          style={{ ...S.btn(), width: "100%", padding: "12px 0", fontSize: 15, opacity: (seleccion && clave && !loading) ? 1 : 0.5 }}
          disabled={!seleccion || !clave || loading}
          onClick={handleEntrar}
        >
          {loading ? "Verificando…" : "Entrar al sistema"}
        </button>

        <div style={{ fontSize: 11, color: COLORS.slateLight, marginTop: 16, lineHeight: 1.6 }}>
          Datos compartidos en tiempo real entre todos los usuarios.
        </div>
      </div>
    </div>
  );
}
