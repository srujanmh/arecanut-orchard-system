import React, { useState, useEffect } from 'react';
import { 
  Sprout, Cpu, Database, Network, Brain, Droplets, Sparkles, ShieldCheck, 
  Layers, Wifi, Bell, FileSpreadsheet, Settings, LogOut, Compass, TrendingUp, 
  UserCheck, RefreshCw, Play, Pause, Upload, Search, ChevronRight, MessageSquareCode
} from 'lucide-react';
import LandingPage from './components/LandingPage';
import { 
  SensorMonitor, CommLayer, EdgeComputing, AIControl, SmartIrrigation, 
  Fertigation, PestDisease, WeedManagement, FoliarSpray, YieldAnalytics, 
  DigitalTwin, AlertSystem, DeviceManagement, DatabaseVisualizer, 
  AIModelVisualizer, Reports, SettingsView, AIChatAssistant 
} from './modules/ModulesBundle';
import { getInitialState, updateSimulation, SystemState } from './utils/simulator';

type TabType = 
  | 'sensors' | 'comm' | 'edge' | 'ai' | 'irrigation' | 'fertigation'
  | 'pest' | 'weed' | 'drone' | 'yield' | 'twin' | 'alerts'
  | 'devices' | 'db' | 'models' | 'reports' | 'settings';

export default function App() {
  const [sessionActive, setSessionActive] = useState(false);
  const [role, setRole] = useState("farmer");
  const [activeTab, setActiveTab] = useState<TabType>('sensors');
  const [state, setState] = useState<SystemState>(getInitialState());
  const [autoIrrigation, setAutoIrrigation] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);

  // Initialize simulation clock
  useEffect(() => {
    if (!sessionActive) return;
    const interval = setInterval(() => {
      setState(prev => updateSimulation(prev, autoIrrigation));
    }, 4000);
    return () => clearInterval(interval);
  }, [sessionActive, autoIrrigation]);

  const handleLaunch = (selectedRole: string) => {
    setRole(selectedRole);
    setSessionActive(true);
  };

  const logout = () => {
    setSessionActive(false);
  };

  const handleExecuteCommand = (cmd: any) => {
    setState(prev => {
      // Create a deep copy of sensors and valves to avoid mutation side effects
      const nextSensors = { ...prev.sensors };
      const nextValves = { ...prev.valves };
      let nextDrone = { ...prev.drone };
      let nextAlerts = [...prev.alerts];

      if (cmd.action === 'open_valve') {
        const zone = cmd.zone;
        if (nextValves[zone]) {
          nextValves[zone] = {
            ...nextValves[zone],
            valve_open: true,
            flow_rate: 35.0
          };
          nextAlerts = nextAlerts.map(alert => 
            (alert.zone === zone && alert.type === 'low_moisture')
              ? { ...alert, resolved: true }
              : alert
          );
        }
      } 
      else if (cmd.action === 'close_valve') {
        const zone = cmd.zone;
        if (nextValves[zone]) {
          nextValves[zone] = {
            ...nextValves[zone],
            valve_open: false,
            flow_rate: 0.0
          };
        }
      }
      else if (cmd.action === 'start_drone') {
        nextDrone = {
          ...nextDrone,
          status: "flying",
          battery: 95,
          tank_payload: 100,
          path: [
            { x: 10, y: 10 },
            { x: 30, y: 50 },
            { x: 70, y: 20 },
            { x: 90, y: 80 }
          ]
        };
        nextAlerts = [
          ...nextAlerts,
          {
            id: `alert-drone-${Date.now()}`,
            zone: "All Zones",
            type: "drone_mission",
            severity: "info",
            message: "Foliar spray drone mission initiated via AI Copilot command.",
            timestamp: new Date().toLocaleTimeString(),
            resolved: false
          }
        ];
      }
      else if (cmd.action === 'recall_drone') {
        nextDrone = {
          ...nextDrone,
          status: "charging",
          path: []
        };
      }
      else if (cmd.action === 'set_npk') {
        const zone = cmd.zone;
        if (nextSensors[zone]) {
          nextSensors[zone] = {
            ...nextSensors[zone],
            nitrogen: cmd.nitrogen !== undefined ? cmd.nitrogen : nextSensors[zone].nitrogen,
            phosphorus: cmd.phosphorus !== undefined ? cmd.phosphorus : nextSensors[zone].phosphorus,
            potassium: cmd.potassium !== undefined ? cmd.potassium : nextSensors[zone].potassium
          };
        }
      }
      else if (cmd.action === 'set_close_threshold') {
        const zone = cmd.zone;
        if (nextValves[zone]) {
          nextValves[zone] = {
            ...nextValves[zone],
            close_threshold: cmd.threshold
          };
          nextAlerts = [
            ...nextAlerts,
            {
              id: `alert-thresh-${Date.now()}`,
              zone,
              type: "Threshold Configured",
              severity: "info",
              message: `Auto-close threshold set to ${cmd.threshold}% soil moisture via Copilot command.`,
              timestamp: new Date().toLocaleTimeString(),
              resolved: false
            }
          ];
        }
      }

      return {
        ...prev,
        sensors: nextSensors,
        valves: nextValves,
        drone: nextDrone,
        alerts: nextAlerts
      };
    });
  };

  if (!sessionActive) {
    return <LandingPage onLaunch={handleLaunch} />;
  }

  // Define sidebar navigation items based on Role-Based Access
  const sidebarItems: { id: TabType; label: string; icon: any; roles: string[] }[] = [
    { id: 'sensors', label: 'Sensor Monitor', icon: Sprout, roles: ['farmer', 'agronomist', 'technician', 'super_admin'] },
    { id: 'comm', label: 'Communication Layer', icon: Network, roles: ['technician', 'super_admin'] },
    { id: 'edge', label: 'Edge Preprocessing', icon: Cpu, roles: ['technician', 'super_admin'] },
    { id: 'ai', label: 'AI Decision Center', icon: Brain, roles: ['farmer', 'agronomist', 'super_admin'] },
    { id: 'irrigation', label: 'Smart Irrigation', icon: Droplets, roles: ['farmer', 'super_admin'] },
    { id: 'fertigation', label: 'Fertigation Dosing', icon: Layers, roles: ['farmer', 'agronomist', 'super_admin'] },
    { id: 'pest', label: 'Pest Diagnosis', icon: ShieldCheck, roles: ['farmer', 'agronomist', 'super_admin'] },
    { id: 'weed', label: 'Weed Robotics', icon: Compass, roles: ['farmer', 'super_admin'] },
    { id: 'drone', label: 'Drone Sprayer', icon: Compass, roles: ['farmer', 'super_admin'] },
    { id: 'yield', label: 'Yield Analytics', icon: TrendingUp, roles: ['farmer', 'agronomist', 'super_admin'] },
    { id: 'twin', label: 'Orchard Twin', icon: Layers, roles: ['farmer', 'agronomist', 'technician', 'super_admin'] },
    { id: 'alerts', label: 'Alert Dispatcher', icon: Bell, roles: ['farmer', 'technician', 'super_admin'] },
    { id: 'devices', label: 'Device Managers', icon: Cpu, roles: ['technician', 'super_admin'] },
    { id: 'db', label: 'Database Schemes', icon: Database, roles: ['super_admin'] },
    { id: 'models', label: 'AI Architectures', icon: Brain, roles: ['agronomist', 'super_admin'] },
    { id: 'reports', label: 'Reports Exports', icon: FileSpreadsheet, roles: ['farmer', 'agronomist', 'super_admin'] },
    { id: 'settings', label: 'Settings Panel', icon: Settings, roles: ['super_admin'] }
  ];

  const filteredSidebar = sidebarItems.filter(item => item.roles.includes(role));

  const activeAlertsCount = state.alerts.filter(a => !a.resolved).length;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-900 bg-slate-950 flex flex-col justify-between shrink-0 h-full">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand header */}
          <div className="p-6 border-b border-slate-900 flex items-center gap-3">
            <div className="p-2 bg-emerald-600/20 border border-emerald-500/30 rounded-lg">
              <Sprout className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white">AGRISENSE CONSOLE</span>
              <span className="text-[9px] text-slate-500 block font-semibold uppercase tracking-wider -mt-0.5">Commercial SaaS</span>
            </div>
          </div>

          {/* User profile card */}
          <div className="p-4 mx-4 my-3 bg-slate-900/50 border border-slate-900 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">
              {role[0].toUpperCase()}
            </div>
            <div>
              <span className="font-bold text-xs text-white block capitalize">{role.replace("_", " ")}</span>
              <span className="text-[9px] text-slate-500 block">Orchard Level Auth</span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="px-4 py-2 space-y-1">
            {filteredSidebar.map(item => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    isActive 
                      ? 'bg-emerald-600/15 border-emerald-500/20 text-emerald-400 shadow-md shadow-emerald-500/5' 
                      : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-900/40'
                  }`}
                >
                  <IconComp className="w-4 h-4 shrink-0" />
                  {item.label}
                  {item.id === 'alerts' && activeAlertsCount > 0 && (
                    <span className="ml-auto w-4 h-4 rounded-full bg-red-600 text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                      {activeAlertsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer logout */}
        <div className="p-4 border-t border-slate-900">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-red-950/20 hover:border-red-900/30 border border-slate-850 rounded-xl text-xs font-bold text-slate-400 hover:text-red-400 transition-all"
          >
            <LogOut className="w-4 h-4" /> Exit Session
          </button>
        </div>
      </aside>

      {/* Main Panel Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-950">
        
        {/* Top telemetry ribbon */}
        <header className="h-16 border-b border-slate-900 flex items-center justify-between px-8 bg-slate-950/60 z-20 shrink-0">
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5"><Wifi className="w-4 h-4 text-emerald-400" /> Gateway: Online</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            <span className="flex items-center gap-1.5"><Database className="w-4 h-4 text-purple-400" /> PostgreSQL & InfluxDB Syncing</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Alarm bell button */}
            <button 
              onClick={() => setActiveTab('alerts')}
              className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 hover:text-white relative transition-all"
            >
              <Bell className="w-4 h-4" />
              {activeAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              )}
            </button>
            {/* AI Assistant Chat Trigger */}
            <button 
              onClick={() => setAiChatOpen(!aiChatOpen)}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                aiChatOpen 
                  ? "bg-emerald-600/10 border-emerald-500 text-emerald-400" 
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <MessageSquareCode className="w-4 h-4" /> Ask Copilot
            </button>
          </div>
        </header>

        {/* Page Content viewport */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Render selected view module */}
            {activeTab === 'sensors' && <SensorMonitor state={state} setState={setState} role={role} />}
            {activeTab === 'comm' && <CommLayer state={state} setState={setState} role={role} />}
            {activeTab === 'edge' && <EdgeComputing state={state} setState={setState} role={role} />}
            {activeTab === 'ai' && <AIControl state={state} setState={setState} role={role} />}
            {activeTab === 'irrigation' && <SmartIrrigation state={state} setState={setState} role={role} />}
            {activeTab === 'fertigation' && <Fertigation state={state} setState={setState} role={role} />}
            {activeTab === 'pest' && <PestDisease state={state} setState={setState} role={role} />}
            {activeTab === 'weed' && <WeedManagement state={state} setState={setState} role={role} />}
            {activeTab === 'drone' && <FoliarSpray state={state} setState={setState} role={role} />}
            {activeTab === 'yield' && <YieldAnalytics />}
            {activeTab === 'twin' && <DigitalTwin state={state} setState={setState} role={role} />}
            {activeTab === 'alerts' && <AlertSystem state={state} setState={setState} role={role} />}
            {activeTab === 'devices' && <DeviceManagement state={state} setState={setState} role={role} />}
            {activeTab === 'db' && <DatabaseVisualizer />}
            {activeTab === 'models' && <AIModelVisualizer />}
            {activeTab === 'reports' && <Reports />}
            {activeTab === 'settings' && <SettingsView />}

          </div>
        </div>
      </main>

      {/* AI Assistant Chat drawer */}
      {aiChatOpen && <AIChatAssistant state={state} onExecuteCommand={handleExecuteCommand} />}

    </div>
  );
}
