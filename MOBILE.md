# Aplicación móvil nativa

El proyecto `android/` es una aplicación Capacitor real con identificador `com.miplanbiblico.app`. Empaqueta los mismos archivos que usa la PWA, pero dentro de una aplicación Android nativa y permite utilizar plugins del teléfono, como notificaciones locales.

## Obtener un APK sin Android Studio

Cada cambio móvil activa `.github/workflows/android.yml`:

1. abre **Actions → Construir aplicación Android**;
2. espera a que aparezca la marca verde;
3. abre la ejecución;
4. en **Artifacts**, descarga `mi-plan-biblico-android`;
5. descomprime el archivo y transfiere `app-debug.apk` al teléfono;
6. Android pedirá autorización para instalar desde esa fuente.

Ese APK está firmado con una clave de desarrollo y sirve para pruebas personales. No debe publicarse en Play Store.

## Compilar localmente

Instala Android Studio con Android SDK 36 y un JDK compatible. Después:

```bash
pnpm install
pnpm run mobile:sync
pnpm run mobile:open:android
```

En Android Studio selecciona un dispositivo y pulsa **Run**. Para la tienda, crea una clave de firma privada, configura un `release` firmado y genera un Android App Bundle (`.aab`). Nunca subas la clave `.jks`, su contraseña ni `key.properties` al repositorio.

## iPhone/iPad

Capacitor usa el mismo proyecto web para iOS, pero Apple exige macOS, Xcode y una cuenta Apple Developer para construir y firmar la aplicación. En una Mac:

```bash
pnpm add @capacitor/ios
pnpm run build
pnpm exec cap add ios
pnpm exec cap sync ios
pnpm exec cap open ios
```

Antes de las tiendas aún hacen falta: iconos y splash finales, política de privacidad pública, capturas, descripción, correo de soporte, clasificación por edades, ficha de tratamiento de datos y una clave de firma de producción.
