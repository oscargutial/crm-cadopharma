-- ══════════════════════════════════════════════
-- CRM CADOPHARMA — Actualización v2
-- Ejecutar en Supabase → SQL Editor → New Query
-- ══════════════════════════════════════════════

-- Agregar columna cumpleaños a médicos
ALTER TABLE medicos ADD COLUMN IF NOT EXISTS cumpleanos DATE;

-- TABLA: recordatorios
CREATE TABLE IF NOT EXISTS recordatorios (
  id               BIGSERIAL PRIMARY KEY,
  titulo           TEXT NOT NULL,
  tipo             TEXT DEFAULT 'Otro',
  fecha            DATE NOT NULL,
  hora             TEXT,
  descripcion      TEXT,
  medico_id        BIGINT REFERENCES medicos(id) ON DELETE SET NULL,
  completado       BOOLEAN DEFAULT FALSE,
  usuario_creador  TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Permisos
ALTER TABLE recordatorios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON recordatorios FOR ALL USING (true) WITH CHECK (true);

-- Tiempo real
ALTER PUBLICATION supabase_realtime ADD TABLE recordatorios;
