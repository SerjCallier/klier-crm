# 🛠️ Guía de Configuración Paso a Paso: Supabase

Sigue estos pasos para activar la persistencia real y la autenticación en tu CRM en menos de 15 minutos.

## 1. Crear el Proyecto
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard/projects).
2. Haz clic en **New Project**.
3. Elige un nombre (ej. `KlierNav CRM`), una contraseña segura para la base de datos y la región más cercana.
4. Espera a que el proyecto se inicialice (tarda 1-2 minutos).

## 2. Configurar la Base de Datos (Automatizado)
Para armar las tablas rápidamente sin hacerlo a mano:
1. En el panel lateral izquierdo, ve a **SQL Editor**.
2. Haz clic en **New Query**.
3. Abre nuestro archivo **[SUPABASE_SCHEMA.sql](../management/SUPABASE_SCHEMA.sql)** en tu editor.
4. Copia todo el contenido y pégalo en el editor de Supabase.
5. Haz clic en **Run**.
6. *¡Listo!* Verás que aparecen las tablas `leads`, `tasks` y `services` en el **Table Editor**.

## 3. Vincular con el CRM
1. Ve a **Project Settings** (icono de engranaje) -> **API**.
2. Copia la `Project URL`.
3. Copia la `anon (public) API key`.
4. Abre tu archivo `.env.local` en VS Code y pégalos:
   ```env
   VITE_SUPABASE_URL=tu_url_aqui
   VITE_SUPABASE_ANON_KEY=tu_key_aqui
   ```

## 4. Cargar Datos Iniciales (Seed)
He preparado un script para que no empieces con la base de datos vacía. 
1. Abre una terminal en la raíz del proyecto.
2. Ejecuta: `npm run seed` (Nota: Implementaré este comando en el siguiente paso).

## 5. Configurar Google Login (Opcional pero Recomendado)
1. Ve a **Authentication** -> **Providers**.
2. Busca **Google** y actívalo.
3. Necesitarás el `Client ID` y `Secret` de tu [Google Cloud Console](https://console.cloud.google.com/).
4. Agrega la `Redirect URL` que te da Supabase a tu configuración de Google OAuth.

---
## 🤖 ¿Se puede automatizar más?
Sí. Si instalas el **Supabase CLI** (`npm install -g supabase`), puedo enviarte comandos para que la base de datos se configure sola desde tu terminal:
```bash
supabase login
supabase init
supabase db push
```
*Por ahora, el método del **SQL Editor** es el más rápido y visual para empezar.*
