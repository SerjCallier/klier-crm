-- TABLA DE LEADS
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT,
  value NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'NEW',
  tags TEXT[],
  owner_id UUID,
  service_type TEXT,
  lead_source TEXT,
  score INTEGER DEFAULT 0,
  score_justification TEXT,
  urgency_level TEXT DEFAULT 'medium',
  closing_strategy TEXT,
  last_contact TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA DE TAREAS
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA DE SERVICIOS
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC,
  sla_hours INTEGER,
  features TEXT[],
  is_active BOOLEAN DEFAULT TRUE
);

-- HABILITAR SEGURIDAD (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS BÁSICAS (LECTURA PARA TODOS LOS AUTENTICADOS)
CREATE POLICY "Allow authenticated read" ON leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON services FOR SELECT TO authenticated USING (true);
