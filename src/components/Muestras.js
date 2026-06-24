import { useState } from 'react';
import { COLORS, PRODUCTOS, S, ADMIN_USUARIO } from '../constants';
import Modal from './Modal';

const badge = (color, bg, text) => <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>{text}</span>;

export default function Muestras({ muestras, onAdd, onUpdate, onDelete, usuario }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [ajuste, setAjuste] = useState({ id: null, cantidad: 0, tipo: "entregar", notas: "" });
  const [saving, setSaving] = useState(false);

  const esAdmin = usuario === ADMIN_USUARIO;

  const productosRegistrados = muestras.map(m => m.producto);
  const productosSinRegistro = PRODUCTOS.filter(p => !productosRegistrados.includes(p));

  const guardarNuevo = async () => {
    if (!form.producto) return;
    setSaving(true);
    await onAdd({
      producto: form.producto,
      lote: form.lote || "",
      stock: Number(form.stock || 0),
      unidad_minima: Number(form.unidad_minima || 5),
      entregadas: 0,
    });
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
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 13, color: COLORS.slateLight }}>
          {muestras.length} de {PRODUCTOS.length} productos registrados
        </div>
        {esAdmin && productosSinRegistro.length > 0 && (
          <button style={S.btn()} onClick={() => { setForm({ producto: productosSinRegistro[0], stock: 0, unidad_minima: 5, lote: "" }); setModal("nuevo"); }}>
            + Registrar producto
          </button>
        )}
      </div>

      {/* Productos sin registrar */}
      {productosSinRegistro.length > 0 && (
        <div style={{ ...S.card, borderLeft: `4px solid ${COLORS.warning}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.warning, marginBottom: 10 }}>
            📦 Productos sin stock registrado ({productosSinRegistro.length})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {productosSinRegistro.map(p => (
              <div key={p}
                onClick={() => esAdmin && (setForm({ producto: p, stock: 0, unidad_minima: 5, lote: "" }), setModal("nuevo"))}
                style={{ background: COLORS.warningBg, border: `1px solid ${COLORS.warning}`, borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: esAdmin ? "pointer" : "default", fontWeight: 600, color: COLORS.warning }}>
                {esAdmin ? "+ " : ""}{p}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla de productos registrados */}
      <div style={S.card}>
        <div style={S.sectionTitle}>Inventario de muestras</div>
        {muestras.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: COLORS.slateLight }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>No hay productos registrados aún</div>
            {esAdmin && <div style={{ fontSize: 12 }}>Usa el botón "Registrar producto" para agregar stock</div>}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={S.table}>
              <thead>
                <tr>{["Producto", "Lote", "Stock", "Entregadas", "Estado", esAdmin ? "Acciones" : ""].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {muestras.map(m => {
                  const critico = m.stock <= m.unidad_minima;
                  const total = m.stock + m.entregadas;
                  return (
                    <tr key={m.id}>
                      <td style={S.td}><b style={{ fontSize: 13 }}>{m.producto}</b></td>
                      <td style={{ ...S.td, color: COLORS.slateLight, fontSize: 12 }}>{m.lote || "—"}</td>
                      <td style={S.td}>
                        <div style={{ fontWeight: 700, fontSize: 20, color: critico ? COLORS.danger : COLORS.navy }}>{m.stock}</div>
                        <div style={{ height: 4, background: COLORS.border, borderRadius: 2, width: 80, marginTop: 3 }}>
                          <div style={{ height: 4, background: critico ? COLORS.danger : COLORS.teal, borderRadius: 2, width: `${total > 0 ? Math.min(100, (m.stock / total) * 100) : 0}%` }} />
                        </div>
                      </td>
                      <td style={{ ...S.td, fontWeight: 600 }}>{m.entregadas} uds.</td>
                      <td style={S.td}>{critico ? badge(COLORS.danger, COLORS.dangerBg, "⚠ Stock bajo") : badge(COLORS.success, COLORS.successBg, "✓ Disponible")}</td>
                      {esAdmin && (
                        <td style={S.td}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button style={{ ...S.btn("ghost"), padding: "4px 10px", fontSize: 12 }}
                              onClick={() => { setAjuste({ id: m.id, cantidad: 0, tipo: "entregar", notas: "" }); setModal("ajuste"); }}>
                              📦 Ajustar
                            </button>
                            <button style={{ ...S.btn("danger"), padding: "4px 8px", fontSize: 12 }}
                              onClick={() => { if (window.confirm(`¿Eliminar ${m.producto}?`)) onDelete(m.id); }}>
                              🗑
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!esAdmin && (
          <div style={{ textAlign: "center", padding: "10px 0", fontSize: 12, color: COLORS.slateLight, borderTop: `1px solid ${COLORS.border}`, marginTop: 8 }}>
            🔒 Solo Oscar Gutiérrez puede modificar el inventario
          </div>
        )}
      </div>

      {/* Modal nuevo producto */}
      {modal === "nuevo" && esAdmin && (
        <Modal title="Registrar stock de producto" onClose={() => setModal(null)}>
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>Producto *</label>
            <select style={S.select} value={form.producto || ""} onChange={e => setForm(p => ({ ...p, producto: e.target.value }))}>
              {productosSinRegistro.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div style={S.formRow}>
            <div><label style={S.label}>Stock inicial (unidades)</label><input style={S.input} type="number" min={0} value={form.stock || 0} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} /></div>
            <div><label style={S.label}>Alerta mínima</label><input style={S.input} type="number" min={0} value={form.unidad_minima || 5} onChange={e => setForm(p => ({ ...p, unidad_minima: e.target.value }))} /></div>
          </div>
          <div style={{ marginBottom: 20 }}><label style={S.label}>Lote (opcional)</label><input style={S.input} value={form.lote || ""} onChange={e => setForm(p => ({ ...p, lote: e.target.value }))} /></div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button style={S.btn("ghost")} onClick={() => setModal(null)}>Cancelar</button>
            <button style={S.btn()} onClick={guardarNuevo} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</button>
          </div>
        </Modal>
      )}

      {/* Modal ajuste */}
      {modal === "ajuste" && esAdmin && (
        <Modal title="Registrar movimiento de muestras" onClose={() => setModal(null)}>
          <div style={{ marginBottom: 16 }}>
            <label style={S.label}>Tipo de movimiento</label>
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              {[["entregar", "📤 Entrega de muestras"], ["reponer", "📥 Reposición de stock"]].map(([val, lbl]) => (
                <div key={val} onClick={() => setAjuste(a => ({ ...a, tipo: val }))}
                  style={{ flex: 1, padding: 12, borderRadius: 8, border: `2px solid ${ajuste.tipo === val ? COLORS.teal : COLORS.border}`, background: ajuste.tipo === val ? COLORS.tealBg : COLORS.white, cursor: "pointer", textAlign: "center", fontSize: 13, fontWeight: 600, color: ajuste.tipo === val ? COLORS.teal : COLORS.slate }}>
                  {lbl}
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>Cantidad</label>
            <input style={S.input} type="number" min={0} value={ajuste.cantidad} onChange={e => setAjuste(a => ({ ...a, cantidad: e.target.value }))} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Notas (opcional)</label>
            <input style={S.input} value={ajuste.notas} onChange={e => setAjuste(a => ({ ...a, notas: e.target.value }))} placeholder="Ej: Entregado al Dr. Pérez" />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button style={S.btn("ghost")} onClick={() => setModal(null)}>Cancelar</button>
            <button style={S.btn()} onClick={aplicarAjuste} disabled={saving}>{saving ? "Aplicando…" : "Confirmar"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}