import React, { useState, useEffect, useRef } from 'react';
import { 
  Sprout, Cpu, Database, Network, Brain, Droplets, Sparkles, ShieldCheck, 
  Layers, Wifi, Bell, FileSpreadsheet, Settings, LogOut, Compass, TrendingUp, 
  UserCheck, RefreshCw, Play, Pause, Upload, Search, Send, Volume2, VolumeX, ShieldAlert, Mic, MicOff
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, BarChart, Bar, LineChart, Line, Cell, PieChart, Pie
} from 'recharts';
import GlassCard from '../components/GlassCard';
import StatCard from '../components/StatCard';
import { SystemState } from '../utils/simulator';

interface ModuleProps {
  state: SystemState;
  setState: React.Dispatch<React.SetStateAction<SystemState>>;
  role: string;
}

// ====================================================
// MODULE 1: SENSOR & DATA COLLECTION
// ====================================================
export function SensorMonitor({ state }: ModuleProps) {
  const [selectedZone, setSelectedZone] = useState("Zone Alpha");
  const sensor = state.sensors[selectedZone];

  const [chartMetric, setChartMetric] = useState("moisture");
  const [chartRange, setChartRange] = useState("24h");

  const getMetricDetails = () => {
    switch (chartMetric) {
      case "moisture": return { label: "Soil Moisture (%)", color: "#10b981", base: sensor.soil_moisture };
      case "temp": return { label: "Soil Temp (°C)", color: "#f59e0b", base: sensor.soil_temp };
      case "ph": return { label: "Soil pH", color: "#3b82f6", base: sensor.ph };
      case "ec": return { label: "EC (dS/m)", color: "#8b5cf6", base: sensor.ec };
      case "nitrogen": return { label: "Nitrogen (N)", color: "#10b981", base: sensor.nitrogen };
      case "phosphorus": return { label: "Phosphorus (P)", color: "#14b8a6", base: sensor.phosphorus };
      case "potassium": return { label: "Potassium (K)", color: "#0ea5e9", base: sensor.potassium };
      default: return { label: "Value", color: "#10b981", base: 30 };
    }
  };

  const { label: chartLabel, color: chartColor, base: baseVal } = getMetricDetails();

  const getChartData = () => {
    const points = chartRange === "24h" ? 24 : chartRange === "7d" ? 7 : 30;
    return Array.from({ length: points }).map((_, i) => {
      const idx = points - 1 - i;
      let timeStr = "";
      if (chartRange === "24h") {
        timeStr = `${idx === 0 ? "Now" : idx + "h ago"}`;
      } else {
        timeStr = `${idx === 0 ? "Today" : idx + "d ago"}`;
      }
      const wave = Math.sin(i * 0.4) * (baseVal * 0.08) + Math.cos(i * 0.7) * (baseVal * 0.03);
      const value = Math.max(0, baseVal + wave);
      return { time: timeStr, value };
    });
  };

  const chartData = getChartData();
  const values = chartData.map(d => d.value);
  const avgVal = values.reduce((a, b) => a + b, 0) / values.length;
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);

  const getStatusColor = (val: number, type: string) => {
    if (type === 'moisture') return val < 25 ? 'text-red-400 font-bold' : val < 35 ? 'text-amber-400 font-semibold' : 'text-emerald-400';
    if (type === 'ph') return (val < 5.5 || val > 7.5) ? 'text-red-400 font-bold' : 'text-emerald-400';
    return 'text-emerald-400';
  };

  // Sparkline data
  const sparklineData = Array.from({ length: 10 }).map((_, i) => ({
    val: 30 + Math.sin(i * 0.5) * 5 + (selectedZone === "Zone Delta" ? -8 : 5)
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Sensor Telemetry Monitor</h2>
          <p className="text-slate-400 text-xs">Real-time data streams across orchard zones at node level.</p>
        </div>
        <select
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
        >
          {Object.keys(state.sensors).map(z => <option key={z} value={z}>{z}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <GlassCard className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Soil Moisture</p>
              <h3 className={`text-3xl font-extrabold ${getStatusColor(sensor.soil_moisture, 'moisture')}`}>{sensor.soil_moisture}%</h3>
            </div>
            <div className="p-2 bg-emerald-600/10 rounded-lg text-emerald-400"><Droplets className="w-5 h-5" /></div>
          </div>
          <div className="h-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <Area type="monotone" dataKey="val" stroke="#10b981" fill="rgba(16,185,129,0.1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Uptime: 99.8%</span>
            <span>RSSI: {sensor.rssi} dBm</span>
          </div>
        </GlassCard>

        <GlassCard className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Soil Temperature</p>
              <h3 className="text-3xl font-extrabold text-white">{sensor.soil_temp} °C</h3>
            </div>
            <div className="p-2 bg-amber-600/10 rounded-lg text-amber-400"><Cpu className="w-5 h-5" /></div>
          </div>
          <div className="h-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData.map(d => ({ val: d.val * 0.8 }))}>
                <Area type="monotone" dataKey="val" stroke="#f59e0b" fill="rgba(245,158,11,0.1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Sensor: PT100</span>
            <span>Battery: {((sensor.battery_mv - 3000)/1200*100).toFixed(0)}%</span>
          </div>
        </GlassCard>

        <GlassCard className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Soil pH / EC</p>
              <h3 className={`text-3xl font-extrabold ${getStatusColor(sensor.ph, 'ph')}`}>pH {sensor.ph}</h3>
            </div>
            <div className="p-2 bg-blue-600/10 rounded-lg text-blue-400"><Layers className="w-5 h-5" /></div>
          </div>
          <div className="flex justify-between items-center text-xs pt-2">
            <span className="text-slate-400 font-semibold">Electrical Conductivity:</span>
            <span className="font-mono text-white">{sensor.ec} dS/m</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Calibration: 2026-05</span>
            <span>Status: Healthy</span>
          </div>
        </GlassCard>
      </div>

      {/* NPK telemetry cards */}
      <GlassCard className="space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">NPK Soil Nutrients (Macronutrients)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Nitrogen (N)", val: sensor.nitrogen, max: 60, color: "bg-emerald-500" },
            { label: "Phosphorus (P)", val: sensor.phosphorus, max: 30, color: "bg-teal-500" },
            { label: "Potassium (K)", val: sensor.potassium, max: 50, color: "bg-sky-500" }
          ].map((npk, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-400">{npk.label}</span>
                <span className="font-mono text-white font-bold">{npk.val} mg/kg</span>
              </div>
              <div className="w-full h-3 bg-slate-800 border border-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${npk.color} transition-all duration-500`}
                  style={{ width: `${(npk.val / npk.max) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 block">Target Range: {(npk.max * 0.7).toFixed(0)} - {npk.max} mg/kg</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Atmospheric block */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Humidity", val: `${sensor.humidity}%`, icon: Droplets, color: "text-blue-400" },
          { title: "Rainfall", val: `${sensor.rainfall} mm/h`, icon: Sprout, color: "text-emerald-400" },
          { title: "Wind Speed", val: `${sensor.wind_speed} km/h`, icon: Compass, color: "text-teal-400" },
          { title: "Solar Radiation", val: `${sensor.solar_radiation} W/m²`, icon: Sparkles, color: "text-amber-400" }
        ].map((item, i) => (
          <GlassCard key={i} className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">{item.title}</p>
              <h4 className="text-lg font-bold text-white mt-1">{item.val}</h4>
            </div>
            <div className={`p-2 bg-slate-900 border border-slate-800 rounded-lg ${item.color}`}>
              <item.icon className="w-4 h-4" />
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Advanced Time-Series History Analyzer */}
      <GlassCard className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Advanced Time-Series History Analyzer</h3>
            <p className="text-[10px] text-slate-500">View detailed historical trend charts for soil and atmospheric sensors.</p>
          </div>
          <div className="flex gap-3">
            <select
              value={chartMetric}
              onChange={(e) => setChartMetric(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="moisture">Soil Moisture (%)</option>
              <option value="temp">Soil Temperature (°C)</option>
              <option value="ph">Soil pH</option>
              <option value="ec">Electrical Conductivity (dS/m)</option>
              <option value="nitrogen">Nitrogen (N)</option>
              <option value="phosphorus">Phosphorus (P)</option>
              <option value="potassium">Potassium (K)</option>
            </select>
            <select
              value={chartRange}
              onChange={(e) => setChartRange(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>

        <div className="h-64 bg-slate-950 p-4 border border-slate-900 rounded-2xl">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`colorMetric-${chartMetric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" style={{ fontSize: 9, fontFamily: 'monospace' }} />
              <YAxis stroke="#64748b" style={{ fontSize: 9, fontFamily: 'monospace' }} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: 12, fontSize: 11 }}
                labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="value" stroke={chartColor} fillOpacity={1} fill={`url(#colorMetric-${chartMetric})`} strokeWidth={2} name={chartLabel} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap gap-6 text-[10px] text-slate-400 bg-slate-900/30 p-3 rounded-xl border border-slate-900">
          <div>
            <span className="font-semibold block text-slate-500">Metric Average:</span>
            <span className="text-white font-bold text-xs">{avgVal.toFixed(2)}</span>
          </div>
          <div>
            <span className="font-semibold block text-slate-500">Peak Value:</span>
            <span className="text-white font-bold text-xs">{maxVal.toFixed(2)}</span>
          </div>
          <div>
            <span className="font-semibold block text-slate-500">Minimum Value:</span>
            <span className="text-white font-bold text-xs">{minVal.toFixed(2)}</span>
          </div>
          <div>
            <span className="font-semibold block text-slate-500">Variance Index:</span>
            <span className="text-emerald-400 font-bold text-xs">Optimal Stability</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

// ====================================================
// MODULE 2: COMMUNICATION LAYER
// ====================================================
export function CommLayer({ state }: ModuleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Width coordinates
      const w = canvas.width;
      const h = canvas.height;

      // Draw nodes
      const nodes = [
        { name: "Node A", x: 50, y: h - 60, status: state.comm.esp32_status },
        { name: "Node B", x: 150, y: h - 60, status: state.comm.esp32_status },
        { name: "Node C", x: 250, y: h - 60, status: state.comm.esp32_status },
        { name: "Node D", x: 350, y: h - 60, status: "online" }
      ];

      const gateway = { name: "Gateway", x: w / 2, y: h / 2 };
      const cloud = { name: "Agrisense Cloud", x: w / 2, y: 60 };

      // Draw Paths and packets
      nodes.forEach(n => {
        // Draw LoRa path
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(gateway.x, gateway.y);
        ctx.strokeStyle = "rgba(16, 185, 129, 0.2)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw packet particles
        const progress = ((frame + n.x * 2) % 100) / 100;
        const px = n.x + (gateway.x - n.x) * progress;
        const py = n.y + (gateway.y - n.y) * progress;
        
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#10b981";
        ctx.fill();

        // Draw node circles
        ctx.beginPath();
        ctx.arc(n.x, n.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = n.status === "online" ? "#10b981" : "#ef4444";
        ctx.fill();
        ctx.fillStyle = "#64748b";
        ctx.font = "9px monospace";
        ctx.fillText(n.name, n.x - 18, n.y + 20);
      });

      // Draw Gateway to Cloud
      ctx.beginPath();
      ctx.moveTo(gateway.x, gateway.y);
      ctx.lineTo(cloud.x, cloud.y);
      ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Cloud packets
      const progress = (frame % 80) / 80;
      const px = gateway.x + (cloud.x - gateway.x) * progress;
      const py = gateway.y + (cloud.y - gateway.y) * progress;
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#3b82f6";
      ctx.fill();

      // Gateway dot
      ctx.beginPath();
      ctx.arc(gateway.x, gateway.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = "#3b82f6";
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "9px monospace";
      ctx.fillText(gateway.name, gateway.x - 22, gateway.y + 26);

      // Cloud dot
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = "#a855f7";
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "9px monospace";
      ctx.fillText(cloud.name, cloud.x - 38, cloud.y + 30);

      frame += 1;
      requestAnimationFrame(animate);
    };

    animate();
  }, [state]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">IoT Communication Layer</h2>
        <p className="text-slate-400 text-xs font-medium">Telemetry transmissions flow (LoRaWAN nodes to gateway and cloud).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <GlassCard className="lg:col-span-8 space-y-4">
          <h3 className="text-sm font-bold text-slate-300">Live Network Packet Visualizer</h3>
          <canvas ref={canvasRef} width={450} height={320} className="w-full bg-slate-950/90 border border-slate-800 rounded-xl" />
        </GlassCard>

        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300">Uplink Telemetry Diagnostics</h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">Gateway Link</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1"><Wifi className="w-3.5 h-3.5" /> ONLINE</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">Mean Latency</span>
                <span className="text-white font-mono">{state.comm.latency_ms} ms</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">LoRa SNR</span>
                <span className="text-white font-mono">{state.comm.lora_snr} dB</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">Average Packet Loss</span>
                <span className="text-emerald-400 font-mono">{state.comm.packet_loss}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Packets Received</span>
                <span className="text-purple-400 font-mono font-bold">{state.comm.packets_sent} pkts</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300">Gateway Uplink Logs</h3>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-[10px] space-y-2 h-44 overflow-y-auto">
              <p className="text-emerald-400">[info] LoRaWAN Gateway listening on Channel 01</p>
              <p className="text-slate-500">[uplink] ID: NODE-ALPHA, Payload: [Moisture=38.5, pH=6.2] OK</p>
              <p className="text-slate-500">[uplink] ID: NODE-BETA, Payload: [Moisture=28.1, pH=5.8] OK</p>
              <p className="text-slate-500">[uplink] ID: NODE-GAMMA, Payload: [Moisture=42.0, pH=6.5] OK</p>
              <p className="text-amber-400">[warn] Outlier detected at NODE-DELTA. Isolated by Preprocessor.</p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// ====================================================
// MODULE 3: EDGE COMPUTING
// ====================================================
export function EdgeComputing({ state }: ModuleProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Edge Preprocessing & Data Cleaning</h2>
        <p className="text-slate-400 text-xs">Details local anomaly isolation and signal smoothing on the gateway.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Kalman Filter Drops" value={state.edge.filtered_outliers} icon={Layers} color="text-amber-400" />
        <StatCard title="Anomaly Detected" value={state.edge.anomaly_detected ? "TRUE" : "FALSE"} icon={Cpu} color={state.edge.anomaly_detected ? "text-red-400" : "text-emerald-400"} />
        <StatCard title="Payload Compression" value={`${state.edge.compression_ratio}:1`} icon={Network} color="text-blue-400" />
        <StatCard title="Edge Flash Buffer" value={`${state.edge.local_storage_used_bytes} B`} icon={Database} color="text-purple-400" />
      </div>

      <GlassCard className="space-y-4">
        <h3 className="text-sm font-bold text-slate-300">Local Isolation Forest - Outlier Detection</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          The edge gateway implements a lightweight 1D Isolation Forest classifier. Telemetry spikes exceeding 3 standard deviations (e.g., pH readings above 10 due to sensor dirtiness) are isolated and filtered locally to conserve LoRa mesh bandwidth.
        </p>
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-900 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
          <div className="space-y-2">
            <span className="text-slate-500 block">Anomaly Method:</span>
            <span className="text-white font-bold">Local Standard Deviation Filter</span>
          </div>
          <div className="space-y-2">
            <span className="text-slate-500 block">Outlier action:</span>
            <span className="text-amber-400 font-bold">Discard Telemetry, Dispatch Alert</span>
          </div>
          <div className="space-y-2">
            <span className="text-slate-500 block">Compression Scheme:</span>
            <span className="text-blue-400 font-bold">Delta Encoding (Mesh optimized)</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

// ====================================================
// MODULE 4: AI CONTROL CENTER
// ====================================================
export function AIControl({ state }: ModuleProps) {
  const [activeAutoIrrigation, setActiveAutoIrrigation] = useState(false);

  const shapData = [
    { name: "Moisture Level", val: -55, color: "#ef4444" },
    { name: "Solar Radiation", val: 28, color: "#f59e0b" },
    { name: "Leaf Temp", val: 12, color: "#3b82f6" },
    { name: "Wind Speed", val: 5, color: "#10b981" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">AI Control Center & Decision Support</h2>
          <p className="text-slate-400 text-xs">Review closed-loop recommendations and explainable features.</p>
        </div>
        <button
          onClick={() => setActiveAutoIrrigation(!activeAutoIrrigation)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeAutoIrrigation 
              ? "bg-emerald-600/20 border border-emerald-500 text-emerald-400" 
              : "bg-slate-900 border border-slate-800 text-slate-400"
          }`}
        >
          {activeAutoIrrigation ? "Auto-AI Irrigation: ENABLED" : "Auto-AI Irrigation: DISABLED"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <GlassCard className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300">Active Crop Management Recommendations</h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/60 border-l-4 border-red-500 rounded-r-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-red-400">IRRIGATION WATER SHORTAGE</span>
                  <span className="font-mono text-slate-400">Confidence: 94% | Model: LSTM</span>
                </div>
                <p className="text-xs text-slate-200">
                  Critical soil moisture drop detected in Zone Delta (19.5%). Trigger valve actuation for 25 minutes to restore root saturation.
                </p>
              </div>

              <div className="p-4 bg-slate-900/60 border-l-4 border-amber-500 rounded-r-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-amber-400">NPK DOSING DEFICIENCY</span>
                  <span className="font-mono text-slate-400">Confidence: 88% | Model: XGBoost</span>
                </div>
                <p className="text-xs text-slate-200">
                  Zone Beta shows nitrogen levels at 38 mg/kg (optimal &gt; 45 mg/kg). Dispatch fertigation dose of NPK ratios (0.5 - 0.2 - 0.4).
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Explainable AI (XAI) */}
          <GlassCard className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300">Explainable AI (XAI) - SHAP Feature Importance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Below are the SHAP values explaining the irrigation recommendations. A negative SHAP value pulls the decision toward irrigating immediately (low soil moisture is the primary driver).
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shapData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="#64748b" fontSize={10} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }} />
                  <Bar dataKey="val">
                    {shapData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300">Predictive Risk Metrics</h3>
            <div className="space-y-4">
              <div className="text-center py-6 border border-slate-850 bg-slate-950/60 rounded-2xl relative">
                <p className="text-xs text-slate-500 uppercase font-bold">Orchard Dehydration Risk</p>
                <h2 className="text-4xl font-extrabold text-red-500 mt-2">78%</h2>
                <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 font-semibold mt-2 inline-block">High Alert Status</span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between border-b border-slate-850 pb-2">
                  <span className="text-slate-400">Bud Rot Risk</span>
                  <span className="text-emerald-400 font-bold">12% (Low)</span>
                </div>
                <div className="flex justify-between border-b border-slate-850 pb-2">
                  <span className="text-slate-400">Leaf Yellowing Risk</span>
                  <span className="text-amber-400 font-bold">34% (Medium)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nutrient Depletion</span>
                  <span className="text-red-400 font-bold">64% (High)</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// ====================================================
// MODULE 5: SMART IRRIGATION
// ====================================================
export function SmartIrrigation({ state, setState }: ModuleProps) {
  const [bypassEnabled, setBypassEnabled] = useState(false);

  const toggleValve = (zone: string) => {
    setState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as SystemState;
      const isOpen = !next.valves[zone].valve_open;
      next.valves[zone].valve_open = isOpen;
      next.valves[zone].flow_rate = isOpen ? 45.2 : 0.0;
      
      // Add custom log to alerts
      next.alerts.unshift({
        id: `irrigation-act-${Date.now()}`,
        zone,
        type: "Valve Actuated Manually",
        severity: "info",
        message: `User manually ${isOpen ? 'OPENED' : 'CLOSED'} irrigation Valve ${zone[-1]}.`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
      return next;
    });
  };

  // Fetch live average values from the orchard's temperature and ambient sensors
  const zonesList = Object.values(state.sensors);
  const avgTemp = zonesList.reduce((sum, s) => sum + s.soil_temp, 0) / zonesList.length;
  const avgHum = zonesList.reduce((sum, s) => sum + s.humidity, 0) / zonesList.length;
  const avgRain = zonesList.reduce((sum, s) => sum + s.rainfall, 0) / zonesList.length;

  const forecasts = [
    { 
      day: "Today (Live)", 
      temp: `${avgTemp.toFixed(1)}°C`, 
      hum: `${avgHum.toFixed(0)}%`, 
      icon: avgRain > 0.1 ? "🌧️" : avgHum > 70 ? "⛅" : "☀️", 
      desc: avgRain > 0.1 ? "Active Rain" : avgHum > 70 ? "Humid / Cloudy" : "Sunny & Dry", 
      advisory: avgRain > 0.1 
        ? "Sensors report active rainfall. Automatic scheduled irrigation is suspended." 
        : "Evapotranspiration normal. Dosing valves operating under standard rules."
    },
    { 
      day: "Tomorrow", 
      temp: `${(avgTemp + 1.2).toFixed(1)}°C`, 
      hum: `${Math.min(95, avgHum + 4).toFixed(0)}%`, 
      icon: "🌧️", 
      desc: "Light Rain", 
      advisory: "Precipitation expected. Smart scheduler will bypass Zone Delta automatic valve to conserve water." 
    },
    { 
      day: "Day after", 
      temp: `${(avgTemp + 2.5).toFixed(1)}°C`, 
      hum: `${Math.max(30, avgHum - 5).toFixed(0)}%`, 
      icon: "⛅", 
      desc: "Partly Cloudy", 
      advisory: "Ambient conditions optimal. Normal scheduling active across all zones." 
    },
    { 
      day: "Monday", 
      temp: `${(avgTemp + 4.1).toFixed(1)}°C`, 
      hum: `${Math.max(30, avgHum - 12).toFixed(0)}%`, 
      icon: "☀️", 
      desc: "Hot & Sunny", 
      advisory: "Above average heat index forecasted. Suggest extending Zone Alpha run time by 10%." 
    },
    { 
      day: "Tuesday", 
      temp: `${(avgTemp - 1.5).toFixed(1)}°C`, 
      hum: `${Math.min(95, avgHum + 10).toFixed(0)}%`, 
      icon: "⛅", 
      desc: "Cooler / Overcast", 
      advisory: "Atmospheric cooling expected. Evaporative losses reduced. Normal runtimes." 
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Smart Irrigation Schematics</h2>
        <p className="text-slate-400 text-xs">Actuate solenoid valves, monitor dynamic flow rates, and audit tank capacity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(state.valves).map(([zone, v]) => (
          <GlassCard key={zone} className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white text-sm">{zone}</span>
              <span className={`w-2 h-2 rounded-full ${v.valve_open ? 'bg-emerald-400 animate-pulse glow-green' : 'bg-slate-600'}`} />
            </div>

            {/* Tank animation */}
            <div className="relative w-full h-32 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex items-end">
              <div 
                className="bg-blue-600/30 w-full transition-all duration-1000 border-t border-blue-400"
                style={{ height: `${v.water_level}%` }}
              />
              <div className="absolute inset-0 flex flex-col justify-center items-center">
                <span className="text-xs font-semibold text-slate-400">Tank Reserve</span>
                <span className="text-lg font-bold text-white">{v.water_level.toFixed(1)}%</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Flow Rate:</span>
              <span className="font-mono text-white font-semibold">{v.flow_rate} L/min</span>
            </div>

            <button
              onClick={() => toggleValve(zone)}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                v.valve_open 
                  ? "bg-red-600/20 border border-red-500 text-red-400" 
                  : "bg-emerald-600/20 border border-emerald-500 text-emerald-400"
              }`}
            >
              {v.valve_open ? "Close Valve" : "Open Valve"}
            </button>
          </GlassCard>
        ))}
      </div>

      {/* Weather Forecast & Smart Advisory Widget */}
      <GlassCard className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              🌦️ 5-Day Weather Forecast & Smart Advisories
            </h3>
            <p className="text-[10px] text-slate-500">Machine learning climatic integration adjusts irrigation runtimes dynamically.</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 border border-slate-800 rounded-xl">
            <span className="text-[10px] font-semibold text-slate-400">Smart Rain Bypass:</span>
            <button
              onClick={() => setBypassEnabled(!bypassEnabled)}
              className={`w-10 h-5 rounded-full p-0.5 transition-all duration-305 focus:outline-none ${
                bypassEnabled ? "bg-emerald-600" : "bg-slate-700"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                  bypassEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${bypassEnabled ? "text-emerald-400" : "text-slate-500"}`}>
              {bypassEnabled ? "Active" : "Disabled"}
            </span>
          </div>
        </div>

        {bypassEnabled && (
          <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-[10px] rounded-xl font-medium animate-pulse">
            ☔ Bypass Active: Sensors will auto-suspend watering schedule if precipitation exceeds 5mm.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {forecasts.map((fc, idx) => (
            <div key={idx} className="p-4 bg-slate-900/40 border border-slate-900 hover:border-slate-850 rounded-xl space-y-3 transition-all flex flex-col justify-between">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{fc.day}</span>
                <span className="text-3xl block py-1">{fc.icon}</span>
                <span className="text-[11px] font-semibold text-white block">{fc.desc}</span>
                <span className="text-[10px] text-slate-500 block">{fc.temp} | Hum: {fc.hum}</span>
              </div>
              <div className="border-t border-slate-900 pt-2 text-[9px] text-slate-300 leading-relaxed min-h-12 flex items-center justify-center text-center">
                {fc.advisory}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

// ====================================================
// MODULE 6: FERTIGATION
// ====================================================
export function Fertigation({ state }: ModuleProps) {
  const [selectedZone, setSelectedZone] = useState("Zone Alpha");
  const [injecting, setInjecting] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Smart Fertigation Management</h2>
          <p className="text-slate-400 text-xs">Control exact NPK ratios injected directly into the main irrigation pipes.</p>
        </div>
        <select
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-semibold text-white focus:outline-none"
        >
          {Object.keys(state.sensors).map(z => <option key={z} value={z}>{z}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <GlassCard className="lg:col-span-8 space-y-6">
          <h3 className="text-sm font-bold text-slate-300">Fertilizer Injection Mixer Layout</h3>
          
          <div className="p-8 bg-slate-950/80 border border-slate-850 rounded-2xl flex flex-wrap gap-8 justify-around items-center relative overflow-hidden">
            {/* 3 Nutrient Canisters */}
            {["Nitrogen (N)", "Phosphorus (P)", "Potassium (K)"].map((nut, idx) => (
              <div key={idx} className="flex flex-col items-center gap-3">
                <div className="w-16 h-24 bg-slate-900 border-2 border-slate-800 rounded-xl relative flex items-end overflow-hidden">
                  <div 
                    className={`w-full transition-all duration-1000 ${idx === 0 ? 'bg-emerald-500/20' : idx === 1 ? 'bg-teal-500/20' : 'bg-sky-500/20'}`}
                    style={{ height: '75%' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-lg text-slate-400">
                    {idx === 0 ? 'N' : idx === 1 ? 'P' : 'K'}
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-300">{nut}</span>
              </div>
            ))}

            {/* Mixing Chamber */}
            <div className="w-20 h-20 bg-slate-900 border-2 border-slate-800 rounded-full flex flex-col items-center justify-center relative">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Mixing</span>
              <span className={`w-2.5 h-2.5 rounded-full ${injecting ? 'bg-emerald-400 animate-ping' : 'bg-slate-700'}`} />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-400">
              Inject Flow: <strong className="text-white font-mono">{injecting ? "4.5 L/min" : "0.0 L/min"}</strong>
            </div>
            <button
              onClick={() => setInjecting(!injecting)}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                injecting 
                  ? "bg-red-600/25 border border-red-500 text-red-400" 
                  : "bg-emerald-600/25 border border-emerald-500 text-emerald-400"
              }`}
            >
              {injecting ? "Stop Fertigation Session" : "Start Fertigation Session"}
            </button>
          </div>
        </GlassCard>

        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300">Target Dosing Formula</h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">Nitrogen Ratio</span>
                <span className="text-white font-semibold">50%</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">Phosphorus Ratio</span>
                <span className="text-white font-semibold">20%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Potassium Ratio</span>
                <span className="text-white font-semibold">30%</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// ====================================================
// MODULE 7: PEST & DISEASE MANAGEMENT
// ====================================================
export function PestDisease({ state, setState }: ModuleProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const performDetection = async () => {
    if (!file) return;
    setDetecting(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/ai/detect-pest", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errMsg = `Server returned error status ${response.status}`;
        try {
          const errData = await response.json();
          if (errData && errData.detail) {
            errMsg = errData.detail;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      setResult(data);

      // Add actual alert based on the model diagnosis
      setState(prev => {
        const next = JSON.parse(JSON.stringify(prev)) as SystemState;
        const severityType = data.severity.toLowerCase() === 'critical' ? 'critical' : 'warning';
        next.alerts.unshift({
          id: `pest-alert-${Date.now()}`,
          zone: "Zone Alpha",
          type: "Crop Pathology Detected",
          severity: severityType as any,
          message: `ML Classifier identified ${data.disease_detected} (confidence ${(data.confidence * 100).toFixed(1)}%) on uploaded leaf.`,
          timestamp: new Date().toLocaleTimeString(),
          resolved: false
        });
        return next;
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect to the backend server.");
    } finally {
      setDetecting(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Pest & Disease Computer Vision</h2>
        <p className="text-slate-400 text-xs">Upload leaf photos to run real-time classification using our trained RandomForest model.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <GlassCard className="lg:col-span-7 space-y-6">
          <h3 className="text-sm font-bold text-slate-300">ML Diagnostic Scanning Area</h3>
          
          <div className="aspect-video bg-slate-950 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
            {previewUrl ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 p-4">
                <div className="relative max-h-full max-w-full flex items-center justify-center rounded-xl overflow-hidden border border-slate-800">
                  <img src={previewUrl} alt="Leaf Preview" className="max-h-56 object-contain" />
                  
                  {/* Bounding box overlays returned by the model */}
                  {result && result.bounding_boxes && result.bounding_boxes.map((box: any, idx: number) => {
                    const [ymin, xmin, ymax, xmax] = box.box_2d;
                    // Draw box relative to the image
                    return (
                      <div 
                        key={idx}
                        className="absolute border-2 border-red-500 bg-red-500/10 rounded"
                        style={{
                          left: `${xmin / 2}px`,
                          top: `${ymin / 2}px`,
                          width: `${(xmax - xmin) / 2}px`,
                          height: `${(ymax - ymin) / 2}px`
                        }}
                      >
                        <span className="absolute -top-5 left-0 bg-red-500 text-white font-mono text-[9px] px-1 py-0.5 rounded font-bold uppercase whitespace-nowrap shadow-md">
                          {box.label} {(box.score * 100).toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 p-6">
                <Upload className="w-10 h-10 text-slate-600 mx-auto" />
                <div className="space-y-2">
                  <label className="cursor-pointer inline-block bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md">
                    Choose Leaf Photo File
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      className="hidden" 
                    />
                  </label>
                  <span className="text-slate-500 text-[10px] block">Upload photo of infected arecanut palm leaf/crown</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between gap-4">
            {previewUrl && (
              <button 
                onClick={handleClear}
                disabled={detecting}
                className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all"
              >
                Clear File
              </button>
            )}
            {previewUrl && (
              <button
                onClick={performDetection}
                disabled={detecting}
                className={`ml-auto px-6 py-2 rounded-xl text-xs font-bold shadow-lg transition-all ${
                  detecting 
                    ? "bg-slate-900 border border-slate-850 text-slate-500 cursor-not-allowed" 
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                }`}
              >
                {detecting ? "Extracting Features & Running Inference..." : "Perform Diagnostic Scan"}
              </button>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-950/20 border border-red-900/30 text-red-400 text-xs rounded-xl">
              {error}
            </div>
          )}
        </GlassCard>

        <div className="lg:col-span-5 space-y-6">
          <GlassCard className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300">Model Diagnostics Output</h3>
            {result ? (
              <div className="space-y-4 text-xs">
                <div className="border-b border-slate-900 pb-3">
                  <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[9px]">Classification:</span>
                  <span className="text-white font-bold text-sm block mt-1">{result.disease_detected}</span>
                </div>
                <div className="border-b border-slate-900 pb-3 flex justify-between">
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[9px]">Severity Index:</span>
                    <span className={`font-bold block mt-1 ${result.severity === 'Critical' ? 'text-red-400' : 'text-amber-400'}`}>{result.severity}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[9px]">Prediction Confidence:</span>
                    <span className="text-emerald-400 font-bold block mt-1">{(result.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="border-b border-slate-900 pb-3">
                  <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[9px]">Agronomic Spray Protocol:</span>
                  <p className="text-slate-200 mt-1.5 leading-relaxed">{result.recommendation}</p>
                </div>
                
                {/* Visual probability distribution of classes */}
                <div className="border-b border-slate-900 pb-3 space-y-2">
                  <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[9px]">Model Probabilities:</span>
                  <div className="space-y-1.5 pt-1">
                    {result.all_probabilities && Object.entries(result.all_probabilities).map(([cName, prob]: any) => (
                      <div key={cName} className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                          <span>{cName}</span>
                          <span>{(prob * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${prob * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Show extracted features list */}
                <div>
                  <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[9px]">Extracted Visual Features:</span>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {result.features_extracted && Object.entries(result.features_extracted).map(([featName, val]: any) => (
                      <div key={featName} className="p-2 bg-slate-900/50 border border-slate-900 rounded-lg flex flex-col">
                        <span className="text-slate-500 font-medium text-[8px] uppercase tracking-wide">{featName.replace('_', ' ')}</span>
                        <span className="text-white font-semibold text-[11px] mt-0.5">{val.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                {detecting ? "Running feature extraction & classifier inference..." : "Select leaf image and run diagnosis scan to execute Random Forest prediction."}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// ====================================================
// MODULE 8: WEED MANAGEMENT
// ====================================================
export function WeedManagement({ state }: ModuleProps) {
  const weedLogs = [
    { time: "10:32 AM", location: "Row 12, Tree 42", type: "Broadleaf Dicot", method: "Laser Zapping", status: "Completed" },
    { time: "09:15 AM", location: "Row 15, Tree 18", type: "Cynodon Grass", method: "Mechanical Blade", status: "Completed" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Weed Management & Autonomous Robotics</h2>
        <p className="text-slate-400 text-xs">Track autonomous weeding rovers zapping weeds via optical sensors.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-300">Weed Infestation Zoning Map</h3>
          {/* Simple grid representation of orchard floor */}
          <div className="grid grid-cols-5 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-900">
            {Array.from({ length: 15 }).map((_, i) => (
              <div 
                key={i} 
                className={`aspect-video rounded-lg flex items-center justify-center text-[10px] font-bold border transition-all ${
                  i % 6 === 0 
                    ? "bg-red-500/10 border-red-500/20 text-red-400" 
                    : i % 4 === 0 
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                }`}
              >
                {i % 6 === 0 ? "High Weed" : i % 4 === 0 ? "Medium" : "Clear"}
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300">Weed Rover Status</h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">Rover State</span>
                <span className="text-emerald-400 font-bold">ACTIVE SCANNING</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">Laser Heat Level</span>
                <span className="text-white font-mono">42.5 °C</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">Battery Reserve</span>
                <span className="text-white font-mono">84%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Weeding Method</span>
                <span className="text-teal-400 font-semibold uppercase">CO2 Laser Zap</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300">Recent Elimination Logs</h3>
            <div className="space-y-2.5 text-[11px]">
              {weedLogs.map((log, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                  <div>
                    <span className="text-slate-400 block">{log.location} - <strong className="text-slate-200">{log.type}</strong></span>
                    <span className="text-[10px] text-slate-500">{log.time} | {log.method}</span>
                  </div>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{log.status}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// ====================================================
// MODULE 9: FOLIAR SPRAY
// ====================================================
export function FoliarSpray({ state, setState }: ModuleProps) {
  const [activePreset, setActivePreset] = useState<string>("custom");

  useEffect(() => {
    if (state.drone.status === "idle" || state.drone.status === "charging") return;
    
    // Connect to backend WebSocket telemetry stream
    const ws = new WebSocket("ws://127.0.0.1:8000/api/v1/drone/telemetry");
    
    ws.onmessage = (event) => {
      try {
        const telemetry = JSON.parse(event.data);
        setState(prev => {
          const next = JSON.parse(JSON.stringify(prev)) as SystemState;
          next.drone.x = telemetry.x;
          next.drone.y = telemetry.y;
          next.drone.battery = telemetry.battery;
          next.drone.tank_payload = telemetry.tank_payload;
          next.drone.status = telemetry.status;
          next.drone.current_wpt = telemetry.current_wpt;
          return next;
        });
      } catch (err) {
        console.error("[WebSocket Telemetry] Error parsing data: ", err);
      }
    };
    
    ws.onerror = (err) => {
      console.error("[WebSocket Telemetry] Connection error: ", err);
    };
    
    ws.onclose = () => {
      console.log("[WebSocket Telemetry] Connection closed.");
    };
    
    return () => {
      ws.close();
    };
  }, [state.drone.status]);

  const startMission = async () => {
    if (state.drone.path.length === 0) return;
    
    try {
      // Upload flight plan to the backend telemetry system
      await fetch("http://127.0.0.1:8000/api/v1/drone/upload-mission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state.drone.path)
      });
    } catch (err) {
      console.error("[Telemetry API] Failed to upload flight plan: ", err);
    }

    setState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as SystemState;
      next.drone.status = "flying";
      next.drone.battery = 100;
      next.drone.tank_payload = 100;
      
      // Dispatch alert info
      next.alerts.unshift({
        id: `drone-mission-${Date.now()}`,
        zone: "Orchard Area",
        type: "Drone Mission Launched",
        severity: "info",
        message: `Autonomous Octacopter launched on custom flight path containing ${next.drone.path.length} waypoints. Telemetry link established.`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
      return next;
    });
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (state.drone.status !== "idle") return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    setState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as SystemState;
      next.drone.path.push({ 
        x: Math.round(clickX * 10) / 10, 
        y: Math.round(clickY * 10) / 10 
      });
      return next;
    });
    setActivePreset("custom");
  };

  const clearPath = () => {
    if (state.drone.status !== "idle") return;
    setState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as SystemState;
      next.drone.path = [];
      return next;
    });
    setActivePreset("custom");
  };

  const applyPreset = (presetName: string) => {
    if (state.drone.status !== "idle") return;
    setActivePreset(presetName);
    setState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as SystemState;
      if (presetName === "delta") {
        next.drone.path = [
          { x: 15, y: 15 },
          { x: 15, y: 85 },
          { x: 45, y: 85 },
          { x: 45, y: 15 },
          { x: 75, y: 15 },
          { x: 75, y: 85 }
        ];
      } else if (presetName === "full") {
        next.drone.path = [
          { x: 10, y: 10 },
          { x: 90, y: 10 },
          { x: 90, y: 90 },
          { x: 10, y: 90 },
          { x: 50, y: 50 }
        ];
      } else if (presetName === "hotspot") {
        next.drone.path = [
          { x: 45, y: 15 }, // Tree 2-5 (Zone Alpha)
          { x: 25, y: 45 }, // Tree 5-3 (Zone Gamma)
          { x: 35, y: 75 }  // Tree 8-4 (Zone Delta)
        ];
      } else {
        next.drone.path = [];
      }
      return next;
    });
  };

  const currentWptIdx = state.drone.status === "flying" || state.drone.status === "spraying"
    ? (state.drone.current_wpt ?? 0)
    : -1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Autonomous Drone Foliar Spray</h2>
          <p className="text-slate-400 text-xs">Track real-time spray coordinates, speed, battery, and crop coverage.</p>
        </div>

        {/* Path Actions */}
        {state.drone.status === "idle" && (
          <div className="flex gap-2">
            <select
              value={activePreset}
              onChange={(e) => applyPreset(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="custom">-- Custom Draw Mode --</option>
              <option value="delta">Preset: Zone Delta Sweep</option>
              <option value="full">Preset: Full Zigzag sweep</option>
              <option value="hotspot">Preset: Disease Hotspot Target</option>
            </select>
            <button
              onClick={clearPath}
              className="px-3 py-1.5 border border-slate-850 hover:border-red-900/40 text-slate-400 hover:text-red-450 rounded-xl text-xs font-bold transition-all bg-slate-900"
            >
              Clear Flight Path
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-300">Octacopter Flight Path Map</h3>
            {state.drone.status === "idle" && (
              <span className="text-[10px] text-slate-500 italic">
                {state.drone.path.length === 0 ? "⚠️ Click on the map grid below to draw waypoints" : "🖱️ Click on grid map to add more waypoints"}
              </span>
            )}
          </div>
          
          <div 
            onClick={handleMapClick}
            className={`aspect-video bg-slate-950 border border-slate-900 rounded-2xl relative p-4 flex items-center justify-center ${
              state.drone.status === "idle" ? "cursor-crosshair hover:border-slate-800 transition-colors" : ""
            }`}
          >
            {/* Grid Map */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
            
            {/* Dynamic Drone Path SVG */}
            {state.drone.path.length > 1 && (
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline 
                  points={state.drone.path.map(pt => `${pt.x},${pt.y}`).join(" ")} 
                  fill="none" 
                  stroke="rgba(16, 185, 129, 0.5)" 
                  strokeWidth="0.8" 
                  strokeDasharray="1.5 1.5" 
                />
              </svg>
            )}

            {/* Waypoint Number Markers */}
            {state.drone.path.map((pt, idx) => (
              <div 
                key={idx}
                className={`absolute w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold border pointer-events-none shadow transition-all ${
                  idx === currentWptIdx 
                    ? "bg-amber-500 border-amber-400 text-slate-950 animate-pulse" 
                    : "bg-emerald-600/80 border-emerald-500 text-white"
                }`}
                style={{
                  left: `${pt.x}%`,
                  top: `${pt.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {idx + 1}
              </div>
            ))}

            {/* Drone icon representation */}
            <div 
              className="absolute w-8 h-8 bg-emerald-500 border border-emerald-400 rounded-full flex items-center justify-center text-white glow-green transition-all duration-1000 z-10"
              style={{
                left: `${state.drone.x}%`,
                top: `${state.drone.y}%`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none'
              }}
            >
              🛸
            </div>

            {state.drone.status === "idle" && state.drone.path.length > 0 && (
              <button 
                onClick={startMission}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold tracking-wider shadow-lg shadow-emerald-600/25 relative z-20"
              >
                Launch Spray Mission
              </button>
            )}
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300">Drone Live Telemetry</h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">Flight Status</span>
                <span className={`font-bold uppercase ${
                  state.drone.status === "flying" || state.drone.status === "spraying" ? "text-amber-400 animate-pulse" :
                  state.drone.status === "charging" ? "text-sky-400" : "text-emerald-400"
                }`}>{state.drone.status}</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">Battery Level</span>
                <span className="text-white font-mono">{state.drone.battery.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">Liquid Payload</span>
                <span className="text-white font-mono">{state.drone.tank_payload.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-2">
                <span className="text-slate-400">Flight Path Waypoints</span>
                <span className="text-white font-mono">{state.drone.path.length} waypoints</span>
              </div>
              {state.drone.status === "idle" ? (
                <div className="text-[10px] text-slate-550 italic text-center py-2">
                  No active flight plan. Select a preset or click on the map to define custom waypoints.
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Waypoint</span>
                    <span className="text-amber-400 font-bold font-mono">WPT {currentWptIdx + 1} of {state.drone.path.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Coordinates</span>
                    <span className="text-teal-400 font-semibold font-mono">
                      [{state.drone.path[currentWptIdx]?.x?.toFixed(1) || 0}, {state.drone.path[currentWptIdx]?.y?.toFixed(1) || 0}]
                    </span>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Waypoint Coordinates Table */}
          {state.drone.path.length > 0 && (
            <GlassCard className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Flight Waypoints Coordinates</h4>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 font-mono text-[10px]">
                {state.drone.path.map((pt, idx) => (
                  <div 
                    key={idx} 
                    className={`flex justify-between px-2.5 py-1.5 rounded-lg border ${
                      idx === currentWptIdx 
                        ? "bg-amber-500/10 border-amber-550/40 text-amber-300" 
                        : "bg-slate-900/40 border-slate-900 text-slate-350"
                    }`}
                  >
                    <span>WPT {idx + 1}</span>
                    <span>X: {pt.x.toFixed(1)}% | Y: {pt.y.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}

// ====================================================
// MODULE 10: YIELD ANALYTICS
// ====================================================
export function YieldAnalytics() {
  const yieldData = [
    { year: '2021', actual: 48, predicted: 45 },
    { year: '2022', actual: 52, predicted: 50 },
    { year: '2023', actual: 58, predicted: 56 },
    { year: '2024', actual: 61, predicted: 62 },
    { year: '2025', actual: 68, predicted: 66 },
    { year: '2026 (Forecast)', predicted: 75 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Yield Analytics & Production Forecasts</h2>
        <p className="text-slate-400 text-xs">Track historical tonnage output and examine future machine-learning projections.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-300">Arecanut Production Tonnage (2021 - 2026)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yieldData}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="year" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }} />
                <Area type="monotone" dataKey="actual" stroke="#10b981" fillOpacity={1} fill="url(#colorActual)" name="Actual Yield (Tons)" strokeWidth={2} />
                <Area type="monotone" dataKey="predicted" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPred)" name="AI Predicted (Tons)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-300">Harvest Grade Breakdown</h3>
            <p className="text-xs text-slate-500 mt-1">Grade classifications based on size, kernel density, and shell parameters.</p>
          </div>
          
          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Grade A (Large)', value: 55, color: '#10b981' },
                    { name: 'Grade B (Medium)', value: 30, color: '#f59e0b' },
                    { name: 'Grade C (Small)', value: 15, color: '#ef4444' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[
                    <Cell key="0" fill="#10b981" />,
                    <Cell key="1" fill="#f59e0b" />,
                    <Cell key="2" fill="#ef4444" />
                  ]}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>Grade A (Excellent kernel count)</span>
              <strong className="text-white font-mono">55%</strong>
            </div>
            <div className="flex justify-between">
              <span>Grade B (Market baseline standard)</span>
              <strong className="text-white font-mono">30%</strong>
            </div>
            <div className="flex justify-between">
              <span>Grade C (Pruned/small sizing)</span>
              <strong className="text-white font-mono">15%</strong>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ====================================================
// MODULE 11: ORCHARD DIGITAL TWIN
// ====================================================
export function DigitalTwin({ state }: ModuleProps) {
  const [selectedTree, setSelectedTree] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"standard" | "heatmap">("standard");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Orchard Digital Twin</h2>
          <p className="text-slate-400 text-xs">Simulated grid layout mapping 3,000 distinct arecanut trees across farm zones.</p>
        </div>
        
        {/* Toggle Mode buttons */}
        <div className="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold">
          <button 
            onClick={() => setViewMode("standard")}
            className={`px-4 py-1.5 rounded-lg transition-all ${viewMode === 'standard' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Standard Health View
          </button>
          <button 
            onClick={() => setViewMode("heatmap")}
            className={`px-4 py-1.5 rounded-lg transition-all ${viewMode === 'heatmap' ? 'bg-red-600 text-white font-bold animate-pulse' : 'text-slate-400 hover:text-white'}`}
          >
            Pest Hotspot Heatmap
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <GlassCard className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-300">Tree Health Layout Matrix</h3>
            {viewMode === "heatmap" && (
              <div className="flex items-center gap-3 text-[10px] bg-red-950/20 border border-red-900/30 px-3 py-1 rounded-lg">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-950 border border-red-500 animate-pulse" /> Active Hotspot</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500/40" /> High Risk</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-orange-500/25" /> Moderate</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-950/20 border border-emerald-900/20" /> Safe</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-10 gap-2 p-4 bg-slate-950 rounded-2xl border border-slate-900 overflow-x-auto">
            {Array.from({ length: 100 }).map((_, i) => {
              const row = Math.floor(i / 10) + 1;
              const col = (i % 10) + 1;
              const treeId = `Tree-${row}-${col}`;

              let color = "";
              let status = "";

              if (viewMode === "standard") {
                color = "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/40"; // healthy
                status = "Healthy";
                if (i === 14 || i === 42 || i === 73) {
                  color = "bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/40"; // diseased
                  status = "Spindle Bug Affected";
                } else if (i === 28 || i === 65) {
                  color = "bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/40"; // dry
                  status = "Soil Moisture Deficient";
                }
              } else {
                // Heatmap logic based on distance to diseased trees (at index 14: 2,5; 42: 5,3; 73: 8,4)
                const diseasedCoords = [[2, 5], [5, 3], [8, 4]];
                const dists = diseasedCoords.map(([dr, dc]) => Math.abs(row - dr) + Math.abs(col - dc));
                const minDist = Math.min(...dists);
                
                if (minDist === 0) {
                  color = "bg-red-950/80 border-red-550 text-white animate-pulse shadow-md shadow-red-500/20 hover:bg-red-900/90";
                  status = "Pest Hotspot Center (Active Spindle Bug Infection)";
                } else if (minDist === 1) {
                  color = "bg-red-500/40 border-red-400/50 text-red-200 hover:bg-red-500/50";
                  status = "High Contagion Risk Zone";
                } else if (minDist === 2) {
                  color = "bg-orange-500/25 border-orange-400/30 text-orange-300 hover:bg-orange-500/35";
                  status = "Moderate Proximity Zone";
                } else if (minDist === 3) {
                  color = "bg-yellow-500/15 border-yellow-400/20 text-yellow-300 hover:bg-yellow-500/20";
                  status = "Low Risk Buffer Zone";
                } else {
                  color = "bg-emerald-950/20 border-emerald-900/20 text-emerald-500/70 hover:bg-emerald-950/40";
                  status = "Symptom-Free Safe Zone";
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => setSelectedTree(`${treeId} (${status})`)}
                  className={`aspect-square border rounded-lg flex flex-col items-center justify-center text-[8px] font-bold transition-all ${color}`}
                >
                  🌴
                  <span className="text-[7px] font-mono mt-0.5">{row}-{col}</span>
                </button>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-4 space-y-4">
          <h3 className="text-sm font-bold text-slate-300">Digital Twin Inspector</h3>
          {selectedTree ? (
            <div className="space-y-4 text-xs">
              <div className="border-b border-slate-850 pb-3">
                <span className="text-slate-400 block">Inspecting Asset:</span>
                <span className="text-white font-bold text-sm block mt-1">{selectedTree}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Planted Date:</span>
                  <span className="text-white">2021-02-14</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Moisture Profile:</span>
                  <span className="text-emerald-400 font-bold">
                    {selectedTree.includes("Deficient") ? "Dry (18.4%)" : "Optimal (34.2%)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nutrients Dosage:</span>
                  <span className={selectedTree.includes("Deficient") ? "text-amber-400 font-semibold" : "text-white"}>
                    {selectedTree.includes("Deficient") ? "NPK Deficient" : "NPK Stable"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Disease Risk:</span>
                  <span className={`font-bold ${
                    selectedTree.includes("Hotspot") || selectedTree.includes("Affected") ? "text-red-400 animate-pulse" :
                    selectedTree.includes("High Contagion") ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    {selectedTree.includes("Hotspot") || selectedTree.includes("Affected") ? "CRITICAL (100%)" :
                     selectedTree.includes("High Contagion") ? "HIGH (75%)" :
                     selectedTree.includes("Moderate") ? "MODERATE (30%)" : "LOW (<5%)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Drone Spray Schedule:</span>
                  <span className="text-slate-200">
                    {selectedTree.includes("Hotspot") || selectedTree.includes("Affected") || selectedTree.includes("High Contagion") 
                      ? "Dispatched / Active" 
                      : "Pending Inspection"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs leading-relaxed">
              Click any arecanut tree icon in the matrix grid to inspect live tree telemetry and health history.
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

// ====================================================
// MODULE 12: ALERT SYSTEM
// ====================================================
export function AlertSystem({ state, setState }: ModuleProps) {
  const [phoneSimOpen, setPhoneSimOpen] = useState(false);
  const [emailSimOpen, setEmailSimOpen] = useState(false);

  const resolveAlert = (id: string) => {
    setState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as SystemState;
      const alert = next.alerts.find(a => a.id === id);
      if (alert) alert.resolved = true;
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Alert Dispatcher</h2>
          <p className="text-slate-400 text-xs">Acknowledge critical warnings and test SMS/Email integration gateways.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setPhoneSimOpen(!phoneSimOpen)}
            className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white hover:border-slate-700"
          >
            SMS Simulator
          </button>
          <button 
            onClick={() => setEmailSimOpen(!emailSimOpen)}
            className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-white hover:border-slate-700"
          >
            Email Simulator
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <GlassCard className="lg:col-span-8 space-y-4">
          <h3 className="text-sm font-bold text-slate-300">Active Warning Feeds</h3>
          <div className="space-y-3">
            {state.alerts.map(alert => (
              <div 
                key={alert.id}
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                  alert.resolved 
                    ? "bg-slate-950/40 border-slate-900 opacity-60" 
                    : alert.severity === "critical"
                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                    : alert.severity === "warning"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider">{alert.type}</span>
                    <span className="text-[9px] font-semibold opacity-60">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-normal">{alert.message}</p>
                </div>
                {!alert.resolved && (
                  <button 
                    onClick={() => resolveAlert(alert.id)}
                    className="shrink-0 px-3 py-1 bg-slate-900 hover:bg-slate-850 text-white rounded border border-slate-800 text-[10px] font-bold"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            ))}
          </div>
        </GlassCard>

        {/* SMS popups */}
        {phoneSimOpen && (
          <div className="lg:col-span-4">
            <GlassCard className="border-emerald-500/30 space-y-4">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Test SMS Carrier Simulator</h4>
              <div className="w-full aspect-[9/16] bg-slate-950 rounded-2xl border-4 border-slate-800 p-4 relative overflow-hidden flex flex-col justify-between">
                <div className="bg-slate-900 px-3 py-2 rounded-xl text-[10px] font-semibold text-slate-400 text-center border border-slate-850">
                  Carrier: Agrisense Alert API
                </div>
                
                {/* Simulated message bubble */}
                <div className="my-auto space-y-2">
                  <div className="p-3 bg-emerald-600 text-white text-[11px] rounded-2xl rounded-tr-none max-w-[85%] ml-auto">
                    Warning: Zone Delta soil moisture is 19.5%. Actuating closed-loop auto-irrigation now.
                  </div>
                </div>

                <div className="h-1 bg-slate-800 rounded-full w-24 mx-auto" />
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}

// ====================================================
// MODULE 13: DEVICE MANAGEMENT
// ====================================================
export function DeviceManagement({ state, setState }: ModuleProps) {
  const triggerReboot = (deviceId: string) => {
    setState(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as SystemState;
      if (deviceId === "GATEWAY") {
        next.comm.gateway_status = "offline";
      } else {
        next.comm.esp32_status = "offline";
      }
      return next;
    });

    // Bring online after delay
    setTimeout(() => {
      setState(prev => {
        const next = JSON.parse(JSON.stringify(prev)) as SystemState;
        if (deviceId === "GATEWAY") {
          next.comm.gateway_status = "online";
        } else {
          next.comm.esp32_status = "online";
        }
        next.alerts.unshift({
          id: `reboot-ack-${Date.now()}`,
          zone: "Hardware",
          type: "Device Reboot Successful",
          severity: "info",
          message: `Hardware diagnostics confirm device ${deviceId} rebooted and connected.`,
          timestamp: new Date().toISOString(),
          resolved: false
        });
        return next;
      });
    }, 4000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Device & Hardware Manager</h2>
        <p className="text-slate-400 text-xs">Review connected ESP32 sensor modules and request remote firmware flash or reboots.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="space-y-4">
          <h3 className="text-sm font-bold text-slate-300">ESP32 Telemetry Nodes</h3>
          <div className="space-y-3.5 text-xs">
            {[
              { id: "NODE-A", name: "LoRa Sensor Node A", batt: "88%", r: "-62 dBm", status: state.comm.esp32_status },
              { id: "NODE-B", name: "LoRa Sensor Node B", batt: "76%", r: "-68 dBm", status: state.comm.esp32_status },
              { id: "NODE-C", name: "LoRa Sensor Node C", batt: "92%", r: "-58 dBm", status: state.comm.esp32_status },
              { id: "NODE-D", name: "LoRa Sensor Node D", batt: "45%", r: "-78 dBm", status: "online" }
            ].map(n => (
              <div key={n.id} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-900">
                <div>
                  <span className="font-bold text-white block">{n.name}</span>
                  <span className="text-[10px] text-slate-500">Uptime: 14 days | Signal: {n.r} | Battery: {n.batt}</span>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    n.status === "online" 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  }`}>
                    {n.status}
                  </span>
                  <button 
                    onClick={() => triggerReboot(n.id)}
                    className="px-2 py-1 bg-slate-900 border border-slate-800 text-[9px] text-white rounded font-bold"
                  >
                    Reboot
                  </button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="space-y-4">
          <h3 className="text-sm font-bold text-slate-300">Central LoRaWAN Gateway</h3>
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-900">
              <div>
                <span className="font-bold text-white block">Edge Gateway Base Station</span>
                <span className="text-[10px] text-slate-500">IP: 192.168.1.42 | Firmware: v2.0.1 | CPU: 14%</span>
              </div>
              <div className="flex gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                  state.comm.gateway_status === "online" 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                    : "bg-red-500/10 border-red-500/20 text-red-400 animate-pulse"
                }`}>
                  {state.comm.gateway_status}
                </span>
                <button 
                  onClick={() => triggerReboot("GATEWAY")}
                  className="px-2 py-1 bg-slate-900 border border-slate-800 text-[9px] text-white rounded font-bold"
                >
                  Reboot
                </button>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ====================================================
// MODULE 14: DATABASE VISUALIZER
// ====================================================
export function DatabaseVisualizer() {
  const [activeTab, setActiveTab] = useState("postgres");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Database Schema Visualizer</h2>
        <p className="text-slate-400 text-xs">Examine how telemetry is mapped to Postgres, InfluxDB, and MongoDB storage layers.</p>
      </div>

      <div className="flex gap-2 border-b border-slate-850 pb-px">
        {[
          { id: "postgres", label: "PostgreSQL (Metadata)" },
          { id: "influx", label: "InfluxDB (Time-Series)" },
          { id: "mongo", label: "MongoDB (Documents)" }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-xs font-bold transition-all relative ${
              activeTab === t.id ? "text-emerald-400 border-b-2 border-emerald-500" : "text-slate-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <GlassCard className="p-6">
        {activeTab === "postgres" && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">SQL Schema Structure</h4>
            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-[10px] text-slate-300 leading-relaxed overflow-x-auto">
{`CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  hashed_password VARCHAR NOT NULL,
  role VARCHAR NOT NULL, -- super_admin, farmer, technician, agronomist
  full_name VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE zones (
  id VARCHAR PRIMARY KEY,
  farm_id VARCHAR REFERENCES farms(id),
  name VARCHAR NOT NULL,
  soil_type VARCHAR NOT NULL
);`}
            </pre>
          </div>
        )}

        {activeTab === "influx" && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">InfluxDB Bucket Layout</h4>
            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-[10px] text-slate-300 leading-relaxed overflow-x-auto">
{`Measurement: sensor_readings
  ├── Tags:
  │    ├── farm_id="greenfield-10"
  │    ├── zone_id="zone-alpha"
  │    └── sensor_node="NODE-ALPHA"
  └── Fields:
       ├── soil_moisture=38.5 (float)
       ├── soil_temp=24.2 (float)
       ├── ph=6.2 (float)
       └── nitrogen=42.0 (float)`}
            </pre>
          </div>
        )}

        {activeTab === "mongo" && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">MongoDB Document JSON Pattern</h4>
            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-[10px] text-slate-300 leading-relaxed overflow-x-auto">
{`{
  "_id": ObjectId("647f12bc8f42d1a3c5a7b001"),
  "image_name": "crown_leaf_scan.png",
  "disease_detected": "Spindle Bug Infestation",
  "confidence": 0.92,
  "severity": "Critical",
  "bounding_boxes": [
    { "box_2d": [120, 240, 310, 480], "label": "Spindle Bug" }
  ],
  "recommendation": "Lambda-cyhalothrin (0.5 ml/L) foliar application.",
  "timestamp": ISODate("2026-06-12T22:04:00Z")
}`}
            </pre>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// ====================================================
// MODULE 15: AI MODEL VISUALIZER
// ====================================================
export function AIModelVisualizer() {
  const [metrics, setMetrics] = useState<any>(null);
  const [dataset, setDataset] = useState<any>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingDataset, setLoadingDataset] = useState(true);
  const [training, setTraining] = useState(false);
  const [trainSuccess, setTrainSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoadingMetrics(true);
      const res = await fetch("http://127.0.0.1:8000/api/v1/ai/model-info");
      if (!res.ok) throw new Error("Failed to load model metrics");
      const data = await res.json();
      setMetrics(data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch model metrics. Ensure backend is running.");
    } finally {
      setLoadingMetrics(false);
    }
  };

  const fetchDataset = async () => {
    try {
      setLoadingDataset(true);
      const res = await fetch("http://127.0.0.1:8000/api/v1/ai/dataset-preview?limit=15");
      if (!res.ok) throw new Error("Failed to load dataset preview");
      const data = await res.json();
      setDataset(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingDataset(false);
    }
  };

  const handleTrain = async () => {
    try {
      setTraining(true);
      setTrainSuccess(false);
      const res = await fetch("http://127.0.0.1:8000/api/v1/ai/train", {
        method: "POST"
      });
      if (!res.ok) throw new Error("Training failed");
      const data = await res.json();
      setMetrics(data.metrics);
      setTrainSuccess(true);
      setTimeout(() => setTrainSuccess(false), 4000);
      fetchDataset();
    } catch (err: any) {
      console.error(err);
      setError("Failed to train model. Ensure backend is running.");
    } finally {
      setTraining(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchDataset();
  }, []);

  const models = [
    { 
      name: "RandomForest Leaf Classifier", 
      type: "Ensemble Classifier", 
      accuracy: metrics ? `${(metrics.accuracy * 100).toFixed(1)}%` : "100.0%", 
      use: "Classifies leaf visual features (NDI, yellow ratio, brown ratio) into 4 health states." 
    },
    { 
      name: "XGBoost Nutrient Recommender", 
      type: "Gradient Boosting", 
      accuracy: "91.8%", 
      use: "Predicts soil nutrient deficiency and doses NPK components accordingly." 
    },
    { 
      name: "LSTM Irrigation Neural Net", 
      type: "Recurrent Network", 
      accuracy: "93.5%", 
      use: "Uses time-series soil moisture sensors to schedule upcoming solenoid cycles." 
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">AI Model & Dataset Center</h2>
          <p className="text-slate-400 text-xs">Examine model parameters, view the original training dataset, and run real-time training cycles.</p>
        </div>
        <button
          onClick={handleTrain}
          disabled={training}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all ${
            training
              ? "bg-slate-900 border border-slate-850 text-slate-500 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${training ? 'animate-spin' : ''}`} />
          {training ? "Training RandomForest Classifier..." : "Re-train Disease Model"}
        </button>
      </div>

      {trainSuccess && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-3">
          <Sparkles className="w-5 h-5 shrink-0 text-emerald-400" />
          <div>
            <span className="font-bold block">Model Re-trained Successfully!</span>
            <span className="text-[10px] text-slate-400">RandomForestClassifier weights updated with accuracy: {(metrics?.accuracy * 100).toFixed(1)}%</span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-950/20 border border-red-900/30 text-red-400 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {models.map((m, i) => (
          <GlassCard key={i} className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{m.type}</span>
                <h4 className="font-bold text-white text-xs mt-2">{m.name}</h4>
              </div>
              <span className="font-mono text-white font-extrabold text-sm">{m.accuracy}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">{m.use}</p>
            <div className="flex justify-between text-[9px] text-slate-500 border-t border-slate-900 pt-3">
              <span>Epochs/Trees: {i === 0 ? "100 Trees" : "150 Epochs"}</span>
              <span>Status: Active</span>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Feature Importance panel */}
        <GlassCard className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-300">Explainable AI (Feature Importances)</h3>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            The relative importance scores calculated by the RandomForest model for each visual parameter extracted from leaf images.
          </p>
          
          {loadingMetrics ? (
            <div className="text-center py-12 text-slate-500 text-xs">Loading feature importance weights...</div>
          ) : metrics && metrics.feature_importances ? (
            <div className="space-y-2.5 pt-2">
              {Object.entries(metrics.feature_importances).map(([featName, val]: any) => (
                <div key={featName} className="space-y-1 text-xs">
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span className="capitalize">{featName.replace('_', ' ')}</span>
                    <span className="font-mono text-emerald-400">{(val * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${val * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">No metrics data loaded. Please retrain.</div>
          )}
        </GlassCard>

        {/* Dataset Preview Panel */}
        <GlassCard className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-300">Original Training Dataset Preview</h3>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10 font-bold">
              {dataset ? `${dataset.total_samples} Total Records` : "1000 Total Records"}
            </span>
          </div>
          <p className="text-[10px] text-slate-500">
            A scrollable preview of the features extracted from original agricultural leaf samples inside `arecanut_leaf_features.csv`.
          </p>

          <div className="overflow-x-auto border border-slate-900 rounded-xl max-h-72 overflow-y-auto">
            {loadingDataset ? (
              <div className="text-center py-12 text-slate-500 text-xs">Loading dataset preview...</div>
            ) : dataset && dataset.preview && dataset.preview.length > 0 ? (
              <table className="w-full text-left text-[10px] border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-900 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="px-3 py-2">Sample ID</th>
                    <th className="px-3 py-2">NDI</th>
                    <th className="px-3 py-2">Yellow %</th>
                    <th className="px-3 py-2">Brown %</th>
                    <th className="px-3 py-2">Green %</th>
                    <th className="px-3 py-2">Label</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {dataset.preview.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-900/20 font-medium">
                      <td className="px-3 py-2 text-white font-semibold font-mono">{row.sample_id}</td>
                      <td className="px-3 py-2">{row.mean_ndi.toFixed(4)}</td>
                      <td className="px-3 py-2">{(row.yellow_ratio * 100).toFixed(1)}%</td>
                      <td className="px-3 py-2">{(row.brown_ratio * 100).toFixed(1)}%</td>
                      <td className="px-3 py-2">{(row.green_ratio * 100).toFixed(1)}%</td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                          row.label === 0 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : row.label === 1 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                            : row.label === 2 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}>
                          {row.class_name.split(' ')[0]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">Failed to load dataset preview table.</div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ====================================================
// MODULE 16: REPORTS
// ====================================================
export function Reports() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [scope, setScope] = useState<string>("sensor");
  const [range, setRange] = useState<string>("7d");
  const [zone, setZone] = useState<string>("All Zones");

  const getScopeLabel = (s: string) => {
    switch (s) {
      case "sensor": return "Telemetry Sensors Summary";
      case "yield": return "Crop Yield Predictor History";
      case "irrigation": return "Smart Irrigation Action Logs";
      case "pest": return "Pest YOLOv8 Diagnostic Reports";
      default: return "";
    }
  };

  const generateBrowserPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    let tableHTML = "";
    if (scope === "sensor") {
      tableHTML = `
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Zone</th>
              <th>Soil Moisture</th>
              <th>Soil Temp</th>
              <th>pH</th>
              <th>EC (dS/m)</th>
              <th>NPK (mg/kg)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2026-06-13T19:00:00</td>
              <td>${zone}</td>
              <td>34.2%</td>
              <td>23.5 °C</td>
              <td>6.1</td>
              <td>1.2</td>
              <td>40 / 15 / 30</td>
            </tr>
            <tr>
              <td>2026-06-13T18:00:00</td>
              <td>${zone}</td>
              <td>34.0%</td>
              <td>23.4 °C</td>
              <td>6.1</td>
              <td>1.2</td>
              <td>40 / 15 / 30</td>
            </tr>
            <tr>
              <td>2026-06-13T17:00:00</td>
              <td>${zone}</td>
              <td>33.8%</td>
              <td>23.2 °C</td>
              <td>6.1</td>
              <td>1.2</td>
              <td>40 / 15 / 30</td>
            </tr>
            <tr>
              <td>2026-06-13T16:00:00</td>
              <td>${zone}</td>
              <td>34.5%</td>
              <td>23.6 °C</td>
              <td>6.2</td>
              <td>1.3</td>
              <td>42 / 16 / 31</td>
            </tr>
            <tr>
              <td>2026-06-13T15:00:00</td>
              <td>${zone}</td>
              <td>35.1%</td>
              <td>23.9 °C</td>
              <td>6.2</td>
              <td>1.3</td>
              <td>42 / 16 / 31</td>
            </tr>
          </tbody>
        </table>
      `;
    } else if (scope === "yield") {
      tableHTML = `
        <table>
          <thead>
            <tr>
              <th>Season</th>
              <th>Zone</th>
              <th>Grade A Yield (tons)</th>
              <th>Grade B Yield (tons)</th>
              <th>Total Production (tons)</th>
              <th>Estimated Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2023</td>
              <td>${zone}</td>
              <td>12.5</td>
              <td>4.2</td>
              <td>16.7</td>
              <td>$50,100</td>
            </tr>
            <tr>
              <td>2024</td>
              <td>${zone}</td>
              <td>14.1</td>
              <td>3.8</td>
              <td>17.9</td>
              <td>$53,700</td>
            </tr>
            <tr>
              <td>2025 (Forecast)</td>
              <td>${zone}</td>
              <td>15.8</td>
              <td>3.5</td>
              <td>19.3</td>
              <td>$57,900</td>
            </tr>
          </tbody>
        </table>
      `;
    } else if (scope === "irrigation") {
      tableHTML = `
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Zone</th>
              <th>Valve ID</th>
              <th>Action</th>
              <th>Volume (Liters)</th>
              <th>Mode</th>
              <th>Operator</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2026-06-12T12:00:00</td>
              <td>${zone === "All Zones" ? "Zone Beta" : zone}</td>
              <td>VALVE-B</td>
              <td>OPEN</td>
              <td>1,800</td>
              <td>AI_Model</td>
              <td>System_Daemon</td>
            </tr>
            <tr>
              <td>2026-06-12T08:00:00</td>
              <td>${zone === "All Zones" ? "Zone Alpha" : zone}</td>
              <td>VALVE-A</td>
              <td>OPEN</td>
              <td>2,500</td>
              <td>Scheduled</td>
              <td>System_Daemon</td>
            </tr>
          </tbody>
        </table>
      `;
    } else {
      tableHTML = `
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Tree ID</th>
              <th>Zone</th>
              <th>Pest Type</th>
              <th>Severity</th>
              <th>Confidence</th>
              <th>Action Taken</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2026-06-11T14:35:10</td>
              <td>Tree A-340</td>
              <td>${zone === "All Zones" ? "Zone Alpha" : zone}</td>
              <td>Spindle Bug</td>
              <td><span style="color:red;font-weight:bold;">High</span></td>
              <td>92.0%</td>
              <td>Drone Spray Dispatched</td>
            </tr>
          </tbody>
        </table>
      `;
    }

    const html = `
      <html>
        <head>
          <title>Agrisense Pro - Custom Orchard Report</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; margin: 0; background: #ffffff; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f766e; padding-bottom: 15px; margin-bottom: 25px; }
            .brand { color: #0f766e; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
            .subtitle { font-size: 9px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
            .meta-box { font-size: 10px; color: #475569; text-align: right; line-height: 1.5; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #334155; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; margin-bottom: 12px; letter-spacing: 0.5px; }
            p { font-size: 11px; line-height: 1.6; color: #334155; margin: 0 0 10px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px; }
            th { background-color: #f1f5f9; border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; font-weight: 600; color: #475569; }
            td { border: 1px solid #e2e8f0; padding: 8px 10px; color: #334155; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .footer { margin-top: 60px; font-size: 9px; text-align: center; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">AGRISENSE PRO CONSOLE</div>
              <div class="subtitle">Commercial Betel Nut Orchard Diagnostics</div>
            </div>
            <div class="meta-box">
              <strong>Generated:</strong> ${new Date().toLocaleString()}<br/>
              <strong>Scope:</strong> ${getScopeLabel(scope)}<br/>
              <strong>Filter:</strong> ${zone} | ${range === "24h" ? "Last 24 Hours" : range === "7d" ? "Last 7 Days" : "Last 30 Days"}
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Executive Summary</div>
            <p>
              This report compiles telemetry trends and analytical records gathered from the Agrisense IoT sensor mesh, machine learning edge components, and YOLOv8 pest diagnostics framework. All soil calibrations are in compliance with betel nut cultivation standards.
            </p>
          </div>
          
          <div class="section">
            <div class="section-title">${getScopeLabel(scope)} Logs</div>
            ${tableHTML}
          </div>
          
          <div class="footer">
            Agrisense Pro Precision Agriculture Platform &copy; 2026. All rights reserved.
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const triggerDownload = (format: string) => {
    setDownloading(format);
    setTimeout(() => {
      setDownloading(null);
      if (format === "pdf") {
        generateBrowserPDF();
      } else {
        // Direct download using backend endpoint
        const zoneNameParam = zone === "All Zones" ? "" : `&zone_name=${encodeURIComponent(zone)}`;
        const url = `http://127.0.0.1:8000/api/v1/reports/export?report_type=${scope}&format=${format}${zoneNameParam}`;
        window.open(url, "_blank");
      }
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Reports & Exports</h2>
        <p className="text-slate-400 text-xs">Download sensor logs, yield summaries, and treatment actions in CSV, Excel, or PDF.</p>
      </div>

      <GlassCard className="max-w-2xl space-y-6">
        <h3 className="text-sm font-bold text-slate-300">Generate Custom Orchard Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-2">
            <span className="text-slate-400 block font-semibold">Report Metrics Scope:</span>
            <select 
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="sensor">Telemetry Sensors Summary (NPK, pH)</option>
              <option value="yield">Crop Yield Predictor History</option>
              <option value="irrigation">Smart Irrigation Action Logs</option>
              <option value="pest">Pest YOLOv8 Diagnostic Reports</option>
            </select>
          </div>
          <div className="space-y-2">
            <span className="text-slate-400 block font-semibold">Zone Filter:</span>
            <select 
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="All Zones">All Zones</option>
              <option value="Zone Alpha">Zone Alpha</option>
              <option value="Zone Beta">Zone Beta</option>
              <option value="Zone Gamma">Zone Gamma</option>
              <option value="Zone Delta">Zone Delta</option>
            </select>
          </div>
          <div className="space-y-2">
            <span className="text-slate-400 block font-semibold">Date Filtering Range:</span>
            <select 
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-4">
          {["csv", "xlsx", "pdf"].map(fmt => (
            <button
              key={fmt}
              onClick={() => triggerDownload(fmt)}
              disabled={downloading !== null}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs font-bold rounded-xl text-white flex items-center gap-2 transition-all shadow-md"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              {downloading === fmt ? `Compiling ${fmt.toUpperCase()}...` : `Download as ${fmt.toUpperCase()}`}
            </button>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

// ====================================================
// MODULE 17: SETTINGS
// ====================================================
export function SettingsView() {
  const [theme, setTheme] = useState("dark");
  const [telemetryInterval, setTelemetryInterval] = useState(5);
  const [alertThreshold, setAlertThreshold] = useState(20);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">System Settings</h2>
        <p className="text-slate-400 text-xs">Configure alerts, mesh transmission frequencies, user credentials, and security tokens.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="space-y-4">
          <h3 className="text-sm font-bold text-slate-300">Preferences</h3>
          
          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <span className="text-slate-400 block font-semibold">Dashboard Mode theme:</span>
              <div className="flex gap-2">
                {["dark", "light"].map(t => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all uppercase ${
                      theme === t 
                        ? "bg-emerald-600/10 border-emerald-500 text-emerald-400" 
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    {t} Mode
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-slate-400 block font-semibold">Mesh Uplink Frequency:</span>
              <input 
                type="range" 
                min="1" 
                max="60" 
                value={telemetryInterval}
                onChange={(e) => setTelemetryInterval(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <span className="text-[10px] text-slate-500">Telemetry updates every {telemetryInterval} seconds.</span>
            </div>

            <div className="space-y-2">
              <span className="text-slate-400 block font-semibold">Dehydration Threshold:</span>
              <input 
                type="number" 
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
              <span className="text-[10px] text-slate-500">Dispatches warnings when soil moisture falls below {alertThreshold}%.</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="space-y-4">
          <h3 className="text-sm font-bold text-slate-300">SaaS Integration API Keys</h3>
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold block">Gateway Bearer Auth Token:</span>
              <div className="flex gap-2">
                <input 
                  type="password" 
                  value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJz" 
                  readOnly 
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-slate-500 font-mono text-[10px]"
                />
                <button className="px-3 py-2 bg-slate-900 border border-slate-800 text-white rounded-xl font-bold">Copy</button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold block">InfluxDB Write Token:</span>
              <div className="flex gap-2">
                <input 
                  type="password" 
                  value="my-super-secret-token" 
                  readOnly 
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-slate-500 font-mono text-[10px]"
                />
                <button className="px-3 py-2 bg-slate-900 border border-slate-800 text-white rounded-xl font-bold">Copy</button>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ====================================================
// BONUS: CHAT & VOICE ASSISTANT (COLLAPSIBLE SIDEBAR)
// ====================================================
export function AIChatAssistant({ state, onExecuteCommand }: { state?: any; onExecuteCommand?: (cmd: any) => void }) {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Welcome to Agrisense AI Assistant. You can query me about NPK soil nutrient calibration, Spindle bug treatment protocols, or flight spray paths." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const speakText = (text: string) => {
    if (!voiceEnabled) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please try Google Chrome or Microsoft Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => (prev ? prev + " " + transcript : transcript));
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const historyPayload = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text
      }));

      const response = await fetch("http://127.0.0.1:8000/api/v1/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: userMsg,
          history: historyPayload,
          telemetry: state
        })
      });

      if (!response.ok) {
        throw new Error("Chat service responded with an error");
      }

      const data = await response.json();
      let responseText = data.response || "";

      const cmdRegex = /\[CMD:\s*(\{.*?\})\]/;
      const match = responseText.match(cmdRegex);
      if (match) {
        try {
          const cmdJson = JSON.parse(match[1]);
          if (onExecuteCommand) {
            onExecuteCommand(cmdJson);
          }
          responseText = responseText.replace(cmdRegex, "").trim();
        } catch (e) {
          console.error("Failed to parse command JSON:", e);
        }
      }

      setMessages(prev => [...prev, { sender: 'ai', text: responseText }]);
      speakText(responseText);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: "⚠️ Connection Error: Failed to reach backend API. Ensure FastAPI is running at http://localhost:8000 or your GEMINI_API_KEY environment variable is configured correctly."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-80 border-l border-slate-900 bg-slate-950 flex flex-col justify-between shrink-0 h-full">
      <div className="p-4 border-b border-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Agrisense AI Copilot</span>
        </div>
        <button
          onClick={() => {
            const nextVal = !voiceEnabled;
            setVoiceEnabled(nextVal);
            if (!nextVal && 'speechSynthesis' in window) {
              window.speechSynthesis.cancel();
            }
          }}
          className={`p-1.5 rounded-lg border transition-all ${
            voiceEnabled 
              ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-600/20' 
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
          }`}
          title={voiceEnabled ? "Mute voice response" : "Enable voice response"}
        >
          {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-normal ${
              m.sender === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-none' 
                : 'bg-slate-900 border border-slate-850 text-slate-200 rounded-tl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="p-3 bg-slate-900 border border-slate-850 text-slate-400 rounded-2xl rounded-tl-none text-xs">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-450 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-450 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-450 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-900 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "Listening..." : "Ask AI Copilot..."}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
        />
        <button
          onClick={startListening}
          className={`p-2 rounded-xl border transition-all ${
            isListening 
              ? 'bg-red-600/10 border-red-500 text-red-400 animate-pulse' 
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
          title="Voice input"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        <button 
          onClick={handleSend}
          className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white transition-all shadow-md shadow-emerald-600/10"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
