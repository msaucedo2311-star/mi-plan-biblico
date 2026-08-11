export function isNativeApp() {
  return Boolean(globalThis.Capacitor?.isNativePlatform?.());
}

export async function scheduleDailyReminder(time) {
  const plugin = globalThis.Capacitor?.Plugins?.LocalNotifications;
  if (!isNativeApp() || !plugin) return { native: false };

  let permission = await plugin.checkPermissions();
  if (permission.display !== 'granted') permission = await plugin.requestPermissions();
  if (permission.display !== 'granted') throw new Error('El teléfono no concedió permiso para recordatorios.');

  const [hour, minute] = String(time || '07:30').split(':').map(Number);
  await plugin.cancel({ notifications: [{ id: 1201 }] });
  await plugin.schedule({ notifications: [{
    id: 1201,
    title: 'Mi Plan Bíblico',
    body: 'Tu lectura de hoy te espera. Camina en la Palabra, un día a la vez.',
    schedule: { on: { hour, minute }, repeats: true, allowWhileIdle: true },
    smallIcon: 'ic_stat_bible'
  }] });
  return { native: true };
}
