# Backend seguro de Rock

Este backend es un Cloudflare Worker independiente de GitHub Pages. Mantiene `OPENAI_API_KEY` fuera del navegador y expone únicamente `GET /health` y `POST /api/study`.

## Despliegue

1. Crea una cuenta de Cloudflare y entra a **Workers & Pages**.
2. En esta carpeta ejecuta `npm install` y después `npx wrangler login`.
3. Guarda el secreto con `npx wrangler secret put OPENAI_API_KEY`. Pega la clave solamente en la solicitud segura de Wrangler; nunca la escribas en un archivo del repositorio.
4. Revisa `ALLOWED_ORIGINS` en `wrangler.jsonc`.
5. Ejecuta `npm run deploy`.
6. Copia la URL `https://mi-plan-biblico-api....workers.dev` y colócala en **Perfil → Servicio seguro de IA** dentro de la aplicación.

Para desarrollo local, copia `.dev.vars.example` como `.dev.vars`; ese archivo está ignorado por Git. El Worker usa `gpt-5.6-luna` por defecto para controlar costo. Puedes cambiar `OPENAI_MODEL` sin modificar el frontend.

## Seguridad incluida

- lista cerrada de orígenes permitidos;
- validación y límites de entrada;
- clave solo en el servidor;
- `store: false` en la solicitud a OpenAI;
- identificador de seguridad estable pero anonimizado;
- mensajes de error que no revelan detalles internos;
- separación entre respuestas de IA y comentarios atribuidos.

Antes de abrir la app a muchos usuarios añade rate limiting persistente, métricas de costo, autenticación y una política de privacidad. Cloudflare puede complementar el Worker con Rate Limiting Rules o Turnstile.
