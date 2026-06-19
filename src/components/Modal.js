import { COLORS, S } from '../constants';

export default function Modal({ title, onClose, children }) {
  return (
    <div style={S.modal} onClick={onClose}>
      <div style={S.modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy }}>{title}</span>
          <button onClick={onClose} style={{ ...S.btn("ghost"), padding: "4px 10px", fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
