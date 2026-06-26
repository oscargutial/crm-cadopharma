import { useState } from 'react';
import { COLORS, PRODUCTOS, REPRESENTANTES, RESULTADO_BADGE, S, fmt, today } from '../constants';
import Modal from './Modal';

export default function Visitas({ visitas, medicos, onAdd, onUpdate, onDelete, usuario, esAdmin }) {
  const [modal, setModal] = useState(null);
  const [filtroRep, setFiltroRep] = useState("");
  const [filtroRes, setFiltroRes] = useState("");
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [geoStatus, setGeoStatus] = useState("");

  const emptyForm = { medico_id: "", representante: usuario, fecha: today(), hora: new Date().toTimeString().slice(0,5), tipo: "Presencial", productos: [], objetivo: "", resultado: "Pendiente", notas: "", proxima_visita: "", latitud: null, longitud: null };

  const filtered = [...visitas]
    .filter(v => (!filtroRep || v.representante === filtroRep) && (!filtroRes || v.resultado === filtroRes))
    .sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));

  const openNuevo = () => {
    setForm(emptyForm);
    setModal("nuevo");
    // Capturar ubicación automáticamente
    setGeoStatus("📍 Obteniendo ubicación...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm(f => ({ ...f, latitud: pos.coords.latitude, longitud: pos.coords.longitude }));
          setGeoStatus("📍 Ubicación capturada ✓");
        },
        () => setGeoStatus("📍 Ubicación no disponible")
      );
    } else {
      setGeoStatus("📍 GPS no disponible en este dispositivo");
    }
  };

  const openEdit = (v) => { setForm({ ...v, productos: Array.isArray(v.productos) ? [...v.productos] : [] }); setModal(v); setGeoStatus(""); };
  const toggleProducto = (p) => setForm(f => ({ ...f, productos: f.productos?.includes(p) ? f.productos.filter(x => x !== p) : [...(f.productos || []), p] }));
  const fld = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const guardar = async () => {
    if (!form.medico_id || !form.representante) return;
    setSaving(true);
    const data = { ...form, medico_id: Number(form.medico_id) };
    if (modal === "nuevo") await onAdd(data);
    else await onUpdate(modal.id, data);
    setSaving(false);
    setModal(null);
  };

  const abrirMapa = (v) => {
    if (v.latitud && v.longitud) {
      window.open(`https://www.google.com/maps?q=${v.latitud},${v.longitud}`, "_blank");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, justifyContent: "space-between", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select style={{ ...S.select, width: 200 }} value={filtroRep} onChange={e => setFiltroRep(e.target.value)}>
            <option value="">Todos los representantes</option>
            {REPRESENTANTES.map(r => <option key={r}>{r}</option>)}
          </select>
          <select style={{ ...S.select, width: 160 }} value={filtroRes} onChange={e => setFiltroRes(e.target.value)}>
            <option value="">Todos los resultados</option>
            {["Exitosa", "Pendiente", "No exitosa"].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <button style={S.btn()} onClick={openNuevo}>+ Registrar visita</button>
      </div>

      <div style={S.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <thead>
              <tr>{["Médico", "Representante", "Fecha", "Tipo", "Productos", "Resultado", "Próxima", "Ubic.", esAdmin ? "Acciones" : ""].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(v => {
                const med = medicos.find(m => m.id === v.medico_id);
                return (
                  <tr key={v.id}>
                    <td style={S.td}>
                      <div style={{ fontWeight: 600 }}>{med?.nombre || "—"}</div>
                      <div style={{ fontSize: 11, color: COLORS.slateLight }}>{med?.especialidad}</div>
                    </td>
                    <td style={S.td}>{v.representante}</td>
                    <td style={S.td}>
                      <div style={{ fontWeight: 600 }}>{fmt(v.fecha)}</div>
                      <div style={{ fontSize: 11, color: COLORS.slateLight }}>{v.hora}</div>
                    </td>
                    <td style={S.td}>{v.tipo}</td>
                    <td style={S.td}>
                      {(Array.isArray(v.productos) ? v.productos : []).map(p => (
                        <span key={p} style={{ display: "inline-block", background: COLORS.tealBg, color: COLORS.teal, fontSize: 10, padding: "2px 6px", borderRadius: 10, marginRight: 3, marginBottom: 2, fontWeight: 600 }}>{p}</span>
                      ))}
                    </td>
                    <td style={S.td}>{RESULTADO_BADGE[v.resultado]}</td>
                    <td style={S.td}><span style={{ fontSize: 12, color: COLORS.teal, fontWeight: 600 }}>{fmt(v.proxima_visita)}</span></td>
                    <td style={S.td}>
                      {v.latitud && v.longitud
                        ? <button onClick={() => abrirMapa(v)} style={{ ...S.btn("ghost"), padding: "4px 8px", fontSize: 13 }} title="Ver en mapa">📍</button>
                        : <span style={{ fontSize: 11, color: COLORS.slateLight }}>—</span>}
                    </td>
                    {esAdmin && (
                      <td style={S.td}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button style={{ ...S.btn("ghost"), padding: "4px 8px", fontSize: 12 }} onClick={() => openEdit(v)}>✏️</button>
                          <button style={{ ...S.btn("danger"), padding: "4px 8px", fontSize: 12 }} onClick={() => { if (window.confirm("¿Eliminar visita?")) onDelete(v.id); }}>🗑</button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ textAlign: "center", padding: 32, color: COLORS.slateLight }}>Sin visitas registradas.</div>}
        </div>
      </div>

      {modal && (
        <Modal title={modal === "nuevo" ? "Registrar visita" : "Editar visita"} onClose={() => setModal(null)}>
          {geoStatus && (
            <div style={{ background: COLORS.tealBg, color: COLORS.teal, padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, marginBottom: 14 }}>
              {geoStatus}
            </div>
          )}
          <div style={S.formRow}>
            <div>
              <label style={S.label}>Médico *</label>
              <select style={S.select} value={form.medico_id || ""} onChange={e => fld("medico_id", e.target.value)}>
                <option value="">Seleccionar</option>
                {medicos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>Representante *</label>
              <select style={S.select} value={form.representante || ""} onChange={e => fld("representante", e.target.value)}>
                <option value="">Seleccionar</option>
                {REPRESENTANTES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div style={S.formRow}>
            <div><label style={S.label}>Fecha</label><input style={S.input} type="date" value={form.fecha || ""} onChange={e => fld("fecha", e.target.value)} /></div>
            <div><label style={S.label}>Hora</label><input style={S.input} type="time" value={form.hora || ""} onChange={e => fld("hora", e.target.value)} /></div>
          </div>
          <div style={S.formRow}>
            <div>
              <label style={S.label}>Tipo</label>
              <select style={S.select} value={form.tipo || "Presencial"} onChange={e => fld("tipo", e.target.value)}>
                {["Presencial", "Virtual", "Telefónica"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>Resultado</label>
              <select style={S.select} value={form.resultado || "Pendiente"} onChange={e => fld("resultado", e.target.value)}>
                {["Exitosa", "Pendiente", "No exitosa"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>Productos</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
              {PRODUCTOS.map(p => (
                <div key={p} onClick={() => toggleProducto(p)} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer", background: (form.productos || []).includes(p) ? COLORS.teal : COLORS.bg, color: (form.productos || []).includes(p) ? COLORS.white : COLORS.slate, border: `1px solid ${(form.productos || []).includes(p) ? COLORS.teal : COLORS.border}` }}>{p}</div>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}><label style={S.label}>Objetivo</label><input style={S.input} value={form.objetivo || ""} onChange={e => fld("objetivo", e.target.value)} /></div>
          <div style={S.formRow}>
            <div><label style={S.label}>Notas</label><textarea style={{ ...S.input, height: 60, resize: "vertical" }} value={form.notas || ""} onChange={e => fld("notas", e.target.value)} /></div>
            <div><label style={S.label}>Próxima visita</label><input style={S.input} type="date" value={form.proxima_visita || ""} onChange={e => fld("proxima_visita", e.target.value)} /></div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button style={S.btn("ghost")} onClick={() => setModal(null)}>Cancelar</button>
            <button style={S.btn()} onClick={guardar} disabled={saving}>{saving ? "Guardando…" : "Guardar visita"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
