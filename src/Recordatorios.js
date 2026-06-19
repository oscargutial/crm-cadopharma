import { useState, useEffect } from 'react';
import { COLORS, S, WHATSAPP_BUSINESS, ADMIN_USUARIO, fmt, today } from '../constants';
import Modal from './Modal';

const badge = (color, bg, text) => <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>{text}</span>;

const TIPOS_RECORDATORIO = [
  "Visita médica programada",
  "Seguimiento de muestra",
  "Cumpleaños de médico",
  "Reunión interna",
  "Entrega de material promocional",
  "Otro",
];

export default function Recordatorios({ recordatorios, onAdd, onUpdate, onDelete, usuario, medicos }) {
  const [modal, setModal] = useState(null);
  const [filtro, setFiltro] = useState("pendientes");
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const hoy = today();
  const emptyForm = {
    titulo: "", tipo: "Visita médica programada", fecha: hoy, hora: "08:00",
    descripcion: "", medico_id: "", completado: false, usuario_creador: usuario,
  };

  // Recordatorios vencidos hoy
  const vencenHoy = recordatorios.filter(r => r.fecha === hoy && !r.completado);
  const pendientes = recordatorios.filter(r => r.fecha >= hoy && !r.completado).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const completados = recordatorios.filter(r => r.completado).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const vencidos = recordatorios.filter(r => r.fecha < hoy && !r.completado).sort((a, b) => b.fecha.localeCompare(a.fecha));

  const lista = filtro === "pendientes" ? pendientes : filtro === "completados" ? completados : vencidos;

  const openNuevo = () => { setForm(emptyForm); setModal("nuevo"); };
  const openEdit = (r) => { setForm({ ...r }); setModal(r); };
  const fld = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const guardar = async () => {
    if (!form.titulo || !form.fecha) return;
    setSaving(true);
    if (modal === "nuevo") await onAdd({ ...form, completado: false });
    else await onUpdate(modal.id, form);
    setSaving(false);
    setModal(null);
  };

  const marcarCompleto = async (r) => {
    await onUpdate(r.id, { ...r, completado: !r.completado });
  };

  const enviarWhatsApp = (r) => {
    const med = medicos.find(m => m.id === r.medico_id);
    const texto = encodeURIComponent(
      `🔔 *Recordatorio CRM Cadopharma*\n\n` +
      `📌 *${r.titulo}*\n` +
      `📅 Fecha: ${fmt(r.fecha)} ${r.hora ? `a las ${r.hora}` : ""}\n` +
      (med ? `👨‍⚕️ Médico: ${med.nombre}\n` : "") +
      (r.descripcion ? `📝 ${r.descripcion}` : "")
    );
    window.open(`https://wa.me/${WHATSAPP_BUSINESS}?text=${texto}`, "_blank");
  };

  const tipoColor = {
    "Visita médica programada": [COLORS.teal, COLORS.tealBg],
    "Seguimiento de muestra": [COLORS.navy, "#EEF2FF"],
    "Cumpleaños de médico": ["#D69E2E", "#FFFFF0"],
    "Reunión interna": [COLORS.slate, COLORS.bg],
    "Entrega de material promocional": [COLORS.success, COLORS.successBg],
    "Otro": [COLORS.slateLight, COLORS.bg],
  };

  return (
    <div>
      {/* Alertas del día */}
      {vencenHoy.length > 0 && (
        <div style={{ background: "#FFF8E1", border: `2px solid #F59E0B`, borderRadius: 10, padding: "14px 18px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, color: "#92400E", fontSize: 14 }}>🔔 {vencenHoy.length} recordatorio{vencenHoy.length > 1 ? "s" : ""} para HOY</div>
            <div style={{ fontSize: 12, color: "#92400E", marginTop: 2 }}>{vencenHoy.map(r => r.titulo).join(" · ")}</div>
          </div>
          <button style={{ ...S.btn(), background: "#F59E0B", fontSize: 12, padding: "6px 12px" }} onClick={() => setFiltro("pendientes")}>Ver</button>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {[["pendientes", `Pendientes (${pendientes.length})`], ["vencidos", `Vencidos (${vencidos.length})`], ["completados", `Completados (${completados.length})`]].map(([val, lbl]) => (
            <button key={val} onClick={() => setFiltro(val)} style={{ ...S.btn(filtro === val ? "primary" : "ghost"), padding: "6px 14px", fontSize: 12 }}>{lbl}</button>
          ))}
        </div>
        <button style={S.btn()} onClick={openNuevo}>+ Nuevo recordatorio</button>
      </div>

      <div style={S.card}>
        {lista.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: COLORS.slateLight }}>
            {filtro === "pendientes" ? "No hay recordatorios pendientes." : filtro === "vencidos" ? "No hay recordatorios vencidos." : "No hay recordatorios completados."}
          </div>
        ) : lista.map(r => {
          const med = medicos.find(m => m.id === r.medico_id);
          const [tc, tb] = tipoColor[r.tipo] || [COLORS.slate, COLORS.bg];
          const esHoy = r.fecha === hoy;
          return (
            <div key={r.id} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 0", borderBottom: `1px solid ${COLORS.border}`, opacity: r.completado ? 0.6 : 1 }}>
              <div onClick={() => marcarCompleto(r)} style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${r.completado ? COLORS.success : COLORS.border}`, background: r.completado ? COLORS.success : COLORS.white, cursor: "pointer", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.white, fontSize: 12 }}>
                {r.completado ? "✓" : ""}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 6 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 14, textDecoration: r.completado ? "line-through" : "none" }}>{r.titulo}</span>
                    {esHoy && !r.completado && <span style={{ marginLeft: 8, background: "#F59E0B", color: COLORS.white, fontSize: 10, padding: "2px 7px", borderRadius: 10, fontWeight: 700 }}>HOY</span>}
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {badge(tc, tb, r.tipo)}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: COLORS.slateLight, marginTop: 4, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span>📅 {fmt(r.fecha)} {r.hora && `· ${r.hora}`}</span>
                  {med && <span>👨‍⚕️ {med.nombre}</span>}
                  <span>👤 {r.usuario_creador}</span>
                </div>
                {r.descripcion && <div style={{ fontSize: 12, color: COLORS.slate, marginTop: 4 }}>📝 {r.descripcion}</div>}
              </div>
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <button title="Enviar por WhatsApp" style={{ ...S.btn("ghost"), padding: "4px 8px", fontSize: 14 }} onClick={() => enviarWhatsApp(r)}>📲</button>
                <button style={{ ...S.btn("ghost"), padding: "4px 8px", fontSize: 12 }} onClick={() => openEdit(r)}>✏️</button>
                {(usuario === ADMIN_USUARIO) && (
                  <button style={{ ...S.btn("danger"), padding: "4px 8px", fontSize: 12 }} onClick={() => { if (window.confirm("¿Eliminar recordatorio?")) onDelete(r.id); }}>🗑</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <Modal title={modal === "nuevo" ? "Nuevo recordatorio" : "Editar recordatorio"} onClose={() => setModal(null)}>
          <div style={{ marginBottom: 14 }}><label style={S.label}>Título *</label><input style={S.input} value={form.titulo || ""} onChange={e => fld("titulo", e.target.value)} placeholder="Ej: Visita al Dr. Pérez" /></div>
          <div style={S.formRow}>
            <div><label style={S.label}>Tipo</label>
              <select style={S.select} value={form.tipo || ""} onChange={e => fld("tipo", e.target.value)}>
                {TIPOS_RECORDATORIO.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label style={S.label}>Médico (opcional)</label>
              <select style={S.select} value={form.medico_id || ""} onChange={e => fld("medico_id", e.target.value ? Number(e.target.value) : "")}>
                <option value="">— Ninguno —</option>
                {medicos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>
          </div>
          <div style={S.formRow}>
            <div><label style={S.label}>Fecha *</label><input style={S.input} type="date" value={form.fecha || ""} onChange={e => fld("fecha", e.target.value)} /></div>
            <div><label style={S.label}>Hora</label><input style={S.input} type="time" value={form.hora || ""} onChange={e => fld("hora", e.target.value)} /></div>
          </div>
          <div style={{ marginBottom: 20 }}><label style={S.label}>Descripción / Notas</label><textarea style={{ ...S.input, height: 70, resize: "vertical" }} value={form.descripcion || ""} onChange={e => fld("descripcion", e.target.value)} /></div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button style={S.btn("ghost")} onClick={() => setModal(null)}>Cancelar</button>
            <button style={S.btn()} onClick={guardar} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
