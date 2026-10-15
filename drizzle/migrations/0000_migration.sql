CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  assignee text NOT NULL CHECK (assignee IN ('sheila','diego')),
  created_by text NOT NULL CHECK (created_by IN ('sheila','diego')),
  date date NOT NULL,
  done boolean NOT NULL DEFAULT false,
  seen boolean NOT NULL DEFAULT false,
  template_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.weekly_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_templates TO anon, authenticated;
GRANT ALL ON public.tasks TO service_role;
GRANT ALL ON public.weekly_templates TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shared tasks" ON public.tasks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "shared templates" ON public.weekly_templates FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.weekly_templates;
INSERT INTO public.weekly_templates (title) VALUES
('Fregar los platos'),('Aspirar'),('Poner lavadora'),('Sacar la basura'),('Limpiar baño'),('Hacer la compra'),('Cocinar');