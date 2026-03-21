# 🕒 Sprint de 6 Horas: De Prototipo a App Funcional

Este plan está diseñado para ejecutarse inmediatamente. El objetivo es que al final de estas 6 horas, el CRM tenga persistencia de datos real y un sistema de entrada seguro.

## Bloque 1: Cimientos y Base de Datos (Horas 1-2)
- [ ] **Creación de Tablas en Supabase**:
    - Ejecutar el SQL que proveeré para crear las tablas `leads`, `tasks` y `services`.
    - Configurar los permisos de RLS (Row Level Security) iniciales.
- [ ] **Migración de Mock a Real**:
    - Crear un script/función para cargar los `INITIAL_LEADS` actuales directamente en tu nueva base de datos.
- [ ] **Sincronización del Kanban**:
    - Modificar `KanbanBoard.tsx` para que lea los datos de Supabase.
- [ ] **Knowledge Base & Service Segmentation**:
    - Crear `constants/knowledgeBase.ts` con la identidad de marca, segmentación y enfoque para alimentar a la IA.

## Bloque 2: Autenticación e Inteligencia Operativa (Horas 3-4)
- [ ] **Real-Time Currency Converter**:
    - Implementar un widget/servicio para consulta de divisas (USD/ARS/etc) en tiempo real para presupuestos rápidos.
- [ ] **Login Real & Google Auth**:
    - Reemplazar auth local por Supabase y preparar el botón de Google.
- [ ] **Pantalla de Login Real**:
    - Crear una vista de acceso que conecte con el servicio de Auth de Supabase.
- [ ] **Middleware de Seguridad**:
    - Asegurar que las rutas del CRM solo sean visibles si hay una sesión activa.
- [ ] **Inicio de Google Login**:
    - Dejar preparada la configuración para que solo debas pegar el Client ID de Google.

## Bloque 3: Inteligencia y Operaciones (Horas 5-6)
- [ ] **IA con Contexto Real**:
    - Ajustar el botón "IA Sugiere" para que analice los leads reales que están en la base de datos.
- [ ] **CRUD Completo**:
    - Asegurar que al mover una tarjeta en el Kanban, el cambio se guarde permanentemente en la base de datos.
- [ ] **Despliegue de Prueba**:
    - Subir la versión funcional a Vercel/Netlify con las variables de entorno configuradas.

---

## 🚀 Acción Inmediata Requerida:
1. Necesito que entres a [Supabase](https://supabase.com), crees un proyecto y me pases la **URL** y la **Anon Key** (puedes pegarlas en el `.env.local`).
2. Una vez tengas eso, te pasaré el código SQL para que lo pegues en el "SQL Editor" de Supabase y creemos las tablas en un segundo.
