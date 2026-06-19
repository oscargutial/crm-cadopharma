import { COLORS, REPRESENTANTES, RESULTADO_BADGE, S, fmt, today } from '../constants';

export default function Dashboard({ medicos, visitas, muestras, usuario }) {
  const hoy = today();
  const mesActual = new Date().toISOString().slice(0, 7);
  const visitasMes = visitas.filter(v => v.fecha && v.fecha.startsWith(mesActual));
  const exitosas = visitas.filter(v => v.resultado === "Exitosa").length;
  const stockCritico = muestras.filter(m => m.stock <= m.unidad_minima);
  const proximas = visitas.filter(v => v.proxima_visita >= hoy).sort((a, b) => a.proxima_visita?.localeCompare(b.proxima_visita)).slice(0, 5);
  const misVisitas = visitas.filter(v => v.representante === usuario).slice(-4).reverse();
  const porRep = REPRESENTANTES.map(r => ({
    nombre: r,
    total: visitas.filter(v => v.representante === r).length,
    exitosas: visitas.filter(v => v.representante === r && v.resultado === "Exitosa").length,
  })).filter(r => r.total > 0);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          [medicos.length, "Médicos registrados", COLORS.teal],
          [visitasMes.length, "Visitas este mes", COLORS.navy],
          [visitas.length > 0 ? Math.round((exitosas / visitas.length) * 100) + "%" : "0%", "Efectividad", COLORS.success],
          [stockCritico.length, "Alertas de stock", stockCritico.length > 0 ? COLORS.danger : COLORS.success],
        ].map(([v, l, c]) => (
          <div key={l} style={S.kpiCard(c)}>
            <div style={{ fontSize: 28, fontWeight: 800, color: c, lineHeight: 1 }}>{v}</div>
            <div style={{ fontSize: 12, color: COLORS.slateLight, marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        <div style={S.card}>
          <div style={S.sectionTitle}>📅 Próximas visitas</div>
          {proximas.length === 0
            ? <p style={{ color: COLORS.slateLight, fontSize: 13 }}>Sin visitas programadas.</p>
            : proximas.map(v => {
                const med = medicos.find(m => m.id === v.medico_id);
                return (
                  <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{med?.nombre || "—"}</div>
                      <div style={{ fontSize: 11, color: COLORS.slateLight }}>{v.representante} · {v.tipo}</div>
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.teal, fontWeight: 600 }}>{fmt(v.proxima_visita)}</div>
                  </div>
                );
              })}
        </div>

        <div style={S.card}>
          <div style={S.sectionTitle}>👤 Rendimiento del equipo</div>
          {porRep.map(r => (
            <div key={r.nombre} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                <span style={{ fontWeight: r.nombre === usuario ? 700 : 400 }}>
                  {r.nombre === usuario ? "★ " : ""}{r.nombre}
                </span>
                <span style={{ color: COLORS.slateLight }}>{r.exitosas}/{r.total}</span>
              </div>
              <div style={{ height: 6, background: COLORS.border, borderRadius: 3 }}>
                <div style={{ height: 6, background: r.nombre === usuario ? COLORS.teal : COLORS.navyLight, borderRadius: 3, width: `${r.total > 0 ? (r.exitosas / r.total) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
          {porRep.length === 0 && <p style={{ color: COLORS.slateLight, fontSize: 13 }}>Sin datos aún.</p>}
        </div>

        {stockCritico.length > 0 && (
          <div style={{ ...S.card, borderLeft: `4px solid ${COLORS.danger}` }}>
            <div style={S.sectionTitle}>⚠️ Stock crítico</div>
            {stockCritico.map(m => (
              <div key={m.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${COLORS.border}`, fontSize: 13 }}>
                <span style={{ fontWeight: 600 }}>{m.producto}</span>
                <span style={{ color: COLORS.danger, fontWeight: 700 }}>{m.stock} uds.</span>
              </div>
            ))}
          </div>
        )}

        <div style={S.card}>
          <div style={S.sectionTitle}>📋 Mis visitas recientes</div>
          {misVisitas.map(v => {
            const med = medicos.find(m => m.id === v.medico_id);
            return (
              <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{med?.nombre || "—"}</div>
                  <div style={{ fontSize: 11, color: COLORS.slateLight }}>{fmt(v.fecha)}</div>
                </div>
                {RESULTADO_BADGE[v.resultado]}
              </div>
            );
          })}
          {misVisitas.length === 0 && <p style={{ color: COLORS.slateLight, fontSize: 13 }}>Aún no tienes visitas.</p>}
        </div>
      </div>
    </div>
  );
}
