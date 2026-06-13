import React, { useState } from 'react';
import { Sprout, Cpu, Database, Network, Brain, Droplets, Sparkles, ShieldCheck, Layers, ArrowRight, Star, Mail, MapPin, Phone } from 'lucide-react';

interface LandingPageProps {
  onLaunch: (role: string) => void;
}

export default function LandingPage({ onLaunch }: LandingPageProps) {
  const [selectedRole, setSelectedRole] = useState("farmer");

  const techStack = [
    { name: "FastAPI", desc: "High-performance Python backend", icon: Cpu, color: "text-emerald-400" },
    { name: "React + Vite", desc: "Ultra-fast Next-gen Frontend", icon: Layers, color: "text-sky-400" },
    { name: "InfluxDB", desc: "IoT sensor time-series store", icon: Database, color: "text-purple-400" },
    { name: "PostgreSQL", desc: "Orchard configuration data", icon: Database, color: "text-blue-400" },
    { name: "MongoDB", desc: "Pest scans & vision records", icon: Database, color: "text-green-400" },
    { name: "LoRaWAN & ESP32", desc: "Long-range wireless edge nodes", icon: Network, color: "text-amber-400" },
  ];

  const modulesList = [
    { title: "Sensor Monitor", desc: "Real-time NPK, EC, Moisture telemetry at tree resolution." },
    { title: "Smart Irrigation", desc: "Auto-scheduling using closed-loop soil moisture parameters." },
    { title: "Computer Vision", desc: "Crown-level Spindle bug & Yellow Leaf disease spotters." },
    { title: "Drone Foliar Spray", desc: "Automated flight paths and payload tracking for weed control." },
    { title: "Digital Twin", desc: "interactive 2D tree grid map monitoring 3,000 trees live." },
    { title: "Explainable AI (XAI)", desc: "Transparent XGBoost/LSTM logic explaining predictions." }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600/20 border border-emerald-500/30 rounded-lg">
              <Sprout className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">AGRISENSE PRO</span>
              <span className="text-[10px] text-slate-400 block font-semibold tracking-widest uppercase -mt-1">Arecanut Intelligence</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#architecture" className="hover:text-emerald-400 transition-colors">Architecture</a>
            <a href="#tech" className="hover:text-emerald-400 transition-colors">Technology</a>
            <a href="#testimonials" className="hover:text-emerald-400 transition-colors">Testimonials</a>
          </nav>
          <div>
            <a href="#launch" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-semibold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 transition-all">
              Enterprise Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-screen flex items-center">
        {/* Ambient Blur Backdrops */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12 items-center relative z-10">
          <div className="md:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-semibold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" /> Next-Gen Precision Agriculture
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none">
              AI-Powered <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
                Arecanut Orchard Management System
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl">
              An enterprise-grade SaaS platform combining ESP32 LoRa mesh node telemetry, computer vision disease detection, autonomous drone spray routes, and custom explainable AI models to maximize yields and automate fertigation.
            </p>

            {/* Launch Selector Card */}
            <div id="launch" className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl max-w-lg space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Launch System Session</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "farmer", label: "Farmer" },
                  { id: "agronomist", label: "Agronomist" },
                  { id: "technician", label: "Technician" },
                  { id: "super_admin", label: "Super Admin" },
                ].map(role => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      selectedRole === role.id
                        ? "bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/5"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => onLaunch(selectedRole)}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 flex items-center justify-center gap-2 group transition-all"
              >
                Access Agrisense Console <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="md:col-span-5 relative">
            <div className="w-full aspect-square rounded-3xl bg-slate-900/40 border border-slate-800 p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-slate-950/80">
              {/* Grid Background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
              
              <div className="flex items-center justify-between z-10">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Edge Node Active
                </span>
                <span className="text-[10px] font-mono text-slate-500">ID: ESP32-ZONE-A</span>
              </div>

              {/* Decorative Animated Arecanut Orchard Graphic */}
              <div className="my-auto py-8 flex items-center justify-center relative">
                <div className="w-32 h-32 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center animate-pulse-slow">
                  <Sprout className="w-16 h-16 text-emerald-400 animate-float" />
                </div>
                {/* LoRa Ring Animations */}
                <div className="absolute w-48 h-48 border border-emerald-500/10 rounded-full animate-ping pointer-events-none opacity-40" />
                <div className="absolute w-64 h-64 border border-teal-500/5 rounded-full animate-ping pointer-events-none opacity-20" />
              </div>

              <div className="space-y-2 z-10">
                <div className="flex justify-between text-xs font-medium text-slate-400">
                  <span>Soil Moisture Telemetry</span>
                  <span className="font-mono text-slate-200">38.5%</span>
                </div>
                <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden border border-slate-700">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-[38.5%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Ribbon */}
      <section className="py-12 bg-slate-900/40 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { val: "3,000", label: "Trees Tracked Live" },
            { val: "94.2%", label: "AI Model Accuracy" },
            { val: "35%+", label: "Water Efficiency Save" },
            { val: "< 5s", label: "Edge-to-Cloud Latency" }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{stat.val}</div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Full-Stack Digital Forestry Architecture</h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Agrisense Pro delivers full sensor-to-cloud cohesion, providing orchardists, technicians, and agronomists tools tailored to their specific work roles.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {modulesList.map((m, i) => (
            <div key={i} className="p-6 bg-slate-900/30 border border-slate-800/80 rounded-2xl hover:border-emerald-500/30 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{m.title}</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture Visualizer */}
      <section id="architecture" className="py-20 bg-slate-900/20 border-t border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold text-white">Project Pipeline & Architecture</h2>
            <p className="text-slate-400 text-sm">
              Visualizing how data flows from soil sensors at the edge to AI-driven models and end-user dashboards.
            </p>
          </div>

          <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-3xl relative overflow-hidden">
            {/* Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center text-center relative z-10">
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl relative">
                <Cpu className="w-8 h-8 mx-auto text-amber-400 mb-3" />
                <h4 className="font-bold text-white">1. IoT Edge Nodes</h4>
                <p className="text-[11px] text-slate-400 mt-1">Soil sensors, pH meters, NPK probes wired to ESP32 LoRa transmitters.</p>
              </div>
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl">
                <Network className="w-8 h-8 mx-auto text-sky-400 mb-3" />
                <h4 className="font-bold text-white">2. LoRa Gateway</h4>
                <p className="text-[11px] text-slate-400 mt-1">Edge computer collects node telemetry, runs outlier filtering, transmits over HTTPS.</p>
              </div>
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl">
                <Database className="w-8 h-8 mx-auto text-purple-400 mb-3" />
                <h4 className="font-bold text-white">3. Multi-DB Storage</h4>
                <p className="text-[11px] text-slate-400 mt-1">Postgres structures metadata. InfluxDB ingests time-series. MongoDB archives scans.</p>
              </div>
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl">
                <Brain className="w-8 h-8 mx-auto text-emerald-400 mb-3" />
                <h4 className="font-bold text-white">4. AI Inference Engine</h4>
                <p className="text-[11px] text-slate-400 mt-1">Runs LSTM prediction, YOLOv8 vision overlays, and outputs SHAP recommendations.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Grid */}
      <section id="tech" className="py-24 max-w-7xl mx-auto px-6 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl font-extrabold text-white">Full-Stack SaaS Integrations</h2>
          <p className="text-slate-400 text-sm">
            Leveraging cutting edge technologies to provide unmatched dashboard reactivity and reliable data collection.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {techStack.map((tech, i) => (
            <div key={i} className="p-6 bg-slate-900/30 border border-slate-850 rounded-2xl text-center space-y-3">
              <tech.icon className={`w-8 h-8 mx-auto ${tech.color}`} />
              <h4 className="font-bold text-sm text-white">{tech.name}</h4>
              <p className="text-[10px] text-slate-500 leading-tight">{tech.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-slate-900/20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Vouched by Agronomists & Farmers</h2>
            <p className="text-slate-400 text-sm">
              Read how Arecanut cultivators transitioned from manual checks to smart AI-driven automation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Dr. Ramesh Hegde", role: "Arecanut Pathologist", quote: "The YOLOv8 image upload detected Spindle bug infestation at early stages, saving entire crops from yellow chlorosis." },
              { name: "K. Shivarama Gowda", role: "Estate Owner, 25 Hectares", quote: "The Closed-loop LoRa irrigation valves cut water consumption by 35% and stabilized NPK nutrients at root level." },
              { name: "Meera Nair", role: "Agritech IoT Engineer", quote: "Gateway-level outlier filtering has decreased packet payloads dramatically, keeping the LoRa network robust and fully reliable." }
            ].map((t, i) => (
              <div key={i} className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 italic text-sm">"{t.quote}"</p>
                </div>
                <div className="mt-6">
                  <h4 className="font-bold text-white text-sm">{t.name}</h4>
                  <p className="text-[11px] text-emerald-400 font-semibold">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-16 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-400" />
              <span className="font-extrabold tracking-tight text-white">AGRISENSE PRO</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Leading the innovation in Arecanut precision cultivation, providing advanced IoT edge devices, computer vision models, and Explainable AI recommendation logs.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm mb-4">Navigations</h4>
            <ul className="text-xs text-slate-400 space-y-2.5">
              <li><a href="#features" className="hover:text-emerald-400">Features</a></li>
              <li><a href="#architecture" className="hover:text-emerald-400">Architecture</a></li>
              <li><a href="#tech" className="hover:text-emerald-400">Tech Stack</a></li>
              <li><a href="#launch" className="hover:text-emerald-400">Access Portal</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm mb-4">Legal</h4>
            <ul className="text-xs text-slate-400 space-y-2.5">
              <li><a href="#" className="hover:text-emerald-400">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-emerald-400">Terms of Service</a></li>
              <li><a href="#" className="hover:text-emerald-400">SLA Agreement</a></li>
            </ul>
          </div>
          <div className="space-y-4 text-xs text-slate-400">
            <h4 className="font-bold text-white text-sm mb-4">AgriTech Support</h4>
            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-emerald-400" /> support@agrisense.com</div>
            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-400" /> +91 (80) 2344-9876</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-400" /> Shimoga - Arecanut Belt, Karnataka, India</div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-slate-900 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} Agrisense Pro. All rights reserved. Precision AgriTech SaaS for Commercial Arecanut Orchards.
        </div>
      </footer>
    </div>
  );
}
