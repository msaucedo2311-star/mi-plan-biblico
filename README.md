# Mi Plan Bíblico

PWA móvil de estudio bíblico de 12 semanas. Funciona sin conexión después de la primera visita, guarda el avance localmente y está preparada para incorporar sincronización e IA mediante un backend seguro.

## Estado actual

El proyecto ya tiene tres piezas:

1. **PWA web** publicada con GitHub Pages.
2. **Aplicación Android nativa** generada en `android/` con Capacitor 8, icono, splash y notificaciones locales.
3. **Backend seguro de Rock** en `backend/`, listo para desplegar como Cloudflare Worker con la clave de OpenAI guardada como secreto.

Consulta [MOBILE.md](MOBILE.md) para obtener el APK de prueba y [backend/README.md](backend/README.md) para conectar la IA.

## Qué incluye

- Plan completo de 12 semanas y 84 lecturas.
- Checklist diario “Listo, leído”, avance total/semanal y racha.
- Versículo semanal, diario espiritual y reflexiones por pasaje.
- Buscador de referencias y pantalla de estudio guiado.
- Comentarios bíblicos atribuidos y visualmente separados de la explicación de IA.
- Asistente “Rock” con perfil doctrinal configurable. El enfoque predeterminado es bautista conservador; puede presentar otras interpretaciones cristianas relevantes sin confundirlas con la perspectiva principal.
- Calendario implícito mediante fecha de inicio y asignación diaria; el avance conserva la fecha real en que se completó cada lectura.
- Preferencias de recordatorio y solicitud de permiso de notificaciones.
- Guardado local, exportación e importación en JSON.
- PWA instalable, caché sin conexión y despliegue automático a GitHub Pages.
- Capa de API desacoplada: no hay claves privadas en el frontend.

## Probar localmente

No hay dependencias de producción ni proceso de compilación obligatorio. Se necesita Node.js 18 o posterior solo para las herramientas de proyecto.

```bash
npm run check
npm run dev
```

Abre `http://localhost:4173`. También puede servirse con cualquier servidor HTTP estático. No abras `index.html` directamente como archivo: el service worker y los módulos necesitan HTTP/HTTPS.

Para producir una carpeta publicable:

```bash
npm run build
```

El resultado queda en `dist/`.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub y sube el contenido de este proyecto a la rama `main`.
2. En el repositorio abre **Settings → Pages**.
3. En **Build and deployment**, selecciona **GitHub Actions**.
4. La acción incluida en `.github/workflows/pages.yml` validará, construirá y publicará la app.
5. Abre la URL indicada por GitHub, normalmente `https://USUARIO.github.io/REPOSITORIO/`.

Las rutas de la app son relativas, por lo que funcionan tanto en un subdirectorio de GitHub Pages como en un dominio propio. GitHub Pages ofrece HTTPS, requisito para instalar una PWA y usar service workers.

### Instalar en el celular

- Android/Chrome: abre el sitio → menú → **Instalar aplicación** o pulsa el icono de descarga dentro de la app.
- iPhone/Safari: abre el sitio → **Compartir** → **Agregar a pantalla de inicio**.

Una PWA se ve y abre como app, pero GitHub Pages no la convierte por sí mismo en un paquete publicado en Play Store/App Store. Para las tiendas se puede usar Capacitor, como se describe abajo.

## IA segura para Rock

GitHub Pages es alojamiento estático. Nunca debe recibir `OPENAI_API_KEY`, claves de bases de datos ni secretos de proveedor. La app llama a un endpoint configurado por el usuario en **Perfil → Servicio seguro de IA**:

```text
POST https://api.tudominio.com/api/study
Content-Type: application/json

{
  "passage": "Juan 3:1-21",
  "question": "¿Qué significa nacer de nuevo?",
  "profile": {
    "doctrine": "Bautista conservador",
    "showAlternatives": true
  }
}
```

Respuesta esperada:

```json
{
  "answer": "Explicación generada…",
  "perspective": "Cómo influyó el perfil doctrinal…",
  "citations": [
    { "title": "Fuente consultada", "url": "https://…" }
  ]
}
```

La carpeta `backend/` contiene una implementación ejecutable como Cloudflare Worker. Usa la Responses API de OpenAI, mantiene la clave en un secreto del servidor, valida las solicitudes y restringe CORS. La carpeta `server/` conserva el contrato independiente de proveedor. En producción, el proxy debe:

1. autenticar al usuario si hay cuentas;
2. validar longitud y forma de la petición;
3. aplicar límites de uso y protección contra abuso;
4. construir el mensaje doctrinal en el servidor;
5. consultar solo comentarios con licencia compatible y guardar autor, obra, enlace y licencia;
6. mantener las citas recuperadas separadas de la explicación del modelo;
7. conservar las claves únicamente en variables de entorno;
8. permitir CORS solo desde el dominio de la app.

Mientras no se configure un backend, Rock funciona en **modo demostración** y lo dice explícitamente; no pretende que una respuesta genérica sea IA conectada.

## Comentarios bíblicos y derechos

`src/data.js` incluye unas pocas fichas demostrativas atribuidas y enlaces a su fuente. No copia comentarios completos. Antes de ampliar el catálogo, verifica derechos de autor y condiciones de redistribución. Una arquitectura de producción recomendable separa:

- `sources`: autor, obra, editorial/sitio, URL, licencia y fecha de consulta;
- `commentary_notes`: pasaje, resumen editorial propio y `sourceId`;
- `ai_responses`: explicación generada, citas utilizadas, perfil y fecha.

Así la interfaz siempre puede mostrar qué es una fuente humana y qué es generación automática.

## Recordatorios

La app permite guardar una hora y solicitar permiso para notificaciones. Una web cerrada no puede garantizar alarmas locales exactas en todos los teléfonos. Para recordatorios confiables hay dos opciones:

- PWA: usar Web Push desde el backend, con consentimiento, suscripción Push API y un trabajo programado.
- App Capacitor: usar notificaciones locales nativas mediante `@capacitor/local-notifications`.

La segunda opción funciona mejor para una rutina diaria personal y no requiere que un servidor envíe cada recordatorio.

## Sincronización futura

El estado actual vive bajo la clave `mi-plan-biblico:v2` de `localStorage`. El módulo `src/store.js` concentra lectura, escritura, exportación e importación. Para sincronizar:

1. agrega autenticación al backend;
2. crea `GET /api/sync` y `PUT /api/sync`;
3. asigna a cada registro `id`, `updatedAt` y `deletedAt`;
4. usa una cola local (idealmente IndexedDB) para cambios sin conexión;
5. resuelve conflictos por registro, no sobrescribiendo todo el documento;
6. cifra transporte con HTTPS y ofrece exportación/borrado de cuenta.

## Aplicación Android con Capacitor

El proyecto Android ya fue generado. Para actualizarlo después de cambiar la web:

```bash
pnpm install
pnpm run mobile:sync
pnpm run mobile:open:android
```

También existe una acción manual en GitHub que genera un APK de desarrollo descargable sin instalar Android Studio. Android local requiere Android Studio/JDK. iOS requiere macOS, Xcode y una cuenta de Apple Developer. Antes de publicar en tiendas hay que crear una firma de producción, política de privacidad, capturas, ficha de tienda, borrado de cuenta si existe autenticación y declaraciones de tratamiento de datos.

## Estructura

```text
.
├── index.html                 Entrada de la PWA
├── styles.css                Diseño móvil
├── manifest.webmanifest      Metadatos de instalación
├── sw.js                     Caché sin conexión
├── src/
│   ├── app.js                Pantallas, navegación e interacciones
│   ├── data.js               Plan, versículos y fuentes demostrativas
│   ├── store.js              Persistencia y respaldos
│   └── api.js                Cliente seguro para el proxy de IA
├── backend/                  Cloudflare Worker para Rock/OpenAI
├── android/                  Aplicación Android nativa Capacitor
├── capacitor.config.json     Identidad y configuración móvil
├── MOBILE.md                 APK, Android Studio e iOS
├── server/
│   └── README.md             Contrato de backend
├── scripts/                  Validación y construcción
└── .github/workflows/        Publicación en Pages
```

## Privacidad y cuidado pastoral

El diario puede contener información sensible. La versión local no la envía a ningún servidor. Si se habilita sincronización, hay que documentar retención, exportación y borrado. Rock es una herramienta de estudio: debe reconocer incertidumbre, no inventar citas, no presentarse como autoridad pastoral y recomendar ayuda humana adecuada en asuntos de crisis, abuso, salud mental o decisiones graves.

## Verificación antes de publicar

```bash
npm run check
npm run build
```

Prueba también instalación, modo avión después de la primera carga, importación/exportación, tamaños de pantalla pequeños y la URL real de GitHub Pages.
