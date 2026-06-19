import { useState } from 'react';
import { COLORS, ESPECIALIDADES, PRIORIDAD_BADGE, S } from '../constants';
import Modal from './Modal';

export default function Medicos({ medicos, onAdd, onUpdate, onDelete, visitas }) {
  const [modal, setModal] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const emptyForm = { nombre: "", especialidad: "", institucion: "", ciudad: "", telefono: "", email: "", prioridad: "Media", notas: "" };
  const filtered = medicos.filter(m =>
    [m.nombre, m.especialidad, m.institucion, m.ciudad].join(" ").toLowerCase().includes(filtro.toLowerCase())
  );

  const openNuevo = () => { setForm(emptyForm); setModal("nuevo"); };
  const openEdit = (m) => { setForm({ ...m }); setModal(m); };

  const guardar = async () => {
    if (!form.nombre) return;
    setSaving(true);
    if (modal === "nuevo") await onAdd(form);
    else await onUpdate(modal.id, form);
    setSaving(false);
    setModal(null);
  };

  const f = (field, val) => setForm(p => ({ ...p, [field]: val }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, gap: 10, flexWrap: "wrap" }}>
        <input style={{ ...S.input, maxWidth: 300 }} placeholder="Buscar por nombre, especialidad, institución…" value={filtro} onChange={e => setFiltro(e.target.value)} />
        <button style={S.btn()} onClick={openNuevo}>+ Nuevo médico</button>
      </div>

      <div style={S.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <thead>
              <tr>{["Médico", "Especialidad", "Institución", "Ciudad", "Prioridad", "Visitas", ""].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id}>
                  <td style={S.td}>
                    <div style={{ fontWeight: 600 }}>{m.nombre}</div>
                    <div style={{ fontSize: 11, color: COLORS.slateLight }}>{m.email}</div>
                  </td>
                  <td style={S.td}>{m.especialidad}</td>
                  <td style={S.td}>{m.institucion}</td>
                  <td style={S.td}>{m.ciudad}</td>
                  <td style={S.td}>{PRIORIDAD_BADGE[m.prioridad]}</td>
                  <td style={S.td}><b style={{ color: COLORS.teal }}>{visitas.filter(v => v.medico_id === m.id).length}</b></td>
                  <td style={S.td}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button style={{ ...S.btn("ghost"), padding: "4px 10px", fontSize: 12 }} onClick={() => openEdit(m)}>✏️ Editar</button>
                      <button style={{ ...S.btn("danger"), padding: "4px 10px", fontSize: 12 }} onClick={() => { if (window.confirm("¿Eliminar este médico?")) onDelete(m.id); }}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ textAlign: "center", padding: 32, color: COLORS.slateLight }}>No hay médicos registrados.</div>}
        </div>
      </div>

      {modal && (
        <Modal title={modal === "nuevo" ? "Nuevo médico" : "Editar médico"} onClose={() => setModal(null)}>
          <div style={S.formRow}>
            <div><label style={S.label}>Nombre *</label><input style={S.input} value={form.nombre || ""} onChange={e => f("nombre", e.target.value)} /></div>
            <div><label style={S.label}>Especialidad</label>
              <select style={S.select} value={form.especialidad || ""} onChange={e => f("especialidad", e.target.value)}>
                <option value="">Seleccionar</option>
                {ESPECIALIDADES.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>
          <div style={S.formRow}>
            <div><label style={S.label}>Institución</label><input style={S.input} value={form.institucion || ""} onChange={e => f("institucion", e.target.value)} /></div>
            <div><label style={S.label}>Ciudad</label><input style={S.input} value={form.ciudad || ""} onChange={e => f("ciudad", e.target.value)} /></div>
          </div>
          <div style={S.formRow}>
            <div><label style={S.label}>Teléfono</label><input style={S.input} value={form.telefono || ""} onChange={e => f("telefono", e.target.value)} /></div>
            <div><label style={S.label}>Email</label><input style={S.input} type="email" value={form.email || ""} onChange={e => f("email", e.target.value)} /></div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>Prioridad</label>
            <select style={S.select} value={form.prioridad || "Media"} onChange={e => f("prioridad", e.target.value)}>
              {["Alta", "Media", "Baja"].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Notas</label>
            <textarea style={{ ...S.input, height: 70, resize: "vertical" }} value={form.notas || ""} onChange={e => f("notas", e.target.value)} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button style={S.btn("ghost")} onClick={() => setModal(null)}>Cancelar</button>
            <button style={S.btn()} onClick={guardar} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
