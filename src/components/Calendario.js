import { useState } from 'react';
import { COLORS, RESULTADO_BADGE, S, fmt } from '../constants';
import Modal from './Modal';

const badge = (color, bg, text) => <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>{text}</span>;

export default function Calendario({ visitas, medicos }) {
  const [mesOffset, setMesOffset] = useState(0);
  const [detalle, setDetalle] = useState(null);

  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth() + mesOffset, 1);
  const year = base.getFullYear(), month = base.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = base.toLocaleDateString("es-DO", { month: "long", year: "numeric" });

  const visitasPorDia = {};
  visitas.forEach(v => {
    const addDay = (dateStr, tipo) => {
      if (!dateStr) return;
      const d = new Date(dateStr + "T00:00:00");
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!visitasPorDia[day]) visitasPorDia[day] = [];
        visitasPorDia[day].push({ ...v, tipo_marcador: tipo });
      }
    };
    addDay(v.fecha, "realizada");
    addDay(v.proxima_visita, "programada");
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button style={S.btn("ghost")} onClick={() => setMesOffset(o => o - 1)}>← Anterior</button>
        <span style={{ fontSize: 16, fontWeight: 700, textTransform: "capitalize" }}>{monthName}</span>
        <button style={S.btn("ghost")} onClick={() => setMesOffset(o => o + 1)}>Siguiente →</button>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 12, fontSize: 12, color: COLORS.slate }}>
        <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: COLORS.teal, marginRight: 5 }}></span>Realizada</span>
        <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: COLORS.navy, marginRight: 5 }}></span>Programada</span>
      </div>
      <div style={S.card}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 8 }}>
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: COLORS.slateLight, padding: "6px 0" }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
          {cells.map((day, i) => {
            const items = day ? (visitasPorDia[day] || []) : [];
            return (
              <div key={i}
                onClick={() => items.length && setDetalle({ day, items })}
                style={{ minHeight: 64, background: items.length ? COLORS.tealBg : COLORS.bg, borderRadius: 8, padding: 5, cursor: items.length ? "pointer" : "default", border: `1px solid ${items.length ? COLORS.teal : COLORS.border}`, opacity: day ? 1 : 0 }}>
                {day && <>
                  <div style={{ fontSize: 12, fontWeight: 600, color: items.length ? COLORS.teal : COLORS.slate, marginBottom: 3 }}>{day}</div>
                  {items.slice(0, 2).map((v, idx) => {
                    const med = medicos.find(m => m.id === v.medico_id);
                    return (
                      <div key={idx} style={{ fontSize: 9, background: v.tipo_marcador === "programada" ? COLORS.navy : COLORS.teal, color: COLORS.white, borderRadius: 3, padding: "2px 4px", marginBottom: 2, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                        {med?.nombre?.split(" ")[0] || "Visita"}
                      </div>
                    );
                  })}
                  {items.length > 2 && <div style={{ fontSize: 9, color: COLORS.teal, fontWeight: 600 }}>+{items.length - 2}</div>}
                </>}
              </div>
            );
          })}
        </div>
      </div>

      {detalle && (
        <Modal title={`${detalle.day} de ${monthName}`} onClose={() => setDetalle(null)}>
          {detalle.items.map((v, i) => {
            const med = medicos.find(m => m.id === v.medico_id);
            return (
              <div key={i} style={{ padding: "12px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontWeight: 700 }}>{med?.nombre}</span>
                  {badge(v.tipo_marcador === "programada" ? COLORS.navy : COLORS.teal, v.tipo_marcador === "programada" ? "#EEF2FF" : COLORS.tealBg, v.tipo_marcador === "programada" ? "📅 Programada" : "✓ Realizada")}
                </div>
                <div style={{ fontSize: 12, color: COLORS.slateLight }}>{v.hora} · {v.tipo} · {v.representante}</div>
                {v.objetivo && <div style={{ fontSize: 12, marginTop: 4 }}>🎯 {v.objetivo}</div>}
                <div style={{ marginTop: 6 }}>{RESULTADO_BADGE[v.resultado]}</div>
              </div>
            );
          })}
        </Modal>
      )}
    </div>
  );
}
