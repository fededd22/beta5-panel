import fs from 'fs';
import path from 'path';
import { Script, LogEntry } from './types.js';

// Setup directories
const HOSTED_DIR = path.join(process.cwd(), 'hosted_scripts');
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_SCRIPTS_DIR = path.join(DATA_DIR, 'scripts');
const DB_FILE = path.join(HOSTED_DIR, 'db.json');

// Helper to sanitize python scripts for modern aiogram v3 compatibility
export function sanitizePythonScript(content: string): string {
  if (!content.includes('aiogram')) {
    return content;
  }

  let sanitized = content;

  // 1. Imports
  sanitized = sanitized.replace(/from\s+aiogram\.dispatcher\s+import\s+FSMContext/g, 'from aiogram.fsm.context import FSMContext');
  sanitized = sanitized.replace(/from\s+aiogram\.dispatcher\.filters\s+import\s+Command/g, 'from aiogram.filters import Command');
  sanitized = sanitized.replace(/from\s+aiogram\.dispatcher\.filters\.builtin\s+import\s+Command/g, 'from aiogram.filters import Command');
  sanitized = sanitized.replace(/from\s+aiogram\.contrib\.fsm_storage\.memory\s+import\s+MemoryStorage/g, 'from aiogram.fsm.storage.memory import MemoryStorage');

  // 2. Dispatcher instantiation
  sanitized = sanitized.replace(/dp\s*=\s*Dispatcher\(\s*bot\s*,\s*storage\s*=\s*([^)]+)\)/g, 'dp = Dispatcher(storage=$1)');
  sanitized = sanitized.replace(/dp\s*=\s*Dispatcher\(\s*bot\s*\)/g, 'dp = Dispatcher()');

  // 3. Handlers & Decorators
  sanitized = sanitized.replace(/@dp\.message_handler\(\s*content_types\s*=\s*\[\s*['"]document['"]\s*\]\s*\)/g, '@dp.message(lambda message: message.document)');
  sanitized = sanitized.replace(/@dp\.message_handler\(\s*content_types\s*=\s*types\.ContentType\.DOCUMENT\s*\)/g, '@dp.message(lambda message: message.document)');
  sanitized = sanitized.replace(/@dp\.message_handler/g, '@dp.message');
  sanitized = sanitized.replace(/@dp\.callback_query_handler/g, '@dp.callback_query');

  // 4. Polling
  sanitized = sanitized.replace(/await\s+dp\.start_polling\(\s*\)/g, 'await dp.start_polling(bot)');

  return sanitized;
}

if (!fs.existsSync(HOSTED_DIR)) {
  fs.mkdirSync(HOSTED_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_SCRIPTS_DIR)) {
  fs.mkdirSync(DATA_SCRIPTS_DIR, { recursive: true });
}

interface LocalDB {
  scripts: Record<string, Script>;
  logs: LogEntry[];
  config: {
    allowedUsers: string[];
    autoInstallGlobal: boolean;
    securityPin: string;
    botMode: 'public' | 'private';
    adminIds: number[];
    bannedUsers: number[];
  };
}

let localDb: LocalDB = {
  scripts: {},
  logs: [],
  config: {
    allowedUsers: [],
    autoInstallGlobal: true,
    securityPin: Math.floor(100000 + Math.random() * 900000).toString(),
    botMode: 'public',
    adminIds: [1726923679],
    bannedUsers: []
  }
};

// Scan disk directories for scripts that may not be in DB yet
function scanDiskScripts() {
  try {
    const files = fs.readdirSync(HOSTED_DIR);
    for (const f of files) {
      if (f.endsWith('.py') && !Object.values(localDb.scripts).some(s => s.name === f)) {
        const fullPath = path.join(HOSTED_DIR, f);
        const stats = fs.statSync(fullPath);
        const content = fs.readFileSync(fullPath, 'utf-8');
        const id = Math.random().toString(36).substring(2, 9);
        localDb.scripts[id] = {
          id,
          name: f,
          content,
          createdAt: stats.birthtime.toISOString() || new Date().toISOString(),
          updatedAt: stats.mtime.toISOString() || new Date().toISOString(),
          size: content.length,
          status: 'idle',
          autoInstall: true
        };
      }
    }
  } catch (e) {
    console.error("Error scanning disk scripts:", e);
  }
}

// Load database from file if exists
function loadLocalDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      localDb = {
        scripts: parsed.scripts || {},
        logs: parsed.logs || [],
        config: {
          allowedUsers: parsed.config?.allowedUsers || [],
          autoInstallGlobal: parsed.config?.autoInstallGlobal !== false,
          securityPin: parsed.config?.securityPin || Math.floor(100000 + Math.random() * 900000).toString(),
          botMode: parsed.config?.botMode || 'public',
          adminIds: parsed.config?.adminIds || [1726923679],
          bannedUsers: parsed.config?.bannedUsers || []
        }
      };
      
      let updated = false;
      for (const id in localDb.scripts) {
        const script = localDb.scripts[id];
        const sanitized = sanitizePythonScript(script.content);
        if (sanitized !== script.content) {
          script.content = sanitized;
          script.size = sanitized.length;
          updated = true;
        }
        if (script.status === 'running') {
          script.status = 'idle';
          updated = true;
        }
      }
      scanDiskScripts();
      if (updated) {
        saveLocalDb();
      }
    } else {
      scanDiskScripts();
      saveLocalDb();
    }
  } catch (err) {
    console.error("Failed to load local database, resetting:", err);
    scanDiskScripts();
    saveLocalDb();
  }
}

function saveLocalDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(localDb, null, 2), 'utf-8');
  } catch (err) {
    console.error("Failed to save local database:", err);
  }
}

loadLocalDb();

export const dbDriver = {
  // Config
  getSecurityPin(): string {
    return localDb.config.securityPin;
  },

  getAllowedUsers(): string[] {
    return localDb.config.allowedUsers;
  },

  addAllowedUser(userId: string): boolean {
    if (!localDb.config.allowedUsers.includes(userId)) {
      localDb.config.allowedUsers.push(userId);
      saveLocalDb();
      return true;
    }
    return false;
  },

  removeAllowedUser(userId: string): boolean {
    const index = localDb.config.allowedUsers.indexOf(userId);
    if (index > -1) {
      localDb.config.allowedUsers.splice(index, 1);
      saveLocalDb();
      return true;
    }
    return false;
  },

  getAutoInstallGlobal(): boolean {
    return localDb.config.autoInstallGlobal;
  },

  setAutoInstallGlobal(enabled: boolean) {
    localDb.config.autoInstallGlobal = enabled;
    saveLocalDb();
  },

  getBotMode(): 'public' | 'private' {
    return localDb.config.botMode || 'public';
  },

  setBotMode(mode: 'public' | 'private') {
    localDb.config.botMode = mode;
    saveLocalDb();
  },

  getAdminIds(): number[] {
    return localDb.config.adminIds || [1726923679];
  },

  setAdminIds(ids: number[]) {
    localDb.config.adminIds = ids;
    saveLocalDb();
  },

  getBannedUsers(): number[] {
    return localDb.config.bannedUsers || [];
  },

  banUser(userId: number) {
    if (!localDb.config.bannedUsers.includes(userId)) {
      localDb.config.bannedUsers.push(userId);
      saveLocalDb();
    }
  },

  unbanUser(userId: number) {
    localDb.config.bannedUsers = localDb.config.bannedUsers.filter(id => id !== userId);
    saveLocalDb();
  },

  // Scripts
  getScripts(): Script[] {
    return Object.values(localDb.scripts).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getScript(id: string): Script | undefined {
    return localDb.scripts[id];
  },

  getScriptByName(name: string): Script | undefined {
    return Object.values(localDb.scripts).find(s => s.name === name);
  },

  saveScript(script: Script) {
    script.content = sanitizePythonScript(script.content);
    script.size = script.content.length;

    localDb.scripts[script.id] = script;
    saveLocalDb();

    // Write file to hosted_scripts
    const filePath = path.join(HOSTED_DIR, script.name);
    try {
      fs.writeFileSync(filePath, script.content, 'utf-8');
    } catch (err) {
      console.error(`Failed to write Python script ${script.name} to disk:`, err);
    }

    // Also mirror to DATA_SCRIPTS_DIR for istidafa4_by_moon.py
    try {
      const adminId = localDb.config.adminIds[0] || 1726923679;
      const userFolder = path.join(DATA_SCRIPTS_DIR, String(adminId));
      if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder, { recursive: true });
      }
      fs.writeFileSync(path.join(userFolder, script.name), script.content, 'utf-8');
    } catch (err) {
      // Best effort mirror
    }
  },

  deleteScript(id: string): boolean {
    const script = localDb.scripts[id];
    if (script) {
      delete localDb.scripts[id];
      saveLocalDb();

      // Delete file from disk
      const filePath = path.join(HOSTED_DIR, script.name);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error(`Failed to delete script file ${script.name}:`, err);
        }
      }
      try {
        const adminId = localDb.config.adminIds[0] || 1726923679;
        const mirrorPath = path.join(DATA_SCRIPTS_DIR, String(adminId), script.name);
        if (fs.existsSync(mirrorPath)) {
          fs.unlinkSync(mirrorPath);
        }
      } catch (e) {
        // ignore
      }
      return true;
    }
    return false;
  },

  updateScriptStatus(id: string, status: 'idle' | 'running' | 'error', lastRun?: string) {
    const script = localDb.scripts[id];
    if (script) {
      script.status = status;
      if (lastRun) script.lastRun = lastRun;
      saveLocalDb();
    }
  },

  // Logs
  getLogs(scriptId?: string): LogEntry[] {
    if (scriptId) {
      return localDb.logs.filter(l => l.scriptId === scriptId).slice(-200);
    }
    return localDb.logs.slice(-200);
  },

  addLog(scriptId: string, type: 'stdout' | 'stderr' | 'system', message: string) {
    const log: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      scriptId,
      type,
      message,
      timestamp: new Date().toISOString()
    };
    localDb.logs.push(log);
    
    if (localDb.logs.length > 1000) {
      localDb.logs = localDb.logs.slice(-1000);
    }
    
    saveLocalDb();
    return log;
  },

  clearLogs(scriptId: string) {
    localDb.logs = localDb.logs.filter(l => l.scriptId !== scriptId);
    saveLocalDb();
  }
};
