import { useState } from 'react';
import { COLORS, USUARIOS, S } from '../constants';

export default function Login({ onLogin }) {
  const [seleccion, setSeleccion] = useState("");

  const usuario = USUARIOS.find(u => u.nombre === seleccion);

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
          onChange={e => setSeleccion(e.target.value)}
        >
          <option value="">— Selecciona quién eres —</option>
          {USUARIOS.map(u => (
            <option key={u.nombre} value={u.nombre}>{u.nombre}</option>
          ))}
        </select>

        {usuario && (
          <div style={{ background: COLORS.tealBg, border: `1px solid ${COLORS.teal}`, borderRadius: 8, padding: "8px 14px", marginBottom: 20, fontSize: 13, color: COLORS.teal, fontWeight: 600 }}>
            {usuario.rol === "Gerencia" ? "👔" : usuario.rol === "Visitador Médico" ? "🏥" : usuario.rol === "Asesor Comercial" ? "💼" : usuario.rol === "Mercadeo Digital" ? "📱" : "📋"} {usuario.rol}
          </div>
        )}

        <button
          style={{ ...S.btn(), width: "100%", padding: "12px 0", fontSize: 15, opacity: seleccion ? 1 : 0.5 }}
          disabled={!seleccion}
          onClick={() => onLogin(seleccion)}
        >
          Entrar al sistema
        </button>

        <div style={{ fontSize: 11, color: COLORS.slateLight, marginTop: 20, lineHeight: 1.6 }}>
          Datos compartidos en tiempo real entre todos los usuarios.
        </div>
      </div>
    </div>
  );
}
