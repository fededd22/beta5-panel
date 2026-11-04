export interface Script {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  size: number;
  status: 'idle' | 'running' | 'error';
  lastRun?: string;
  autoInstall: boolean;
  userId?: string | number;
}

export interface LogEntry {
  id: string;
  scriptId: string;
  type: 'stdout' | 'stderr' | 'system';
  message: string;
  timestamp: string;
}

export interface PipPackage {
  name: string;
  version?: string;
  status: 'installed' | 'installing' | 'error' | 'not_installed';
  error?: string;
}

export interface BotStatus {
  online: boolean;
  username: string | null;
  name: string | null;
  error: string | null;
  allowedUsers: string[];
  autoInstallGlobal: boolean;
  mode?: 'public' | 'private';
  adminIds?: number[];
  bannedUsers?: number[];
  tokenConfigured?: boolean;
}

export interface ServerTelemetry {
  country: string;
  countryAr: string;
  countryCode: string;
  flag: string;
  city: string;
  isp: string;
  ip: string;
  memory: {
    process: number;
    total: number;
    used: number;
    free: number;
    percent: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    percent: number;
  };
  scriptsCount: number;
  scriptsBytes: number;
  runningScripts: number;
  pythonVersion: string;
  uptime: string;
  uptimeSeconds: number;
  domain: string;
  keepAlive: {
    domain: string;
    interval: number;
    lastPing: {
      ok: boolean | null;
      status: number | null;
      ms: number | null;
      at: string | null;
      error: string | null;
    };
  };
}

export interface BotRunnerStatus {
  isRunning: boolean;
  pid?: number;
  mode: 'public' | 'private';
  tokenSet: boolean;
  adminIds: number[];
  bannedUsers: number[];
  botUsername?: string | null;
  botFirstName?: string | null;
  recentLogs: string[];
}

export interface ChatSimulatorMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  buttons?: { text: string; action?: string }[][];
  rawHtml?: boolean;
}
