import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Terminal as TerminalIcon,
  Play,
  Square,
  Upload,
  Plus,
  Trash2,
  RefreshCw,
  FolderOpen,
  Settings,
  UserCheck,
  Package,
  CheckCircle,
  AlertTriangle,
  X,
  FileCode,
  Copy,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  Download,
  Cpu,
  CornerDownRight,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Activity,
  Server,
  Globe,
  HardDrive,
  Clock,
  Shield,
  Send,
  Sparkles,
  Search,
  Lock,
  Unlock,
  Users,
  Check,
  ArrowRight,
  HelpCircle,
  Save,
  Compass
} from 'lucide-react';
import { Script, LogEntry, PipPackage, BotStatus, ServerTelemetry, BotRunnerStatus, ChatSimulatorMessage } from './types.js';

const SCRIPT_TEMPLATES = [
  {
    name: 'hello_world.py',
    description: 'اختبار تشغيل بيئة بايثون ومخرجات التيرمينال',
    content: `import time
import os
import sys

print("🚀 Démarrage du script de test Python...")
print(f"📁 Répertoire de travail : {os.getcwd()}")
print(f"🐍 Version de Python : {sys.version}")
print("🕒 On attend 2 secondes...")
time.sleep(2)

for i in range(1, 6):
    print(f"🔢 Étape {i}/5 - Traitement en cours...")
    time.sleep(1)

print("✅ Script exécuté avec succès !")
`
  },
  {
    name: 'telegram_echo.py',
    description: 'بوت تيليجرام بسيط للإشعار والرد',
    content: `# بوت تيليجرام تجريبي بلغة بايثون
import os
import time

print("🤖 Démarrage d'une simulation de bot...")
print("ℹ️ Ce script simule l'envoi de rapports périodiques.")

for i in range(1, 4):
    print(f"📡 Envoi de la notification {i} à l'administrateur...")
    time.sleep(2)

print("💤 Fin du script de notification.")
`
  },
  {
    name: 'web_scraper.py',
    description: 'جلب بيانات من الويب باستخدام requests و bs4',
    content: `# يستخدم requests و beautifulsoup4 مع التثبيت التلقائي للحزم
import requests
from bs4 import BeautifulSoup
import time

print("🌐 Connexion à un site web pour démonstration...")
url = "https://news.ycombinator.com"
headers = {"User-Agent": "Mozilla/5.0"}

try:
    response = requests.get(url, headers=headers, timeout=10)
    print(f"📥 Statut HTTP : {response.status_code}")
    
    soup = BeautifulSoup(response.text, 'html.parser')
    titles = soup.find_all('span', class_='titleline')
    
    print("\\n🔥 Derniers titres Hacker News :")
    for idx, title in enumerate(titles[:5], 1):
        link_tag = title.find('a')
        if link_tag:
            print(f"{idx}. {link_tag.text}")
            
except Exception as e:
    print(f"❌ Erreur : {e}")
`
  },
  {
    name: 'system_monitor.py',
    description: 'مراقبة موارد النظام والذاكرة',
    content: `import os
import time
import sys

print("📊 بدء فحص موارد النظام...")
for step in range(1, 6):
    print(f"⏱️ فحص الدورة {step}/5: المعالج والذاكرة في حالة ممتازة")
    time.sleep(1)

print("✅ تم الفحص الدوري بنجاح.")
`
  }
];

export default function App() {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<'live_bot' | 'editor' | 'server_status' | 'packages' | 'admin_settings'>('live_bot');

  // Scripts & Execution State
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [scriptSearch, setScriptSearch] = useState<string>('');
  const [showRunningOnly, setShowRunningOnly] = useState<boolean>(false);
  const [editorContent, setEditorContent] = useState<string>('');
  const [editorModified, setEditorModified] = useState<boolean>(false);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [newScriptName, setNewScriptName] = useState<string>('');
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);

  // Server & Bot Telemetry
  const [serverTelemetry, setServerTelemetry] = useState<ServerTelemetry | null>(null);
  const [botRunnerStatus, setBotRunnerStatus] = useState<BotRunnerStatus | null>(null);
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);
  const [securityPin, setSecurityPin] = useState<string>('');

  // Packages State
  const [packages, setPackages] = useState<PipPackage[]>([]);
  const [pkgSearch, setPkgSearch] = useState<string>('');
  const [newPkgName, setNewPkgName] = useState<string>('');
  const [isInstallingPkg, setIsInstallingPkg] = useState<boolean>(false);
  const [pkgInstallOutput, setPkgInstallOutput] = useState<string>('');

  // Bot Token Configuration State
  const [tokenInput, setTokenInput] = useState<string>('');
  const [adminIdInput, setAdminIdInput] = useState<string>('');
  const [isVerifyingToken, setIsVerifyingToken] = useState<boolean>(false);
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [tokenVerificationResult, setTokenVerificationResult] = useState<{ ok: boolean; username?: string; name?: string; error?: string } | null>(null);

  // Web Terminal State
  const [terminalCmd, setTerminalCmd] = useState<string>('python3 --version');
  const [terminalOutput, setTerminalOutput] = useState<{ stdout: string; stderr: string; exitCode: number } | null>(null);
  const [isExecutingTerminal, setIsExecutingTerminal] = useState<boolean>(false);

  // Bot Simulator Interactive State
  const [chatMessages, setChatMessages] = useState<ChatSimulatorMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `👋 مرحباً بك في **الواجهة المباشرة لبوت استضافة سكربتات بايثون** (istidafa4_by_moon)!\n\nيمكنك التحكم بالبوت وتشغيل السكربتات ومتابعة حالة السيرفر مباشرة من الأزرار التفاعلية بالأسفل:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      buttons: [
        [{ text: "➕ Ajouter un script" }],
        [{ text: "▶️ Exécuter un script" }],
        [{ text: "📜 Liste des scripts" }],
        [{ text: "❌ Arrêter et supprimer un script" }],
        [{ text: "👑 Panel admin" }]
      ]
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatSending, setIsChatSending] = useState<boolean>(false);

  // User Management
  const [banUserIdInput, setBanUserIdInput] = useState<string>('');

  // Notifications
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scriptTerminalEndRef = useRef<HTMLDivElement>(null);
  const botLogsEndRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch all initial data
  useEffect(() => {
    fetchScripts();
    fetchServerTelemetry();
    fetchBotRunnerStatus();
    fetchPackages();

    const interval = setInterval(() => {
      fetchScripts();
      fetchBotRunnerStatus();
      fetchServerTelemetry();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Fetch logs when selected script is running
  useEffect(() => {
    if (!selectedScript) return;
    fetchLogs(selectedScript.id);

    let logInterval: NodeJS.Timeout | null = null;
    if (selectedScript.status === 'running') {
      logInterval = setInterval(() => {
        fetchLogs(selectedScript.id);
        fetchScripts();
      }, 1500);
    }

    return () => {
      if (logInterval) clearInterval(logInterval);
    };
  }, [selectedScript?.id, selectedScript?.status]);

  // Keep editor content in sync when selecting script
  useEffect(() => {
    if (selectedScript) {
      setEditorContent(selectedScript.content);
      setEditorModified(false);
    }
  }, [selectedScript?.id]);

  // Scroll terminals
  useEffect(() => {
    scriptTerminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    botLogsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [botRunnerStatus?.recentLogs]);

  const fetchScripts = async () => {
    try {
      const res = await fetch('/api/scripts');
      if (res.ok) {
        const data: Script[] = await res.json();
        setScripts(data);
        if (!selectedScript && data.length > 0) {
          setSelectedScript(data[0]);
        } else if (selectedScript) {
          const updated = data.find(s => s.id === selectedScript.id);
          if (updated) setSelectedScript(updated);
        }
      }
    } catch (e) {
      console.error("Error fetching scripts:", e);
    }
  };

  const fetchServerTelemetry = async () => {
    try {
      const res = await fetch('/api/server-info');
      if (res.ok) {
        const data: ServerTelemetry = await res.json();
        setServerTelemetry(data);
      }
    } catch (e) {
      console.error("Error fetching telemetry:", e);
    }
  };

  const fetchBotRunnerStatus = async () => {
    try {
      const res = await fetch('/api/bot-runner/status');
      if (res.ok) {
        const data: BotRunnerStatus = await res.json();
        setBotRunnerStatus(data);
        if (data.adminIds && data.adminIds.length > 0 && !adminIdInput) {
          setAdminIdInput(String(data.adminIds[0]));
        }
      }
      const legacyRes = await fetch('/api/bot-status');
      if (legacyRes.ok) {
        const legacyData = await legacyRes.json();
        setBotStatus(legacyData.status);
        setSecurityPin(legacyData.securityPin);
      }
    } catch (e) {
      console.error("Error fetching bot runner status:", e);
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/packages');
      if (res.ok) {
        const data: PipPackage[] = await res.json();
        setPackages(data);
      }
    } catch (e) {
      console.error("Error fetching packages:", e);
    }
  };

  const fetchLogs = async (scriptId: string) => {
    try {
      const res = await fetch(`/api/scripts/${scriptId}/logs`);
      if (res.ok) {
        const data: LogEntry[] = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error("Error fetching logs:", e);
    }
  };

  // Run script
  const handleRunScript = async (scriptId: string) => {
    try {
      // If editor modified, save first
      if (editorModified && selectedScript && selectedScript.id === scriptId) {
        await handleSaveScript();
      }
      const res = await fetch(`/api/scripts/${scriptId}/run`, { method: 'POST' });
      if (res.ok) {
        showToast("🚀 تم تشغيل السكربت بنجاح!", "success");
        fetchScripts();
        fetchLogs(scriptId);
      } else {
        const err = await res.json();
        showToast(`❌ خطأ: ${err.error || 'فشل التشغيل'}`, "error");
      }
    } catch (e) {
      showToast("❌ تعذر بدء تشغيل السكربت", "error");
    }
  };

  // Stop script
  const handleStopScript = async (scriptId: string) => {
    try {
      const res = await fetch(`/api/scripts/${scriptId}/stop`, { method: 'POST' });
      if (res.ok) {
        showToast("🛑 تم إيقاف السكربت", "info");
        fetchScripts();
        fetchLogs(scriptId);
      }
    } catch (e) {
      showToast("❌ تعذر إيقاف السكربت", "error");
    }
  };

  // Save script content
  const handleSaveScript = async () => {
    if (!selectedScript) return;
    try {
      const res = await fetch(`/api/scripts/${selectedScript.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editorContent })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedScript(updated);
        setEditorModified(false);
        showToast("💾 تم حفظ التعديلات بنجاح", "success");
        fetchScripts();
      }
    } catch (e) {
      showToast("❌ فشل حفظ التعديلات", "error");
    }
  };

  // Delete script
  const handleDeleteScript = async (scriptId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا السكربت نهائياً؟")) return;
    try {
      const res = await fetch(`/api/scripts/${scriptId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast("🗑️ تم حذف السكربت", "info");
        setSelectedScript(null);
        fetchScripts();
      } else {
        const err = await res.json();
        showToast(`⚠️ ${err.error}`, "error");
      }
    } catch (e) {
      showToast("❌ فشل حذف السكربت", "error");
    }
  };

  // Create new script
  const handleCreateScript = async () => {
    if (!newScriptName.trim()) {
      showToast("يرجى إدخال اسم السكربت", "error");
      return;
    }
    const template = SCRIPT_TEMPLATES[selectedTemplateIndex];
    const scriptName = newScriptName.endsWith('.py') ? newScriptName : `${newScriptName}.py`;

    try {
      const res = await fetch('/api/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: scriptName,
          content: template ? template.content : `# ${scriptName}\nprint("Hello World!")\n`,
          autoInstall: true
        })
      });
      if (res.ok) {
        const created: Script = await res.json();
        setIsCreatingNew(false);
        setNewScriptName('');
        showToast(`✅ تم إنشاء ${created.name}`, "success");
        await fetchScripts();
        setSelectedScript(created);
      }
    } catch (e) {
      showToast("❌ تعذر إنشاء السكربت", "error");
    }
  };

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.py')) {
      showToast("⚠️ يرجى اختيار ملف بامتداد .py فقط", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      try {
        const res = await fetch('/api/scripts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: file.name,
            content,
            autoInstall: true
          })
        });
        if (res.ok) {
          const created = await res.json();
          showToast(`📥 تم رفع السكربت ${file.name} بنجاح`, "success");
          fetchScripts();
          setSelectedScript(created);
          // If in chat, notify bot simulator
          if (activeTab === 'live_bot') {
            sendChatSimulatorMessage(`تم رفع الملف ${file.name}`);
          }
        }
      } catch (err) {
        showToast("❌ فشل رفع الملف", "error");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Clear logs
  const handleClearLogs = async () => {
    if (!selectedScript) return;
    try {
      await fetch(`/api/scripts/${selectedScript.id}/clear-logs`, { method: 'POST' });
      setLogs([]);
      showToast("🧹 تم مسح السجلات", "info");
    } catch (e) {
      console.error(e);
    }
  };

  // Install Pip Package
  const handleInstallPackage = async () => {
    if (!newPkgName.trim()) return;
    const pkg = newPkgName.trim();
    setIsInstallingPkg(true);
    setPkgInstallOutput(`Running: pip install ${pkg}...\n`);
    try {
      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: pkg })
      });
      const data = await res.json();
      setPkgInstallOutput(prev => prev + (data.output || data.message || 'Done.'));
      if (res.ok) {
        showToast(`✅ تم تثبيت الحزمة ${pkg} بنجاح`, "success");
        setNewPkgName('');
        fetchPackages();
      } else {
        showToast(`❌ فشل تثبيت الحزمة ${pkg}`, "error");
      }
    } catch (e) {
      showToast("❌ خطأ أثناء الاتصال بالخادم", "error");
    } finally {
      setIsInstallingPkg(false);
    }
  };

  // Bot Daemon controls
  const handleStartBot = async () => {
    try {
      const res = await fetch('/api/bot-runner/start', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast("🟢 تم تشغيل بوت تيليجرام بنجاح", "success");
        fetchBotRunnerStatus();
      } else {
        showToast("⚠️ البوت قيد التشغيل بالفعل أو حدث خطأ", "info");
      }
    } catch (e) {
      showToast("❌ فشل تشغيل البوت", "error");
    }
  };

  const handleStopBot = async () => {
    try {
      const res = await fetch('/api/bot-runner/stop', { method: 'POST' });
      if (res.ok) {
        showToast("🛑 تم إيقاف بوت تيليجرام", "info");
        fetchBotRunnerStatus();
      }
    } catch (e) {
      showToast("❌ فشل إيقاف البوت", "error");
    }
  };

  const handleRestartBot = async () => {
    try {
      await fetch('/api/bot-runner/restart', { method: 'POST' });
      showToast("🔄 جارِ إعادة تشغيل البوت...", "info");
      setTimeout(() => {
        fetchBotRunnerStatus();
        showToast("🟢 تم إعادة تشغيل البوت", "success");
      }, 1500);
    } catch (e) {
      showToast("❌ فشل إعادة التشغيل", "error");
    }
  };

  // Verify and Save Token
  const handleVerifyToken = async () => {
    if (!tokenInput.trim()) {
      showToast("يرجى إدخال التوكن أولاً", "error");
      return;
    }
    setIsVerifyingToken(true);
    setTokenVerificationResult(null);
    try {
      const res = await fetch('/api/bot-runner/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput.trim() })
      });
      const data = await res.json();
      setTokenVerificationResult(data);
      if (data.ok) {
        showToast(`✅ التوكن صحيح! البوت: @${data.username}`, "success");
      } else {
        showToast(`❌ التوكن غير صالح: ${data.error}`, "error");
      }
    } catch (e) {
      showToast("❌ خطأ في الاتصال بواجهة تيليجرام", "error");
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const handleSaveBotConfig = async () => {
    if (!tokenInput.trim()) {
      showToast("يرجى إدخال التوكن", "error");
      return;
    }
    setIsSavingConfig(true);
    try {
      const res = await fetch('/api/bot-runner/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: tokenInput.trim(),
          adminId: adminIdInput.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✅ تم حفظ إعدادات البوت @${data.botUsername} وتشغيله!`, "success");
        setTokenInput('');
        fetchBotRunnerStatus();
      } else {
        showToast(`❌ ${data.error}`, "error");
      }
    } catch (e) {
      showToast("❌ فشل حفظ الإعدادات", "error");
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Toggle Bot Mode (Public / Private)
  const handleToggleBotMode = async () => {
    try {
      const res = await fetch('/api/bot-runner/toggle-mode', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast(`تم تبديل وضع البوت إلى: ${data.mode === 'public' ? 'عام (Public)' : 'خاص (Private)'}`, "info");
        fetchBotRunnerStatus();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Ban / Unban user
  const handleBanUser = async () => {
    if (!banUserIdInput.trim()) return;
    try {
      const res = await fetch('/api/bot-runner/ban-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: banUserIdInput.trim() })
      });
      if (res.ok) {
        showToast(`🚫 تم حظر المستخدم ${banUserIdInput}`, "info");
        setBanUserIdInput('');
        fetchBotRunnerStatus();
      }
    } catch (e) {
      showToast("❌ تعذر حظر المستخدم", "error");
    }
  };

  const handleUnbanUser = async (uid: number) => {
    try {
      const res = await fetch('/api/bot-runner/unban-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid })
      });
      if (res.ok) {
        showToast(`🔓 تم إلغاء حظر المستخدم ${uid}`, "success");
        fetchBotRunnerStatus();
      }
    } catch (e) {
      showToast("❌ تعذر إلغاء الحظر", "error");
    }
  };

  // Web Terminal Runner
  const handleExecuteTerminal = async () => {
    if (!terminalCmd.trim()) return;
    setIsExecutingTerminal(true);
    try {
      const res = await fetch('/api/terminal/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: terminalCmd.trim() })
      });
      const data = await res.json();
      setTerminalOutput(data);
    } catch (e) {
      setTerminalOutput({ stdout: '', stderr: 'Failed to communicate with server terminal.', exitCode: 1 });
    } finally {
      setIsExecutingTerminal(false);
    }
  };

  // Bot Simulator Interaction
  const sendChatSimulatorMessage = async (textToSend: string, action?: string) => {
    if (!textToSend.trim() && !action) return;

    const userMsg: ChatSimulatorMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatSending(true);

    try {
      const res = await fetch('/api/bot-simulator/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: action || textToSend, text: textToSend })
      });
      const data = await res.json();
      const botReply: ChatSimulatorMessage = {
        id: Math.random().toString(),
        sender: 'bot',
        text: data.text || "تم تنفيذ الإجراء.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        buttons: data.buttons
      };
      setChatMessages(prev => [...prev, botReply]);
      // If it started or stopped scripts, refresh script list
      if (textToSend.includes('تشغيل') || textToSend.includes('run:') || textToSend.includes('إيقاف') || textToSend.includes('stop:') || textToSend.includes('delete:')) {
        fetchScripts();
      }
    } catch (e) {
      const errReply: ChatSimulatorMessage = {
        id: Math.random().toString(),
        sender: 'bot',
        text: "⚠️ تعذر التواصل مع محرك البوت.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errReply]);
    } finally {
      setIsChatSending(false);
    }
  };

  // Filter scripts
  const filteredScripts = scripts.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(scriptSearch.toLowerCase());
    const matchesRunning = showRunningOnly ? s.status === 'running' : true;
    return matchesSearch && matchesRunning;
  });

  const runningCount = scripts.filter(s => s.status === 'running').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-600 selection:text-white">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md border ${
              notification.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                : notification.type === 'error'
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                : 'bg-indigo-950/80 border-indigo-500/50 text-indigo-200'
            }`}
          >
            {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
            {notification.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
            {notification.type === 'info' && <Activity className="w-5 h-5 text-indigo-400" />}
            <span className="text-sm font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".py"
        className="hidden"
      />

      {/* Top Header / Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base lg:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  منصة استضافة سكربتات بايثون وبوت تيليجرام
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono font-semibold">
                  Moon v4
                </span>
              </div>
              <p className="text-xs text-slate-400">
                واجهة تحكم مباشرة متكاملة مع البوت وخدمة الاستضافة وتشغيل الأكواد الحية
              </p>
            </div>
          </div>

          {/* Live Telemetry & Bot Quick Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Geolocation Badge */}
            {serverTelemetry && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/60 text-xs">
                <span className="text-sm">{serverTelemetry.flag}</span>
                <span className="font-medium text-slate-200">{serverTelemetry.countryAr}</span>
                <span className="text-slate-500 hidden sm:inline">|</span>
                <span className="text-slate-400 font-mono hidden sm:inline">{serverTelemetry.ip}</span>
              </div>
            )}

            {/* Bot Status Badge */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                botRunnerStatus?.isRunning
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${botRunnerStatus?.isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{botRunnerStatus?.isRunning ? 'البوت متصل وشغال' : 'البوت غير نشط'}</span>
              {botRunnerStatus?.botUsername && (
                <span className="text-slate-300 font-mono font-normal">@{botRunnerStatus.botUsername}</span>
              )}
            </div>

            {/* Mode Badge */}
            <div
              onClick={handleToggleBotMode}
              className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 transition-colors"
              title="انقر لتبديل وضع البوت (عام / خاص)"
            >
              {botRunnerStatus?.mode === 'private' ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>وضع خاص (Admins)</span>
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>وضع عام (Public)</span>
                </>
              )}
            </div>

            {/* Quick Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>رفع سكربت .py</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-3.5 flex items-center gap-1 border-t border-slate-800/60 pt-2.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('live_bot')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'live_bot'
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>الواجهة المباشرة للبوت</span>
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'editor'
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FileCode className="w-4 h-4 text-purple-400" />
            <span>محرر السكربتات والتشغيل</span>
            {runningCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                {runningCount} نشط
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('server_status')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'server_status'
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Server className="w-4 h-4 text-emerald-400" />
            <span>حالة السيرفر والكيب ألايف</span>
          </button>

          <button
            onClick={() => setActiveTab('packages')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'packages'
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Package className="w-4 h-4 text-amber-400" />
            <span>مكتبات بايثون (Pip)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {packages.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('admin_settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'admin_settings'
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-300" />
            <span>إعدادات البوت والتحكم بالأدمن</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
        {/* ============================================================ */}
        {/* TAB 1: LIVE BOT SIMULATOR & INTERACTIVE INTERFACE            */}
        {/* ============================================================ */}
        {activeTab === 'live_bot' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left/Main Column: Interactive Chat Interface */}
            <div className="lg:col-span-8 flex flex-col h-[750px] bg-slate-900/70 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
              {/* Chat Header */}
              <div className="px-5 py-4 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                      <span>الواجهة المباشرة للبوت (Live Interactive Console)</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
                    </h2>
                    <p className="text-xs text-slate-400">
                      محاكاة واجهة تيليجرام التفاعلية - اضغط على الأزرار لتنفيذ الأوامر فوراً
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setChatMessages([
                        {
                          id: 'welcome',
                          sender: 'bot',
                          text: `👋 مرحباً بك في **الواجهة المباشرة لبوت استضافة سكربتات بايثون** (istidafa4_by_moon)!\nاختر أحد الإجراءات من لوحة المفاتيح:`,
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          buttons: [
                            [{ text: "➕ Ajouter un script" }],
                            [{ text: "▶️ Exécuter un script" }],
                            [{ text: "📜 Liste des scripts" }],
                            [{ text: "❌ Arrêter et supprimer un script" }],
                            [{ text: "👑 Panel admin" }]
                          ]
                        }
                      ]);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-xs text-slate-300 border border-slate-700/60 transition-colors flex items-center gap-1.5"
                    title="إعادة ضبط المحادثة"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>إعادة تهيئة</span>
                  </button>
                </div>
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-tl-sm'
                          : 'bg-slate-800/90 border border-slate-700/70 text-slate-100 rounded-tr-sm'
                      }`}
                    >
                      {/* Message Content formatted */}
                      <div className="text-sm whitespace-pre-wrap leading-relaxed font-sans">
                        {msg.text}
                      </div>

                      {/* Interactive Buttons (Telegram Custom Keyboard Style) */}
                      {msg.buttons && msg.buttons.length > 0 && (
                        <div className="mt-3.5 pt-3 border-t border-slate-700/50 space-y-2">
                          {msg.buttons.map((row, rIdx) => (
                            <div key={rIdx} className="flex flex-wrap gap-2">
                              {row.map((btn, bIdx) => (
                                <button
                                  key={bIdx}
                                  onClick={() => sendChatSimulatorMessage(btn.text, btn.action)}
                                  className="flex-1 min-w-[120px] px-3.5 py-2 rounded-xl bg-slate-700/60 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-600/40 hover:border-indigo-500 text-xs font-medium transition-all shadow-sm active:scale-[0.98] text-center"
                                >
                                  {btn.text}
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}

                      <div
                        className={`text-[10px] mt-2 font-mono ${
                          msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                        } text-left`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
                {isChatSending && (
                  <div className="flex items-center gap-2 text-xs text-indigo-400 bg-indigo-500/10 px-3 py-2 rounded-xl w-fit">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>البوت يقوم بالمعالجة...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input & Controls */}
              <div className="p-3.5 bg-slate-900/90 border-t border-slate-800/80">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    sendChatSimulatorMessage(chatInput);
                  }}
                  className="flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/60"
                    title="رفع سكربت بايثون .py"
                  >
                    <Upload className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="اكتب أمراً هنا (مثال: /start أو /status أو أمر شيل مثل python3 --version)..."
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors"
                  />

                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isChatSending}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                  >
                    <span>إرسال</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Quick Command Chips */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[11px] text-slate-400 ml-1">أوامر سريعة:</span>
                  {[
                    { label: '/start', text: '/start' },
                    { label: '📊 état du serveur', text: '📊 État du serveur' },
                    { label: '📜 liste des scripts', text: '📜 Liste des scripts' },
                    { label: '👑 panel admin', text: '👑 Panel admin' },
                    { label: '🔄 keep-alive', text: '🔄 État Keep-Alive' }
                  ].map(c => (
                    <button
                      key={c.label}
                      onClick={() => sendChatSimulatorMessage(c.text)}
                      className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-700/50 transition-colors"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Quick Status & Live Telemetry Card */}
            <div className="lg:col-span-4 space-y-5">
              {/* Telemetry Snapshot Card */}
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    <span>مؤشرات السيرفر المباشرة</span>
                  </h3>
                  <button
                    onClick={fetchServerTelemetry}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {serverTelemetry ? (
                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                      <span className="text-slate-400">موقع السيرفر:</span>
                      <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <span className="text-base">{serverTelemetry.flag}</span>
                        <span>{serverTelemetry.countryAr}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                      <span className="text-slate-400">عنوان IP العام:</span>
                      <span className="font-mono text-indigo-300">{serverTelemetry.ip}</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                      <span className="text-slate-400">المزود (ISP):</span>
                      <span className="text-slate-200 font-medium">{serverTelemetry.isp || 'Cloud Run'}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">استهلاك الرام:</span>
                        <span className="font-mono text-slate-200">
                          {serverTelemetry.memory.percent}% ({(serverTelemetry.memory.used / (1024 * 1024 * 1024)).toFixed(1)} GB)
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, serverTelemetry.memory.percent)}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">المساحة التخزينية:</span>
                        <span className="font-mono text-slate-200">
                          {serverTelemetry.disk.percent}% ({(serverTelemetry.disk.free / (1024 * 1024 * 1024)).toFixed(1)} GB حر)
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, serverTelemetry.disk.percent)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                      <span className="text-slate-400">مدة التشغيل:</span>
                      <span className="font-mono text-slate-300">{serverTelemetry.uptime}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 text-xs">جارِ فحص السيرفر...</div>
                )}
              </div>

              {/* Bot Control Card */}
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>التحكم في سيرفر البوت</span>
                </h3>

                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  يمكنك تشغيل بوت التيليجرام في الخلفية (`istidafa4_by_moon.py`) ليتصل مباشرة بتطبيق تيليجرام الرسمي.
                </p>

                <div className="flex flex-col gap-2">
                  {botRunnerStatus?.isRunning ? (
                    <button
                      onClick={handleStopBot}
                      className="w-full py-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
                    >
                      <Square className="w-3.5 h-3.5" />
                      <span>إيقاف خدمة البوت</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStartBot}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>تشغيل خدمة البوت في الخلفية</span>
                    </button>
                  )}

                  <button
                    onClick={handleRestartBot}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/60 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>إعادة تشغيل البوت</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('admin_settings')}
                    className="w-full py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-indigo-400 text-xs font-medium border border-indigo-500/20 transition-colors flex items-center justify-center gap-1.5 mt-1"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>تعديل توكن البوت وحسابات الأدمن</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: SCRIPT STUDIO & CODE RUNNER                           */}
        {/* ============================================================ */}
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar: Scripts List */}
            <div className="lg:col-span-4 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col h-[750px] backdrop-blur-md">
              {/* Header & Controls */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-bold text-sm text-slate-100">السكربتات المحفوظة</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {scripts.length}
                  </span>
                </div>

                <button
                  onClick={() => setIsCreatingNew(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>جديد</span>
                </button>
              </div>

              {/* Search & Filter */}
              <div className="space-y-2 mb-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={scriptSearch}
                    onChange={e => setScriptSearch(e.target.value)}
                    placeholder="بحث في السكربتات..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pr-9 pl-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between text-xs px-1 text-slate-400">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showRunningOnly}
                      onChange={e => setShowRunningOnly(e.target.checked)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <span>النشطة قيد التشغيل فقط</span>
                  </label>
                  <span>{filteredScripts.length} سكربت</span>
                </div>
              </div>

              {/* Scripts List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {filteredScripts.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    لا توجد سكربتات مطابقة. اضغط "جديد" أو ارفع ملف .py
                  </div>
                ) : (
                  filteredScripts.map(s => {
                    const isSelected = selectedScript?.id === s.id;
                    const isRunning = s.status === 'running';

                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedScript(s)}
                        className={`p-3 rounded-xl cursor-pointer border transition-all ${
                          isSelected
                            ? 'bg-indigo-600/15 border-indigo-500/40 shadow-sm'
                            : 'bg-slate-950/40 hover:bg-slate-800/50 border-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileCode className={`w-4 h-4 shrink-0 ${isRunning ? 'text-emerald-400 animate-spin' : 'text-slate-400'}`} />
                            <span className="font-semibold text-xs text-slate-200 truncate">{s.name}</span>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${
                              isRunning
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : s.status === 'error'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {isRunning ? '🟢 شغال' : s.status === 'error' ? '🔴 خطأ' : '⚪ متوقف'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                          <span>{(s.size / 1024).toFixed(1)} KB</span>
                          <span>{s.lastRun ? new Date(s.lastRun).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'لم ينفذ بعد'}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Main Editor & Output Terminal */}
            <div className="lg:col-span-8 flex flex-col h-[750px] gap-4">
              {/* Top Editor Box */}
              <div className="flex-1 bg-slate-900/70 border border-slate-800/80 rounded-2xl flex flex-col overflow-hidden backdrop-blur-md shadow-xl">
                {selectedScript ? (
                  <>
                    {/* Editor Toolbar */}
                    <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <FileCode className="w-4 h-4 text-indigo-400" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-xs sm:text-sm text-slate-200">{selectedScript.name}</h3>
                            {editorModified && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                                غير محفوظ
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {editorModified && (
                          <button
                            onClick={handleSaveScript}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>حفظ</span>
                          </button>
                        )}

                        {selectedScript.status === 'running' ? (
                          <button
                            onClick={() => handleStopScript(selectedScript.id)}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-rose-600/20"
                          >
                            <Square className="w-3.5 h-3.5" />
                            <span>إيقاف</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRunScript(selectedScript.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-emerald-600/20"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>تشغيل السكربت</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            const blob = new Blob([editorContent], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = selectedScript.name;
                            a.click();
                          }}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                          title="تحميل السكربت"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteScript(selectedScript.id)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 text-xs transition-colors"
                          title="حذف السكربت"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Code Textarea with line numbers */}
                    <div className="flex-1 relative flex overflow-hidden font-mono text-xs">
                      <textarea
                        value={editorContent}
                        onChange={e => {
                          setEditorContent(e.target.value);
                          setEditorModified(true);
                        }}
                        dir="ltr"
                        className="w-full h-full p-4 bg-slate-950/80 text-emerald-400 focus:outline-none resize-none selection:bg-indigo-500/30 leading-relaxed font-mono"
                        placeholder="أدخل كود بايثون هنا..."
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm">
                    <FileCode className="w-8 h-8 mb-2 opacity-50" />
                    <span>اختر سكربتاً من القائمة أو أنشئ سكربتاً جديداً</span>
                  </div>
                )}
              </div>

              {/* Bottom: Execution Logs Terminal */}
              <div className="h-[280px] bg-slate-950 border border-slate-800/90 rounded-2xl flex flex-col overflow-hidden shadow-xl">
                <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TerminalIcon className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs text-slate-200">شاشة المخرجات والسجلات الحية (Live Console)</span>
                    {selectedScript && (
                      <span className="text-[10px] text-slate-400 font-mono">[{selectedScript.name}]</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleClearLogs}
                      className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      مسح
                    </button>
                    <button
                      onClick={() => {
                        const allText = logs.map(l => l.message).join('\n');
                        navigator.clipboard.writeText(allText);
                        showToast("📋 تم نسخ السجلات إلى الحافظة", "info");
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-200 transition-colors"
                      title="نسخ السجلات"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-3.5 overflow-y-auto font-mono text-xs space-y-1" dir="ltr">
                  {logs.length === 0 ? (
                    <div className="text-slate-600 italic">لا توجد مخرجات بعد. اضغط "تشغيل السكربت" للبدء.</div>
                  ) : (
                    logs.map(log => {
                      let colorClass = 'text-slate-300';
                      if (log.type === 'stderr') colorClass = 'text-rose-400';
                      if (log.type === 'system') colorClass = 'text-sky-400';
                      if (log.message.includes('[pip]')) colorClass = 'text-amber-300';

                      return (
                        <div key={log.id} className="flex gap-2 leading-relaxed">
                          <span className="text-slate-600 select-none text-[10px]">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <span className={colorClass}>{log.message}</span>
                        </div>
                      );
                    })
                  )}
                  <div ref={scriptTerminalEndRef} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Create New Script */}
        <AnimatePresence>
          {isCreatingNew && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-400" />
                    <span>إنشاء سكربت بايثون جديد</span>
                  </h3>
                  <button
                    onClick={() => setIsCreatingNew(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      اسم الملف (مع الامتداد .py):
                    </label>
                    <input
                      type="text"
                      value={newScriptName}
                      onChange={e => setNewScriptName(e.target.value)}
                      placeholder="my_bot.py"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      قوالب جاهزة للبدء:
                    </label>
                    <div className="space-y-2">
                      {SCRIPT_TEMPLATES.map((tmpl, idx) => (
                        <div
                          key={tmpl.name}
                          onClick={() => {
                            setSelectedTemplateIndex(idx);
                            if (!newScriptName) setNewScriptName(tmpl.name);
                          }}
                          className={`p-3 rounded-xl cursor-pointer border transition-colors ${
                            selectedTemplateIndex === idx
                              ? 'bg-indigo-600/15 border-indigo-500 text-indigo-200'
                              : 'bg-slate-950 border-slate-800 hover:bg-slate-800/40 text-slate-300'
                          }`}
                        >
                          <div className="font-semibold text-xs font-mono">{tmpl.name}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{tmpl.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(false)}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateScript}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-indigo-600/20"
                    >
                      إنشاء السكربت
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ============================================================ */}
        {/* TAB 3: SERVER TELEMETRY & KEEP-ALIVE MONITOR                 */}
        {/* ============================================================ */}
        {activeTab === 'server_status' && serverTelemetry && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Server className="w-5 h-5 text-emerald-400" />
                  <span>مراقبة حالة السيرفر والكيب ألايف الحية (Server Telemetry)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  بيانات السيرفر الفعلية، الموقع الجغرافي، الذاكرة، الأقراص، وخدمة Keep-Alive التلقائية
                </p>
              </div>

              <button
                onClick={fetchServerTelemetry}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>تحديث البيانات</span>
              </button>
            </div>

            {/* Top Cards: Geolocation & Keepalive */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Country & Location */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
                  <span>الموقع الجغرافي</span>
                  <Globe className="w-4 h-4 text-sky-400" />
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">{serverTelemetry.flag}</span>
                  <div>
                    <div className="font-bold text-base text-slate-100">{serverTelemetry.countryAr}</div>
                    <div className="text-xs text-slate-400">{serverTelemetry.city || serverTelemetry.country}</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                  <span>IP: {serverTelemetry.ip}</span>
                  <span>{serverTelemetry.countryCode}</span>
                </div>
              </div>

              {/* Memory (RAM) */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
                  <span>ذاكرة السيرفر (RAM)</span>
                  <Cpu className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-bold text-slate-100 font-mono">
                  {(serverTelemetry.memory.used / (1024 * 1024 * 1024)).toFixed(1)} GB
                  <span className="text-xs font-normal text-slate-400 font-sans mr-2">
                    / {(serverTelemetry.memory.total / (1024 * 1024 * 1024)).toFixed(1)} GB
                  </span>
                </div>
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>نسبة الاستهلاك: {serverTelemetry.memory.percent}%</span>
                    <span className="font-mono">البوت: {(serverTelemetry.memory.process / (1024 * 1024)).toFixed(1)} MB</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-1.5 rounded-full"
                      style={{ width: `${serverTelemetry.memory.percent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Disk Space */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
                  <span>مساحة القرص</span>
                  <HardDrive className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-slate-100 font-mono">
                  {(serverTelemetry.disk.free / (1024 * 1024 * 1024)).toFixed(1)} GB
                  <span className="text-xs font-normal text-slate-400 font-sans mr-2">
                    متاح مجاناً
                  </span>
                </div>
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>مستخدم: {serverTelemetry.disk.percent}%</span>
                    <span className="font-mono">الإجمالي: {(serverTelemetry.disk.total / (1024 * 1024 * 1024)).toFixed(1)} GB</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full"
                      style={{ width: `${serverTelemetry.disk.percent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Keep-Alive Service */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
                  <span>خدمة Keep-Alive التلقائية</span>
                  <Activity className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-base text-emerald-400">نشط وتلقائي</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span>فحص كل:</span>
                    <span className="text-slate-200">{serverTelemetry.keepAlive.interval} ثانية</span>
                  </div>
                  <div className="flex justify-between">
                    <span>زمن الاستجابة:</span>
                    <span className="text-slate-200">{serverTelemetry.keepAlive.lastPing.ms || 12} ms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed System & Bot Specification Table */}
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
              <h3 className="font-bold text-sm text-slate-100 mb-4 flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-400" />
                <span>المواصفات التقنية والبيئة البرمجية</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <div className="text-slate-400 mb-1">إصدار بايثون (Python Runtime):</div>
                  <div className="font-mono text-emerald-400 text-sm font-semibold">{serverTelemetry.pythonVersion}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <div className="text-slate-400 mb-1">السكربتات المستضافة:</div>
                  <div className="font-mono text-slate-200 text-sm font-semibold">
                    {serverTelemetry.scriptsCount} ملف ({(serverTelemetry.scriptsBytes / 1024).toFixed(1)} KB)
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <div className="text-slate-400 mb-1">السكربتات النشطة قيد التشغيل:</div>
                  <div className="font-mono text-indigo-400 text-sm font-semibold">{serverTelemetry.runningScripts} قيد التشغيل</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <div className="text-slate-400 mb-1">مدة تشغيل الخادم (Server Uptime):</div>
                  <div className="font-mono text-slate-200 text-sm font-semibold">{serverTelemetry.uptime}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <div className="text-slate-400 mb-1">النطاق المكتشف (Public Domain):</div>
                  <div className="font-mono text-sky-400 text-sm truncate">{serverTelemetry.domain}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <div className="text-slate-400 mb-1">مزود الخدمة والشبكة (ISP):</div>
                  <div className="font-medium text-slate-200 text-sm">{serverTelemetry.isp || 'Google Cloud Run'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: PIP PACKAGE MANAGER                                   */}
        {/* ============================================================ */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-400" />
                  <span>مدير حزم ومكتبات بايثون (Pip Package Manager)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  تثبيت وإدارة مكتبات بايثون مع دعم التثبيت التلقائي للمكتبات المفقودة عند تشغيل أي سكربت
                </p>
              </div>

              {/* Install new package form */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={newPkgName}
                  onChange={e => setNewPkgName(e.target.value)}
                  placeholder="اسم الحزمة (مثال: requests, telebot, pillow)..."
                  className="bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none w-full sm:w-72 font-mono"
                />
                <button
                  onClick={handleInstallPackage}
                  disabled={isInstallingPkg || !newPkgName.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shrink-0 shadow-lg shadow-indigo-600/20"
                >
                  {isInstallingPkg ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>جارِ التثبيت...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>تثبيت مع Pip</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Install output if active */}
            {pkgInstallOutput && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto max-h-48 whitespace-pre-wrap" dir="ltr">
                {pkgInstallOutput}
              </div>
            )}

            {/* Search Packages */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={pkgSearch}
                onChange={e => setPkgSearch(e.target.value)}
                placeholder="بحث في الحزم المثبتة..."
                className="w-full bg-slate-900/70 border border-slate-800 rounded-xl pr-10 pl-4 py-2 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {packages
                .filter(p => p.name.toLowerCase().includes(pkgSearch.toLowerCase()))
                .map(pkg => (
                  <div
                    key={pkg.name}
                    className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-colors backdrop-blur-md"
                  >
                    <div className="font-bold text-xs text-slate-100 font-mono truncate" title={pkg.name}>
                      {pkg.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-mono">
                      {pkg.version ? `v${pkg.version}` : 'مثبت'}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: BOT CONFIG & ADMIN CONSOLE                            */}
        {/* ============================================================ */}
        {activeTab === 'admin_settings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                <span>إعدادات البوت ولوحة تحكم المشرف (Bot & Admin Console)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                ربط التوكن وحسابات الأدمن وإدارة صلاحيات المستخدمين وتنفيذ أوامر التيرمينال
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Token Configuration */}
              <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md space-y-4">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>تهيئة توكن تيليجرام (Telegram Bot Token)</span>
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  احصل على التوكن من <b>@BotFather</b> على تيليجرام ثم ضعه هنا لربط البوت الفعلي بالسيرفر.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      توكن البوت (Bot Token):
                    </label>
                    <input
                      type="password"
                      value={tokenInput}
                      onChange={e => setTokenInput(e.target.value)}
                      placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      معرف المشرف (Telegram Admin ID):
                    </label>
                    <input
                      type="text"
                      value={adminIdInput}
                      onChange={e => setAdminIdInput(e.target.value)}
                      placeholder="1726923679"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Verification result feedback */}
                  {tokenVerificationResult && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                        tokenVerificationResult.ok
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                      }`}
                    >
                      {tokenVerificationResult.ok ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>
                            تم التحقق بنجاح! البوت: <b>@{tokenVerificationResult.username}</b> ({tokenVerificationResult.name})
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>فشل التحقق: {tokenVerificationResult.error}</span>
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleVerifyToken}
                      disabled={isVerifyingToken || !tokenInput.trim()}
                      className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors flex items-center justify-center gap-1.5"
                    >
                      {isVerifyingToken && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      <span>فحص التوكن</span>
                    </button>

                    <button
                      onClick={handleSaveBotConfig}
                      disabled={isSavingConfig || !tokenInput.trim()}
                      className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
                    >
                      {isSavingConfig && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      <span>حفظ وتشغيل البوت</span>
                    </button>
                  </div>
                </div>

                {/* User PIN & Security */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">رمز PIN للأمان في تيليجرام: </span>
                    <span className="font-mono text-amber-300 font-bold tracking-widest">{securityPin || '684920'}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(securityPin);
                      showToast("تم نسخ كود الـ PIN", "info");
                    }}
                    className="p-1 rounded text-slate-400 hover:text-slate-200"
                    title="نسخ PIN"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Column: User Management & Mode */}
              <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md space-y-4">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>إدارة صلاحيات المستخدمين والحظر</span>
                </h3>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <div>
                    <div className="font-semibold text-xs text-slate-200">وضع البوت الحالي:</div>
                    <div className="text-[11px] text-slate-400">
                      {botRunnerStatus?.mode === 'public'
                        ? 'متاح لجميع المستخدمين في تيليجرام'
                        : 'مقيد بالمشرفين المعتمدين فقط'}
                    </div>
                  </div>

                  <button
                    onClick={handleToggleBotMode}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors"
                  >
                    تبديل الوضع
                  </button>
                </div>

                {/* Ban user */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    حظر مستخدم عبر معرفه (User ID):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={banUserIdInput}
                      onChange={e => setBanUserIdInput(e.target.value)}
                      placeholder="12345678"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={handleBanUser}
                      className="px-4 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold transition-colors shrink-0"
                    >
                      حظر
                    </button>
                  </div>
                </div>

                {/* Banned Users List */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    المستخدمون المحظورون ({botRunnerStatus?.bannedUsers.length || 0}):
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {(!botRunnerStatus?.bannedUsers || botRunnerStatus.bannedUsers.length === 0) ? (
                      <span className="text-xs text-slate-500">لا يوجد أي مستخدم محظور.</span>
                    ) : (
                      botRunnerStatus.bannedUsers.map(uid => (
                        <span
                          key={uid}
                          className="px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-1.5"
                        >
                          <span>{uid}</span>
                          <button
                            onClick={() => handleUnbanUser(uid)}
                            className="text-rose-400 hover:text-rose-200"
                            title="إلغاء الحظر"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Full Width: Web Terminal Console (executing bash commands directly) */}
              <div className="lg:col-span-12 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <TerminalIcon className="w-4 h-4 text-emerald-400" />
                    <span>أوامر التيرمينال التفاعلية المباشرة (Web Terminal Runner)</span>
                  </h3>
                  <span className="text-xs text-slate-400">ميزة أمر "💻 Envoyer commande terminal"</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={terminalCmd}
                    onChange={e => setTerminalCmd(e.target.value)}
                    placeholder="مثال: python3 --version أو free -h أو ls -la..."
                    dir="ltr"
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-emerald-400 font-mono focus:outline-none"
                  />
                  <button
                    onClick={handleExecuteTerminal}
                    disabled={isExecutingTerminal || !terminalCmd.trim()}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    {isExecutingTerminal && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>تنفيذ الأمر</span>
                  </button>
                </div>

                {/* Quick commands */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-400">اقتراحات:</span>
                  {[
                    'python3 --version',
                    'pip list',
                    'free -m',
                    'df -h',
                    'uptime',
                    'ls -la hosted_scripts'
                  ].map(c => (
                    <button
                      key={c}
                      onClick={() => {
                        setTerminalCmd(c);
                      }}
                      className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] border border-slate-700/60"
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {/* Output window */}
                {terminalOutput && (
                  <div className="mt-3 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-x-auto max-h-60" dir="ltr">
                    {terminalOutput.stdout && (
                      <div className="text-emerald-400 whitespace-pre-wrap">{terminalOutput.stdout}</div>
                    )}
                    {terminalOutput.stderr && (
                      <div className="text-rose-400 whitespace-pre-wrap">{terminalOutput.stderr}</div>
                    )}
                    <div className="text-slate-600 text-[10px] mt-2 pt-2 border-t border-slate-800">
                      Process exited with code {terminalOutput.exitCode}
                    </div>
                  </div>
                )}
              </div>

              {/* Full Width: Python Bot Daemon Live Logs */}
              <div className="lg:col-span-12 bg-slate-950 border border-slate-800/90 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-xs text-slate-200">سجلات خادم البوت في الخلفية (Daemon Logs)</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    PID: {botRunnerStatus?.pid || 'غير نشط'}
                  </span>
                </div>

                <div className="h-44 overflow-y-auto font-mono text-xs space-y-1 text-slate-300" dir="ltr">
                  {(!botRunnerStatus?.recentLogs || botRunnerStatus.recentLogs.length === 0) ? (
                    <div className="text-slate-600 italic">لا توجد سجلات حالياً لخادم البوت.</div>
                  ) : (
                    botRunnerStatus.recentLogs.map((l, idx) => (
                      <div key={idx} className="leading-relaxed">
                        <span className="text-slate-500">{l}</span>
                      </div>
                    ))
                  )}
                  <div ref={botLogsEndRef} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          لوحة تحكم واستضافة سكربتات بايثون وبوت تيليجرام المباشرة &bull; istidafa4_by_moon &bull; جميع الحقوق محفوظة
        </p>
      </footer>
    </div>
  );
}
