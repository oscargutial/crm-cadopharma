import { COLORS, PRODUCTOS, REPRESENTANTES, S } from '../constants';

const badge = (color, bg, text) => <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>{text}</span>;

export default function Reportes({ visitas, medicos, muestras }) {
  const total = visitas.length;
  const exitosas = visitas.filter(v => v.resultado === "Exitosa").length;
  const pendientes = visitas.filter(v => v.resultado === "Pendiente").length;
  const noExitosas = visitas.filter(v => v.resultado === "No exitosa").length;

  const porRep = REPRESENTANTES.map(r => ({
    nombre: r,
    total: visitas.filter(v => v.representante === r).length,
    exitosas: visitas.filter(v => v.representante === r && v.resultado === "Exitosa").length,
  })).filter(r => r.total > 0);

  const porProducto = PRODUCTOS.map(p => ({
    producto: p,
    visitas: visitas.filter(v => Array.isArray(v.productos) && v.productos.includes(p)).length,
  })).sort((a, b) => b.visitas - a.visitas);

  const topMedicos = medicos.map(m => ({
    ...m,
    visitas: visitas.filter(v => v.medico_id === m.id).length,
  })).sort((a, b) => b.visitas - a.visitas).slice(0, 5);

  const maxRep = Math.max(...porRep.map(r => r.total), 1);
  const maxProd = Math.max(...porProducto.map(p => p.visitas), 1);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 20 }}>
        {[["Total visitas", total, COLORS.navy], ["Exitosas", exitosas, COLORS.success], ["Pendientes", pendientes, COLORS.warning], ["No exitosas", noExitosas, COLORS.danger]].map(([l, v, c]) => (
          <div key={l} style={{ ...S.card, textAlign: "center", borderTop: `3px solid ${c}`, marginBottom: 0 }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: c }}>{v}</div>
            <div style={{ fontSize: 12, color: COLORS.slateLight, marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        <div style={S.card}>
          <div style={S.sectionTitle}>Visitas por representante</div>
          {porRep.map(r => (
            <div key={r.nombre} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                <b>{r.nombre}</b>
                <span style={{ color: COLORS.slateLight }}>{r.exitosas}/{r.total}</span>
              </div>
              <div style={{ height: 10, background: COLORS.border, borderRadius: 5, overflow: "hidden", display: "flex" }}>
                <div style={{ width: `${(r.exitosas / maxRep) * 100}%`, background: COLORS.teal }} />
                <div style={{ width: `${((r.total - r.exitosas) / maxRep) * 100}%`, background: COLORS.warning }} />
              </div>
            </div>
          ))}
          {porRep.length === 0 && <p style={{ color: COLORS.slateLight, fontSize: 13 }}>Sin datos.</p>}
        </div>

        <div style={S.card}>
          <div style={S.sectionTitle}>Visitas por producto</div>
          {porProducto.map(p => (
            <div key={p.producto} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                <b>{p.producto}</b>
                <span style={{ color: COLORS.teal, fontWeight: 700 }}>{p.visitas}</span>
              </div>
              <div style={{ height: 8, background: COLORS.border, borderRadius: 4 }}>
                <div style={{ height: 8, background: COLORS.navy, borderRadius: 4, width: `${(p.visitas / maxProd) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div style={S.card}>
          <div style={S.sectionTitle}>Top 5 médicos visitados</div>
          <table style={S.table}>
            <thead><tr>{["#", "Médico", "Especialidad", "Visitas"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {topMedicos.map((m, i) => (
                <tr key={m.id}>
                  <td style={{ ...S.td, color: COLORS.teal, fontWeight: 700 }}>#{i + 1}</td>
                  <td style={S.td}><b>{m.nombre}</b></td>
                  <td style={{ ...S.td, fontSize: 12 }}>{m.especialidad}</td>
                  <td style={{ ...S.td, fontWeight: 700 }}>{m.visitas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={S.card}>
          <div style={S.sectionTitle}>Inventario de muestras</div>
          {muestras.map(m => (
            <div key={m.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                <b>{m.producto}</b>
                {m.stock <= m.unidad_minima ? badge(COLORS.danger, COLORS.dangerBg, "⚠ Crítico") : badge(COLORS.success, COLORS.successBg, "OK")}
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 11, color: COLORS.slateLight }}>
                <span>Stock: <b style={{ color: COLORS.navy }}>{m.stock}</b></span>
                <span>Entregadas: <b style={{ color: COLORS.teal }}>{m.entregadas}</b></span>
                <span>Mínimo: <b>{m.unidad_minima}</b></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
