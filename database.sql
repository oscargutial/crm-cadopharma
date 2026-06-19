-- ══════════════════════════════════════════════
-- CRM CADOPHARMA — Script de base de datos
-- Ejecutar en Supabase → SQL Editor → New Query
-- ══════════════════════════════════════════════

-- TABLA: médicos
CREATE TABLE IF NOT EXISTS medicos (
  id          BIGSERIAL PRIMARY KEY,
  nombre      TEXT NOT NULL,
  especialidad TEXT,
  institucion TEXT,
  ciudad      TEXT,
  telefono    TEXT,
  email       TEXT,
  prioridad   TEXT DEFAULT 'Media',
  notas       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA: visitas
CREATE TABLE IF NOT EXISTS visitas (
  id             BIGSERIAL PRIMARY KEY,
  medico_id      BIGINT REFERENCES medicos(id) ON DELETE SET NULL,
  representante  TEXT NOT NULL,
  fecha          DATE,
  hora           TEXT,
  tipo           TEXT DEFAULT 'Presencial',
  productos      TEXT[],
  objetivo       TEXT,
  resultado      TEXT DEFAULT 'Pendiente',
  notas          TEXT,
  proxima_visita DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA: muestras
CREATE TABLE IF NOT EXISTS muestras (
  id            BIGSERIAL PRIMARY KEY,
  producto      TEXT NOT NULL,
  lote          TEXT,
  stock         INTEGER DEFAULT 0,
  unidad_minima INTEGER DEFAULT 10,
  entregadas    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── DATOS INICIALES ─────────────────────────────

INSERT INTO medicos (nombre, especialidad, institucion, ciudad, telefono, email, prioridad, notas) VALUES
  ('Dr. Rafael Pérez', 'Oncología', 'CEDIMAT', 'Santo Domingo', '809-555-0101', 'rperez@cedimat.do', 'Alta', 'Prescriptor frecuente de Herzuma'),
  ('Dra. Carmen Lucía Matos', 'Hematología', 'ONCOSERV', 'Santiago', '809-555-0202', 'cmatos@oncoserv.do', 'Alta', 'Principal contacto ONCOSERV Santiago'),
  ('Dr. Juan Pablo Soto', 'Oncología', 'Hospital Metropolitano', 'Santiago', '809-555-0303', 'jsoto@hms.do', 'Media', 'Interés en línea Denkpharma'),
  ('Dra. María Elena Cruz', 'Oncología Pediátrica', 'Hospital Robert Reid Cabral', 'Santo Domingo', '809-555-0404', 'mcruz@rrc.do', 'Alta', ''),
  ('Dr. Andrés Familia', 'Medicina Interna', 'Clínica Corominas', 'Santiago', '809-555-0505', 'afamilia@corominas.do', 'Baja', '');

INSERT INTO muestras (producto, lote, stock, unidad_minima, entregadas) VALUES
  ('Herzuma', 'HZ-2025-04', 45, 10, 8),
  ('Denkpharma A', 'DK-2025-03', 30, 8, 0),
  ('Denkpharma B', 'DK-2025-03B', 12, 10, 3),
  ('Amipharma', 'AM-2025-05', 60, 15, 5);

-- ── PERMISOS (para que la app pueda leer/escribir) ──

ALTER TABLE medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE muestras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON medicos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON visitas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON muestras FOR ALL USING (true) WITH CHECK (true);

-- ── TIEMPO REAL (para sincronización instantánea) ──

ALTER PUBLICATION supabase_realtime ADD TABLE medicos;
ALTER PUBLICATION supabase_realtime ADD TABLE visitas;
ALTER PUBLICATION supabase_realtime ADD TABLE muestras;
