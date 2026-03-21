# Documentación de Configuración y Comandos - kliernav-crm-app

Este documento registra los pasos seguidos para configurar y previsualizar el proyecto.

## Comandos Ejecutados

1.  **Vigilar el estado inicial:**
    *   Comando: `ls` (listado de archivos) para identificar la estructura del proyecto.
2.  **Intento de inicio de servidor:**
    *   Comando: `npm run dev`
    *   *Resultado:* Falló debido a la falta de `node_modules` y políticas de ejecución de PowerShell.
3.  **Instalación de dependencias (Primer intento):**
    *   Comando: `npm install`
    *   *Resultado:* Falló porque la versión `@google/genai@^0.2.1` especificada en `package.json` no existe en el registro de npm.
4.  **Corrección de versión:**
    *   Acción: Se actualizó `package.json` para usar `@google/genai@^1.38.0` (la versión estable más reciente).
5.  **Instalación de dependencias (Exitoso):**
    *   Comando: `cmd /c npm install`
    *   *Resultado:* Se instalaron 196 paquetes correctamente.
6.  **Inicio de servidor de desarrollo:**
    *   Comando: `cmd /c npm run dev`
    *   *Resultado:* Servidor iniciado en `http://localhost:5173/kliernav-crm-app/`.
7.  **Instalación de Supabase y Axios:**
    *   Comando: `cmd /c npm install @supabase/supabase-js axios`

## Cambios Realizados en el Código

-   **Archivo:** `package.json`
    -   Actualización de `@google/genai`.
-   **Nuevos Servicios:**
    -   `currencyService.ts`: Consulta de divisas en tiempo real.
    -   `supabaseClient.ts`: Conexión con el backend.
-   **Identidad de Marca:**
    -   `constants/knowledgeBase.ts`: Contexto para la IA.

## Acceso al Proyecto
-   **URL Local:** [http://localhost:5173/kliernav-crm-app/](http://localhost:5173/kliernav-crm-app/)
