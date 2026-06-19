import { useState } from 'react';
import { COLORS, S, WHATSAPP_BUSINESS } from '../constants';

export default function Cumpleanos({ medicos, onUpdate }) {
  const [filtro, setFiltro] = useState("");

  const hoy = new Date();
  const mesActual = hoy.getMonth() + 1;

  const medicosConCumple = medicos
    .filter(m => m.cumpleanos)
    .map(m => {
      const [, mes, dia] = m.cumpleanos.split("-");
      const mesNum = parseInt(mes);
      const diaNum = parseInt(dia);
      const cumpleEsteAno = new Date(hoy.getFullYear(), mesNum - 1, diaNum);
      if (cumpleEsteAno < hoy) cumpleEsteAno.setFullYear(hoy.getFullYear() + 1);
      const diasRestantes = Math.ceil((cumpleEsteAno - hoy) / (1000 * 60 * 60 * 24));
      return { ...m, mes: mesNum, dia: diaNum, diasRestantes };
    })
    .sort((a, b) => a.diasRestantes - b.diasRestantes);

  const esteMes = medicosConCumple.filter(m => m.mes === mesActual);
  const proximamente = medicosConCumple.filter(m => m.diasRestantes <= 30 && m.diasRestantes > 0);

  const filtrados = medicos.filter(m =>
    [m.nombre, m.especialidad, m.institucion].join(" ").toLowerCase().includes(filtro.toLowerCase())
  );

  const setFecha = async (medico, fecha) => {
    await onUpdate(medico.id, { ...medico, cumpleanos: fecha });
  };

  const felicitar = (medico) => {
    const texto = encodeURIComponent(
      `🎂 *¡Feliz Cumpleaños Dr(a). ${medico.nombre}!*\n\n` +
      `En nombre del equipo de *Cadopharma*, le deseamos un maravilloso día. ` +
      `Es un placer contar con usted como parte de nuestra red médica. 🎉\n\n` +
      `_Equipo Cadopharma_`
    );
    window.open(`https://wa.me/${WHATSAPP_BUSINESS}?text=${texto}`, "_blank");
  };

  const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <div>
      {/* Alertas próximos cumpleaños */}
      {proximamente.length > 0 && (
        <div style={{ background: "#FFF8E1", border: `2px solid #F59E0B`, borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: "#92400E", fontSize: 14, marginBottom: 10 }}>🎂 Próximos cumpleaños (30 días)</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {proximamente.map(m => (
              <div key={m.id} style={{ background: COLORS.white, borderRadius: 8, padding: "8px 14px", fontSize: 13, border: `1px solid #F59E0B` }}>
                <div style={{ fontWeight: 700 }}>{m.nombre}</div>
                <div style={{ fontSize: 11, color: "#92400E" }}>
                  {m.diasRestantes === 0 ? "🎉 ¡HOY!" : `en ${m.diasRestantes} días — ${m.dia}/${m.mes}`}
                </div>
                <button onClick={() => felicitar(m)} style={{ ...S.btn(), padding: "3px 10px", fontSize: 11, marginTop: 6, background: "#25D366" }}>
                  📲 Felicitar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Este mes */}
      {esteMes.length > 0 && (
        <div style={{ ...S.card, borderLeft: `4px solid #F59E0B`, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.slateLight, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
            🎂 Cumpleaños en {MESES[mesActual - 1]}
          </div>
          {esteMes.map(m => (
            <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{m.nombre}</div>
                <div style={{ fontSize: 11, color: COLORS.slateLight }}>{m.especialidad} · {m.institucion}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B" }}>{m.dia} de {MESES[m.mes - 1]}</span>
                <button onClick={() => felicitar(m)} style={{ ...S.btn(), padding: "4px 10px", fontSize: 12, background: "#25D366" }}>📲</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista completa */}
      <div style={{ marginBottom: 12 }}>
        <input style={{ ...S.input, maxWidth: 300 }} placeholder="Buscar médico…" value={filtro} onChange={e => setFiltro(e.target.value)} />
      </div>

      <div style={S.card}>
        <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.slateLight, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14 }}>
          Todos los médicos — Registro de cumpleaños
        </div>
        <table style={S.table}>
          <thead>
            <tr>{["Médico", "Especialidad", "Institución", "Cumpleaños", "Acción"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtrados.map(m => {
              const conCumple = medicosConCumple.find(mc => mc.id === m.id);
              return (
                <tr key={m.id}>
                  <td style={S.td}><div style={{ fontWeight: 600 }}>{m.nombre}</div></td>
                  <td style={S.td}>{m.especialidad}</td>
                  <td style={S.td}>{m.institucion}</td>
                  <td style={S.td}>
                    <input
                      type="date"
                      value={m.cumpleanos || ""}
                      onChange={e => setFecha(m, e.target.value)}
                      style={{ ...S.input, width: "auto", fontSize: 12 }}
                    />
                  </td>
                  <td style={S.td}>
                    {m.cumpleanos && (
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {conCumple && <span style={{ fontSize: 11, color: "#F59E0B", fontWeight: 600 }}>en {conCumple.diasRestantes}d</span>}
                        <button onClick={() => felicitar(m)} style={{ ...S.btn(), padding: "4px 10px", fontSize: 11, background: "#25D366" }}>📲 WA</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
