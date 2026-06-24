import { useState } from 'react';
import { COLORS, USUARIOS, S } from '../constants';
import { supabase } from '../supabaseClient';

const ADMIN = "Oscar Gutiérrez";

const iconRol = {
  "Gerencia": "👔",
  "Visitador Médico": "🏥",
  "Asesor Comercial": "💼",
  "Mercadeo Digital": "📱",
  "Asistente Administrativo": "📋",
};

export default function Login({ onLogin }) {
  const [seleccion, setSeleccion] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const usuario = USUARIOS.find(u => u.nombre === seleccion);
  const necesitaClave = seleccion === ADMIN;

  const handleEntrar = async () => {
    if (!seleccion) return;
    setError("");

    if (necesitaClave) {
      if (!clave) { setError("Debes ingresar tu clave."); return; }
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
    }

    onLogin(seleccion);
  };

  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.navy }}>
      <div style={{ background: COLORS.white, borderRadius: 14, padding: 40, width: "100%", maxWidth: 380, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", margin: "0 16px" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>💊</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.navy, marginBottom: 4 }}>CRM Cadopharma</div>
        <div style={{ fontSize: 11, color: COLORS.teal, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 32 }}>Visita Médica · Oncología</div>

        <label style={{ ...S.label, textAlign: "left" }}>Selecciona tu nombre</label>
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
          <div style={{ background: COLORS.tealBg, border: `1px solid ${COLORS.teal}`, borderRadius: 8, padding: "8px 14px", marginBottom: 16, fontSize: 13, color: COLORS.teal, fontWeight: 600 }}>
            {iconRol[usuario.rol] || "👤"} {usuario.rol}
          </div>
        )}

        {necesitaClave && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ ...S.label, textAlign: "left" }}>🔒 Clave de administrador</label>
            <input
              style={{ ...S.input, letterSpacing: 3, textAlign: "center" }}
              type="password"
              placeholder="••••••••••"
              value={clave}
              onChange={e => { setClave(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleEntrar()}
              autoFocus
            />
            {error && (
              <div style={{ color: COLORS.danger, fontSize: 12, marginTop: 6, fontWeight: 600, background: COLORS.dangerBg, padding: "6px 10px", borderRadius: 6 }}>
                ⚠️ {error}
              </div>
            )}
          </div>
        )}

        <button
          style={{ ...S.btn(), width: "100%", padding: "12px 0", fontSize: 15, opacity: (seleccion && !loading) ? 1 : 0.5 }}
          disabled={!seleccion || loading}
          onClick={handleEntrar}
        >
          {loading ? "Verificando…" : "Entrar al sistema"}
        </button>

        <div style={{ fontSize: 11, color: COLORS.slateLight, marginTop: 20, lineHeight: 1.6 }}>
          Datos compartidos en tiempo real entre todos los usuarios.
        </div>
      </div>
    </div>
  );
}
