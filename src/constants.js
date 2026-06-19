export const USUARIOS = [
  { nombre: "Oscar Gutiérrez", rol: "Gerencia", clave: "saed42q045" },
  { nombre: "Angela Almonte", rol: "Gerencia" },
  { nombre: "Miguelina Sanchez", rol: "Gerencia" },
  { nombre: "Pablo Polanco", rol: "Asesor Comercial" },
  { nombre: "Paola Taveras", rol: "Visitador Médico" },
];

export const REPRESENTANTES = USUARIOS.map(u => u.nombre);
export const ESPECIALIDADES = ["Oncología", "Hematología", "Oncología Pediátrica", "Medicina Interna", "Cirugía Oncológica", "Ginecología"];
export const PRODUCTOS = [
  "ANASTROZOL DENK 1 MG",
  "CALCIUM ACTIVE DENK 500 MG 20 COMP.",
  "GRANI-DENK 1 MG/3ML",
  "LETROZOL DENK 2.5 MG",
  "MAGNES ACTIVE DENK 300 MG 30 SOBRES",
  "MAGNES DIRECT DENK 400 MG 30 SOBRES",
  "ON.SETRON-DENK 4 MG ODT",
  "ON.SETRON-DENK 8 MG ODT",
  "ZOLEDRO-DENK 4 MG/5ML",
];

export const COLORS = {
  navy: "#0F2B4C", navyLight: "#1A3F6F",
  teal: "#0E9E8B", tealLight: "#12BBA5", tealBg: "#E8F8F6",
  slate: "#4A5568", slateLight: "#718096",
  bg: "#F0F4F8", white: "#FFFFFF", border: "#E2E8F0",
  danger: "#E53E3E", dangerBg: "#FFF5F5",
  warning: "#D69E2E", warningBg: "#FFFFF0",
  success: "#38A169", successBg: "#F0FFF4",
};

export const SEED_MEDICOS = [];
export const SEED_MUESTRAS = [];

export const fmt = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" }) : "—";
export const today = () => new Date().toISOString().split("T")[0];

export const badge = (color, bg, text) => (
  <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>{text}</span>
);

export const PRIORIDAD_BADGE = {
  Alta: badge(COLORS.danger, COLORS.dangerBg, "● Alta"),
  Media: badge(COLORS.warning, COLORS.warningBg, "● Media"),
  Baja: badge(COLORS.success, COLORS.successBg, "● Baja"),
};

export const RESULTADO_BADGE = {
  Exitosa: badge(COLORS.success, COLORS.successBg, "✓ Exitosa"),
  Pendiente: badge(COLORS.warning, COLORS.warningBg, "⏳ Pendiente"),
  "No exitosa": badge(COLORS.danger, COLORS.dangerBg, "✗ No exitosa"),
};

export const S = {
  app: { display: "flex", height: "100vh", fontFamily: "'Inter', system-ui, sans-serif", background: COLORS.bg, color: COLORS.navy, overflow: "hidden" },
  sidebar: { width: 220, background: COLORS.navy, display: "flex", flexDirection: "column", flexShrink: 0 },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topbar: { background: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, flexShrink: 0 },
  content: { flex: 1, overflowY: "auto", padding: 24 },
  card: { background: COLORS.white, borderRadius: 10, border: `1px solid ${COLORS.border}`, padding: 20, marginBottom: 16 },
  kpiCard: (accent) => ({ background: COLORS.white, borderRadius: 10, border: `1px solid ${COLORS.border}`, padding: "18px 20px", borderTop: `3px solid ${accent}` }),
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 700, color: COLORS.slateLight, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `2px solid ${COLORS.border}`, background: COLORS.bg },
  td: { padding: "11px 14px", fontSize: 13, borderBottom: `1px solid ${COLORS.border}`, verticalAlign: "middle" },
  btn: (v = "primary") => ({ padding: "8px 16px", borderRadius: 7, fontWeight: 600, fontSize: 13, cursor: "pointer", border: "none", background: v === "primary" ? COLORS.teal : v === "danger" ? COLORS.danger : COLORS.bg, color: v === "ghost" ? COLORS.slate : COLORS.white }),
  input: { width: "100%", padding: "8px 12px", borderRadius: 7, border: `1px solid ${COLORS.border}`, fontSize: 13, color: COLORS.navy, background: COLORS.white, boxSizing: "border-box" },
  select: { width: "100%", padding: "8px 12px", borderRadius: 7, border: `1px solid ${COLORS.border}`, fontSize: 13, color: COLORS.navy, background: COLORS.white, boxSizing: "border-box" },
  label: { fontSize: 12, fontWeight: 600, color: COLORS.slate, marginBottom: 4, display: "block" },
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 },
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 },
  modalBox: { background: COLORS.white, borderRadius: 12, padding: 28, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: COLORS.slateLight, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14 },
  navItem: (active, colors) => ({ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", cursor: "pointer", background: active ? "rgba(14,158,139,0.15)" : "transparent", borderLeft: active ? `3px solid ${colors.teal}` : "3px solid transparent", color: active ? colors.tealLight : "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: active ? 600 : 400 }),
};

export const WHATSAPP_BUSINESS = "18292133777";
export const ADMIN_USUARIO = "Oscar Gutiérrez";
