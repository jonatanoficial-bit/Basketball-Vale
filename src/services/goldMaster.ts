import type { CareerV2 } from '../domain/types';

const RECOVERY_KEY = 'vale-recovery-checkpoints-v1';
const CLOUD_CONFIG_KEY = 'vale-cloud-config-v1';
const TELEMETRY_KEY = 'vale-telemetry-queue-v1';

export type RecoveryCheckpoint = {
  id: string;
  createdAt: string;
  reason: string;
  career: CareerV2;
};

export type CloudConfig = { endpoint: string; accessToken: string };

const readJson = <T>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) || '') as T;
  } catch {
    return fallback;
  }
};

export function createRecoveryCheckpoint(career: CareerV2, reason = 'Alteração segura') {
  const checkpoints = readJson<RecoveryCheckpoint[]>(RECOVERY_KEY, []);
  const previous = checkpoints[0];
  if (previous && previous.career.currentDate === career.currentDate && previous.reason === reason) return;
  const next: RecoveryCheckpoint = {
    id: crypto.randomUUID?.() ?? `checkpoint-${Date.now()}`,
    createdAt: new Date().toISOString(),
    reason,
    career,
  };
  localStorage.setItem(RECOVERY_KEY, JSON.stringify([next, ...checkpoints].slice(0, 5)));
}

export const listRecoveryCheckpoints = () =>
  readJson<RecoveryCheckpoint[]>(RECOVERY_KEY, []);

export function clearRecoveryCheckpoints() {
  localStorage.removeItem(RECOVERY_KEY);
}

export const getCloudConfig = () =>
  readJson<CloudConfig>(CLOUD_CONFIG_KEY, { endpoint: '', accessToken: '' });

export function saveCloudConfig(config: CloudConfig) {
  localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config));
}

const cloudHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export async function pushCloudSave(config: CloudConfig, career: CareerV2) {
  if (!/^https:\/\//i.test(config.endpoint)) throw new Error('Use um endpoint HTTPS válido.');
  const response = await fetch(config.endpoint, {
    method: 'PUT',
    headers: cloudHeaders(config.accessToken),
    body: JSON.stringify({ game: 'vale-basket-manager', schemaVersion: career.schemaVersion, career }),
  });
  if (!response.ok) throw new Error(`Servidor respondeu ${response.status}.`);
  return response.json().catch(() => ({ ok: true }));
}

export async function pullCloudSave(config: CloudConfig): Promise<CareerV2> {
  if (!/^https:\/\//i.test(config.endpoint)) throw new Error('Use um endpoint HTTPS válido.');
  const response = await fetch(config.endpoint, {
    headers: cloudHeaders(config.accessToken),
  });
  if (!response.ok) throw new Error(`Servidor respondeu ${response.status}.`);
  const payload = await response.json();
  const career = payload.career ?? payload;
  if (career?.version !== 3 || !career.teamAbbr || !Array.isArray(career.fixtures)) {
    throw new Error('O servidor não retornou um save Vale válido.');
  }
  return career as CareerV2;
}

export type TelemetryEvent = {
  id: string;
  at: string;
  type: string;
  data: Record<string, string | number | boolean>;
};

export function trackLocalEvent(
  consent: boolean,
  type: string,
  data: Record<string, string | number | boolean> = {},
) {
  if (!consent) return;
  const queue = readJson<TelemetryEvent[]>(TELEMETRY_KEY, []);
  queue.push({
    id: crypto.randomUUID?.() ?? `event-${Date.now()}`,
    at: new Date().toISOString(),
    type,
    data,
  });
  localStorage.setItem(TELEMETRY_KEY, JSON.stringify(queue.slice(-250)));
}

export const listTelemetryEvents = () => readJson<TelemetryEvent[]>(TELEMETRY_KEY, []);
export const clearTelemetryEvents = () => localStorage.removeItem(TELEMETRY_KEY);

export function downloadJson(filename: string, value: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function importCareerFile(file: File): Promise<CareerV2> {
  const value = JSON.parse(await file.text()) as CareerV2;
  if (value.version !== 3 || !value.teamAbbr || !Array.isArray(value.fixtures)) {
    throw new Error('Arquivo de save inválido.');
  }
  return value;
}
