import { COLORS, S, fmt, today } from '../constants';

const META_VISITAS_MES = 20;

export default function Seguimiento({ visitas, medicos }) {
  const hoy = today();
  const mesActual = new Date().toISOString().slice(0, 7);
  const VISITADORA = "Paola Taveras";

  const visitasPaola = visitas.filter(v => v.representante === VISITADORA);
  const visitasMes = visitasPaola.filter(v => v.fecha?.startsWith(mesActual));
  const visitasHoy = visitasPaola.filter(v => v.fecha === hoy);
  const exitosasMes = visitasMes.filter(v => v.resultado === "Exitosa").length;
  const pctMeta = Math.min(100, Math.round((visitasMes.length / META_VISITAS_MES) * 100));

  // Médicos únicos visitados este mes
  const medicosVisitados = [...new Set(visitasMes.map(v => v.medico_id))];

  // Productos más promovidos
  const conteoProductos = {};
  visitasMes.forEach(v => {
    (Array.isArray(v.productos) ? v.productos : []).forEach(p => {
      conteoProductos[p] = (conteoProductos[p] || 0) + 1;
    });
  });
  const topProductos = Object.entries(conteoProductos).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Visitas con ubicación
  const visitasConUbic = visitasPaola.filter(v => v.latitud && v.longitud);

  // Últimas 5 visitas
  const ultimasVisitas = [...visitasPaola].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || "")).slice(0, 8);

  const colorMeta = pctMeta >= 80 ? COLORS.success : pctMeta >= 50 ? COLORS.warning : COLORS.danger;

  return (
    <div>
      {/* Header */}
      <div style={{ background: COLORS.navy, borderRadius: 12, padding: "20px 24px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ color: COLORS.white, fontSize: 18, fontWeight: 800 }}>🏥 Seguimiento — {VISITADORA}</div>
          <div style={{ color: COLORS.teal, fontSize: 12, fontWeight: 600, marginTop: 4 }}>Visitador Médico · Vista exclusiva de gerencia</div>
        </div>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
          Meta mensual: <b style={{ color: COLORS.white }}>{META_VISITAS_MES} visitas</b>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 20 }}>
        {[
          [visitasMes.length, `Visitas este mes`, colorMeta],
          [visitasHoy.length, "Visitas hoy", COLORS.navy],
          [exitosasMes, "Exitosas este mes", COLORS.success],
          [medicosVisitados.length, "Médicos cubiertos", COLORS.teal],
          [visitasConUbic.length, "Con ubicación GPS", "#6B46C1"],
        ].map(([v, l, c]) => (
          <div key={l} style={{ ...S.card, textAlign: "center", borderTop: `3px solid ${c}`, marginBottom: 0 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: c }}>{v}</div>
            <div style={{ fontSize: 11, color: COLORS.slateLight, marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Barra de meta */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>📊 Cumplimiento de meta mensual</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: colorMeta }}>{pctMeta}%</span>
        </div>
        <div style={{ height: 16, background: COLORS.border, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ height: 16, background: colorMeta, borderRadius: 8, width: `${pctMeta}%`, transition: "width .5s" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: COLORS.slateLight }}>
          <span>{visitasMes.length} realizadas</span>
          <span>{META_VISITAS_MES - visitasMes.length > 0 ? `Faltan ${META_VISITAS_MES - visitasMes.length}` : "✓ Meta alcanzada"}</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Últimas visitas */}
        <div style={S.card}>
          <div style={S.sectionTitle}>📋 Últimas visitas registradas</div>
          {ultimasVisitas.length === 0 ? (
            <p style={{ color: COLORS.slateLight, fontSize: 13 }}>Sin visitas registradas.</p>
          ) : ultimasVisitas.map(v => {
            const med = medicos.find(m => m.id === v.medico_id);
            return (
              <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{med?.nombre || "—"}</div>
                  <div style={{ fontSize: 11, color: COLORS.slateLight }}>{fmt(v.fecha)} · {v.hora}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {v.latitud && (
                    <button onClick={() => window.open(`https://www.google.com/maps?q=${v.latitud},${v.longitud}`, "_blank")}
                      style={{ ...S.btn("ghost"), padding: "3px 8px", fontSize: 12 }}>📍</button>
                  )}
                  <span style={{ fontSize: 11, fontWeight: 600, color: v.resultado === "Exitosa" ? COLORS.success : v.resultado === "Pendiente" ? COLORS.warning : COLORS.danger }}>
                    {v.resultado === "Exitosa" ? "✓" : v.resultado === "Pendiente" ? "⏳" : "✗"} {v.resultado}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Productos promovidos */}
        <div style={S.card}>
          <div style={S.sectionTitle}>💊 Productos más promovidos este mes</div>
          {topProductos.length === 0 ? (
            <p style={{ color: COLORS.slateLight, fontSize: 13 }}>Sin datos este mes.</p>
          ) : topProductos.map(([producto, count]) => (
            <div key={producto} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>{producto}</span>
                <span style={{ color: COLORS.teal, fontWeight: 700 }}>{count}x</span>
              </div>
              <div style={{ height: 6, background: COLORS.border, borderRadius: 3 }}>
                <div style={{ height: 6, background: COLORS.teal, borderRadius: 3, width: `${(count / (topProductos[0]?.[1] || 1)) * 100}%` }} />
              </div>
            </div>
          ))}
          {topProductos.length === 0 && <p style={{ color: COLORS.slateLight, fontSize: 13 }}>Sin datos.</p>}
        </div>

        {/* Mapa de visitas */}
        {visitasConUbic.length > 0 && (
          <div style={{ ...S.card, gridColumn: "1 / -1" }}>
            <div style={S.sectionTitle}>📍 Ubicaciones de visitas registradas</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {visitasConUbic.slice(0, 20).map(v => {
                const med = medicos.find(m => m.id === v.medico_id);
                return (
                  <div key={v.id}
                    onClick={() => window.open(`https://www.google.com/maps?q=${v.latitud},${v.longitud}`, "_blank")}
                    style={{ background: COLORS.tealBg, border: `1px solid ${COLORS.teal}`, borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 12 }}>
                    <div style={{ fontWeight: 700, color: COLORS.navy }}>{med?.nombre || "—"}</div>
                    <div style={{ color: COLORS.teal, fontSize: 11 }}>📍 {fmt(v.fecha)} · {v.hora}</div>
                    <div style={{ color: COLORS.slateLight, fontSize: 10 }}>{v.latitud?.toFixed(4)}, {v.longitud?.toFixed(4)}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: COLORS.slateLight, marginTop: 10 }}>
              Clic en cada tarjeta para ver la ubicación exacta en Google Maps
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
