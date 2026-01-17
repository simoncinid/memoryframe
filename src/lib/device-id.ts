const DEVICE_ID_KEY = 'memoryframe_device_id';

/**
 * Genera o recupera un device ID univoco salvato in localStorage
 * Questo ID identifica in modo univoco il dispositivo/browser dell'utente
 * e viene usato per tracciare la quota gratuita anche quando l'IP cambia
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') {
    // Server-side: genera un ID temporaneo
    return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    // Genera un nuovo device ID univoco
    deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}

/**
 * Ottiene il device ID esistente (senza crearne uno nuovo)
 */
export function getDeviceId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(DEVICE_ID_KEY);
}
