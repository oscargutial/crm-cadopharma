import { useState } from 'react';
import { COLORS, PRODUCTOS, S, ADMIN_USUARIO } from '../constants';
import Modal from './Modal';

const badge = (color, bg, text) => <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>{text}</span>;

export default function Muestras({ muestras, onAdd, onUpdate, usuario }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [ajuste, setAjuste] = useState({ id: null, cantidad: 0, tipo: "entregar" });
  const [saving, setSaving] = useState(false);

  const esAdmin = usuario === ADMIN_USUARIO;

  // Productos que aún no tienen registro en muestras
  const productosRegistrados = muestras.map(m => m.producto);
  const productosSinRegistro = PRODUCTOS.filter(p => !productosRegistrados.includes(p));

  const guardarNuevo = async () => {
    if (!form.producto) return;
    setSaving(true);
    await onAdd({ ...form, stock: Number(form.stock || 0), unidad_minima: Number(form.unidad_minima || 10), entregadas: 0 });
    setSaving(false);
    setModal(null);
  };

  const aplicarAjuste = async () => {
    if (!esAdmin) { alert("Solo Oscar Gutiérrez puede ajustar el inventario."); return; }
    const m = muestras.find(x => x.id === ajuste.id);
    if (!m) return;
    setSaving(true);
    const delta = Number(ajuste.cantidad);
    const updates = ajuste.tipo === "entregar"
      ? { stock: Math.max(0, m.stock - delta), entregadas: m.entregadas + delta }
      : { stock: m.stock + delta };
    await onUpdate(ajuste.id, updates);
    setSaving(false);
    setModal(null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
        <div style={{ fontSize: 13, color: COLORS.slateLight }}>
          {muestras.length} productos registrados · {productosSinRegistro.length} sin registrar
        </div>
        {esAdmin && productosSinRegistro.length > 0 && (
          <button style={S.btn()} onClick={() => { setForm({ producto: productosSinRegistro[0], stock: 0, unidad_minima: 10, lote: "" }); setModal("nuevo"); }}>
            + Agregar producto
          </button>
        )}
      </div>

      {/* Productos sin registrar */}
      {esAdmin && productosSinRegistro.length > 0 && (
        <div style={{ ...S.card, borderLeft: `4px solid ${COLORS.warning}`, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.warning, marginBottom: 10 }}>⚠️ Productos sin stock registrado</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {productosSinRegistro.map(p => (
              <div key={p} onClick={() => { setForm({ producto: p, stock: 0, unidad_minima: 10, lote: "" }); setModal("nuevo"); }}
                style={{ background: COLORS.warningBg, border: `1px solid ${COLORS.warning}`, borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600, color: COLORS.warning }}>
                + {p}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={S.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <thead>
              <tr>{["Producto", "Lote", "Stock actual", "Entregadas", "Estado", esAdmin ? "Acción" : ""].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {/* Mostrar todos los productos, incluso los sin registrar */}
              {PRODUCTOS.map(producto => {
                const m = muestras.find(x => x.producto === producto);
                if (!m) {
                  return (
                    <tr key={producto} style={{ opacity: 0.4 }}>
                      <td style={S.td}><b>{producto}</b></td>
                      <td style={S.td}>—</td>
                      <td style={S.td}><span style={{ color: COLORS.slateLight, fontSize: 12 }}>Sin registrar</span></td>
                      <td style={S.td}>—</td>
                      <td style={S.td}>{badge(COLORS.slateLight, COLORS.bg, "Sin datos")}</td>
                      {esAdmin && <td style={S.td}>
                        <button style={{ ...S.btn(), padding: "4px 10px", fontSize: 11 }} onClick={() => { setForm({ producto, stock: 0, unidad_minima: 10, lote: "" }); setModal("nuevo"); }}>+ Registrar</button>
                      </td>}
                    </tr>
                  );
                }
                const critico = m.stock <= m.unidad_minima;
                const total = m.stock + m.entregadas;
                return (
                  <tr key={m.id}>
                    <td style={S.td}><b>{m.producto}</b></td>
                    <td style={{ ...S.td, color: COLORS.slateLight, fontSize: 12 }}>{m.lote || "—"}</td>
                    <td style={S.td}>
                      <div style={{ fontWeight: 700, fontSize: 18, color: critico ? COLORS.danger : COLORS.navy }}>{m.stock}</div>
                      <div style={{ height: 4, background: COLORS.border, borderRadius: 2, width: 80, marginTop: 3 }}>
                        <div style={{ height: 4, background: critico ? COLORS.danger : COLORS.teal, borderRadius: 2, width: `${total > 0 ? Math.min(100, (m.stock / total) * 100) : 0}%` }} />
                      </div>
                    </td>
                    <td style={S.td}>{m.entregadas} uds.</td>
                    <td style={S.td}>{critico ? badge(COLORS.danger, COLORS.dangerBg, "⚠ Crítico") : badge(COLORS.success, COLORS.successBg, "✓ OK")}</td>
                    {esAdmin && <td style={S.td}>
                      <button style={{ ...S.btn("ghost"), padding: "4px 10px", fontSize: 12 }} onClick={() => { setAjuste({ id: m.id, cantidad: 0, tipo: "entregar" }); setModal("ajuste"); }}>📦 Ajustar</button>
                    </td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!esAdmin && (
          <div style={{ textAlign: "center", padding: "12px 0", fontSize: 12, color: COLORS.slateLight, borderTop: `1px solid ${COLORS.border}`, marginTop: 8 }}>
            🔒 Solo Oscar Gutiérrez puede modificar el inventario
          </div>
        )}
      </div>

      {modal === "nuevo" && esAdmin && (
        <Modal title="Registrar stock" onClose={() => setModal(null)}>
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>Producto</label>
            <select style={S.select} value={form.producto || ""} onChange={e => setForm(p => ({ ...p, producto: e.target.value }))}>
              {productosSinRegistro.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div style={S.formRow}>
            <div><label style={S.label}>Stock inicial</label><input style={S.input} type="number" value={form.stock || 0} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} /></div>
            <div><label style={S.label}>Mínimo alerta</label><input style={S.input} type="number" value={form.unidad_minima || 10} onChange={e => setForm(p => ({ ...p, unidad_minima: e.target.value }))} /></div>
          </div>
          <div style={{ marginBottom: 20 }}><label style={S.label}>Lote</label><input style={S.input} value={form.lote || ""} onChange={e => setForm(p => ({ ...p, lote: e.target.value }))} /></div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button style={S.btn("ghost")} onClick={() => setModal(null)}>Cancelar</button>
            <button style={S.btn()} onClick={guardarNuevo} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</button>
          </div>
        </Modal>
      )}

      {modal === "ajuste" && esAdmin && (
        <Modal title="Ajustar inventario" onClose={() => setModal(null)}>
          <div style={{ marginBottom: 16 }}>
            <label style={S.label}>Tipo de movimiento</label>
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              {[["entregar", "📤 Entregar muestras"], ["reponer", "📥 Reponer stock"]].map(([val, lbl]) => (
                <div key={val} onClick={() => setAjuste(a => ({ ...a, tipo: val }))} style={{ flex: 1, padding: 10, borderRadius: 8, border: `2px solid ${ajuste.tipo === val ? COLORS.teal : COLORS.border}`, background: ajuste.tipo === val ? COLORS.tealBg : COLORS.white, cursor: "pointer", textAlign: "center", fontSize: 13, fontWeight: 600, color: ajuste.tipo === val ? COLORS.teal : COLORS.slate }}>{lbl}</div>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Cantidad</label>
            <input style={S.input} type="number" min={0} value={ajuste.cantidad} onChange={e => setAjuste(a => ({ ...a, cantidad: e.target.value }))} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button style={S.btn("ghost")} onClick={() => setModal(null)}>Cancelar</button>
            <button style={S.btn()} onClick={aplicarAjuste} disabled={saving}>{saving ? "Aplicando…" : "Aplicar"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
