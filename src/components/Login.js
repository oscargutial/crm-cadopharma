import { useState } from 'react';
import { COLORS, REPRESENTANTES, S } from '../constants';

export default function Login({ onLogin }) {
  const [nombre, setNombre] = useState("");

  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.navy }}>
      <div style={{ background: COLORS.white, borderRadius: 14, padding: 40, width: "100%", maxWidth: 360, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", margin: "0 16px" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>💊</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.navy, marginBottom: 4 }}>CRM Cadopharma</div>
        <div style={{ fontSize: 11, color: COLORS.teal, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 32 }}>Visita Médica · Oncología</div>

        <label style={{ ...S.label, textAlign: "left" }}>Selecciona tu nombre</label>
        <select
          style={{ ...S.select, marginBottom: 20 }}
          value={nombre}
          onChange={e => setNombre(e.target.value)}
        >
          <option value="">— Elige un representante —</option>
          {REPRESENTANTES.map(r => <option key={r} value={r}>{r}</option>)}
          <option value="Oscar Gerencia">👔 Oscar (Gerencia)</option>
        </select>

        <button
          style={{ ...S.btn(), width: "100%", padding: "12px 0", fontSize: 15, opacity: nombre ? 1 : 0.5 }}
          disabled={!nombre}
          onClick={() => onLogin(nombre)}
        >
          Entrar al sistema
        </button>

        <div style={{ fontSize: 11, color: COLORS.slateLight, marginTop: 20, lineHeight: 1.6 }}>
          Datos compartidos entre todos los usuarios en tiempo real.
        </div>
      </div>
    </div>
  );
}
