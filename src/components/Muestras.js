import { useState } from 'react';
import { COLORS, S } from '../constants';
import Modal from './Modal';

const badge = (color, bg, text) => <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>{text}</span>;

export default function Muestras({ muestras, onAdd, onUpdate }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [ajuste, setAjuste] = useState({ id: null, cantidad: 0, tipo: "entregar" });
  const [saving, setSaving] = useState(false);

  const guardarNuevo = async () => {
    if (!form.producto) return;
    setSaving(true);
    await onAdd({ ...form, stock: Number(form.stock || 0), unidad_minima: Number(form.unidad_minima || 10), entregadas: 0 });
    setSaving(false);
    setModal(null);
  };

  const aplicarAjuste = async () => {
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
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button style={S.btn()} onClick={() => { setForm({ producto: "", stock: 0, unidad_minima: 10, lote: "" }); setModal("nuevo"); }}>+ Agregar producto</button>
      </div>
      <div style={S.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <thead><tr>{["Producto", "Lote", "Stock actual", "Entregadas", "Estado", ""].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {muestras.map(m => {
                const critico = m.stock <= m.unidad_minima;
                const total = m.stock + m.entregadas;
                return (
                  <tr key={m.id}>
                    <td style={S.td}><b>{m.producto}</b></td>
                    <td style={{ ...S.td, color: COLORS.slateLight, fontSize: 12 }}>{m.lote}</td>
                    <td style={S.td}>
                      <div style={{ fontWeight: 700, fontSize: 18, color: critico ? COLORS.danger : COLORS.navy }}>{m.stock}</div>
                      <div style={{ height: 4, background: COLORS.border, borderRadius: 2, width: 80, marginTop: 3 }}>
                        <div style={{ height: 4, background: critico ? COLORS.danger : COLORS.teal, borderRadius: 2, width: `${total > 0 ? Math.min(100, (m.stock / total) * 100) : 0}%` }} />
                      </div>
                    </td>
                    <td style={S.td}>{m.entregadas} uds.</td>
                    <td style={S.td}>{critico ? badge(COLORS.danger, COLORS.dangerBg, "⚠ Crítico") : badge(COLORS.success, COLORS.successBg, "✓ OK")}</td>
                    <td style={S.td}>
                      <button style={{ ...S.btn("ghost"), padding: "4px 10px", fontSize: 12 }} onClick={() => { setAjuste({ id: m.id, cantidad: 0, tipo: "entregar" }); setModal("ajuste"); }}>📦 Ajustar</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modal === "nuevo" && (
        <Modal title="Agregar producto" onClose={() => setModal(null)}>
          <div style={S.formRow}>
            <div><label style={S.label}>Producto *</label><input style={S.input} value={form.producto || ""} onChange={e => setForm(p => ({ ...p, producto: e.target.value }))} /></div>
            <div><label style={S.label}>Lote</label><input style={S.input} value={form.lote || ""} onChange={e => setForm(p => ({ ...p, lote: e.target.value }))} /></div>
          </div>
          <div style={S.formRow}>
            <div><label style={S.label}>Stock inicial</label><input style={S.input} type="number" value={form.stock || 0} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} /></div>
            <div><label style={S.label}>Mínimo alerta</label><input style={S.input} type="number" value={form.unidad_minima || 10} onChange={e => setForm(p => ({ ...p, unidad_minima: e.target.value }))} /></div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button style={S.btn("ghost")} onClick={() => setModal(null)}>Cancelar</button>
            <button style={S.btn()} onClick={guardarNuevo} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</button>
          </div>
        </Modal>
      )}

      {modal === "ajuste" && (
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
