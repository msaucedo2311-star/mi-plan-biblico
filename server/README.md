# Contrato del backend

Esta carpeta documenta el límite de seguridad; el backend no se despliega en GitHub Pages.

Implementa `POST /api/study` en una plataforma con funciones de servidor (por ejemplo Cloudflare Workers, Vercel Functions, Netlify Functions o un servidor propio). La clave del proveedor de IA debe leerse de una variable de entorno del servidor. El navegador solo conoce la URL pública del proxy.

Validación mínima:

```js
const passage = String(body.passage || '').trim().slice(0, 100);
const question = String(body.question || '').trim().slice(0, 1500);
const allowedProfiles = ['Bautista conservador', 'Cristiano evangélico', 'Exploración amplia'];
if (!passage || !question || !allowedProfiles.includes(body.profile?.doctrine)) {
  return new Response('Solicitud inválida', { status: 400 });
}
```

El mensaje de sistema debería exigir: interpretación contextual; distinción entre texto, inferencia y aplicación; postura bautista/conservadora cuando esté seleccionada; exposición honesta y breve de alternativas cristianas relevantes; rechazo de citas inventadas; atribución enlazable de fuentes recuperadas; y separación entre contenido de fuentes y redacción del modelo.

No registres el contenido completo del diario ni preguntas personales por defecto. Añade CORS restringido, límites por IP/usuario, autenticación si corresponde, moderación apropiada y tiempos máximos de respuesta.
