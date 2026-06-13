// Browser-side Real-time Simulator for AgriSense Pro

export interface SensorData {
  soil_moisture: number;
  soil_temp: number;
  ph: number;
  ec: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
  solar_radiation: number;
  battery_mv: number;
  rssi: number;
}

export interface CommStats {
  esp32_status: "online" | "offline";
  lora_rssi: number;
  lora_snr: number;
  gateway_status: "online" | "offline";
  latency_ms: number;
  packet_loss: number;
  packets_sent: number;
}

export interface EdgeMetrics {
  filtered_outliers: number;
  anomaly_detected: boolean;
  compression_ratio: number;
  local_storage_used_bytes: number;
}

export interface ValveState {
  valve_open: boolean;
  flow_rate: number; // L/min
  water_level: number; // %
  close_threshold?: number; // target moisture % for auto-closure
}

export interface DroneState {
  x: number; // map coord 0-100
  y: number;
  battery: number;
  tank_payload: number; // %
  status: "idle" | "flying" | "spraying" | "charging";
  path: { x: number; y: number }[];
  current_wpt?: number; // active waypoint index
}

export interface SystemState {
  sensors: Record<string, SensorData>;
  comm: CommStats;
  edge: EdgeMetrics;
  valves: Record<string, ValveState>;
  drone: DroneState;
  alerts: Array<{
    id: string;
    zone: string;
    type: string;
    severity: "critical" | "warning" | "info";
    message: string;
    timestamp: string;
    resolved: boolean;
  }>;
}

const ZONES = ["Zone Alpha", "Zone Beta", "Zone Gamma", "Zone Delta"];

// Seed initial values
export const getInitialState = (): SystemState => {
  const sensors: Record<string, SensorData> = {};
  const valves: Record<string, ValveState> = {};

  // Zone configurations
  sensors["Zone Alpha"] = { soil_moisture: 38.5, soil_temp: 24.2, ph: 6.2, ec: 1.2, nitrogen: 42.0, phosphorus: 18.0, potassium: 32.0, humidity: 68.2, rainfall: 0.0, wind_speed: 12.4, solar_radiation: 420.0, battery_mv: 3950, rssi: -62 };
  sensors["Zone Beta"] = { soil_moisture: 28.1, soil_temp: 26.5, ph: 5.8, ec: 1.5, nitrogen: 38.0, phosphorus: 14.0, potassium: 28.0, humidity: 64.0, rainfall: 0.0, wind_speed: 13.1, solar_radiation: 450.0, battery_mv: 3820, rssi: -68 };
  sensors["Zone Gamma"] = { soil_moisture: 42.0, soil_temp: 23.1, ph: 6.5, ec: 1.1, nitrogen: 45.0, phosphorus: 20.0, potassium: 35.0, humidity: 71.5, rainfall: 0.0, wind_speed: 11.5, solar_radiation: 390.0, battery_mv: 4100, rssi: -58 };
  sensors["Zone Delta"] = { soil_moisture: 19.5, soil_temp: 28.0, ph: 6.8, ec: 1.8, nitrogen: 30.0, phosphorus: 10.0, potassium: 22.0, humidity: 59.1, rainfall: 0.0, wind_speed: 14.8, solar_radiation: 480.0, battery_mv: 3450, rssi: -78 };

  ZONES.forEach(zone => {
    valves[zone] = {
      valve_open: false,
      flow_rate: 0.0,
      water_level: zone === "Zone Delta" ? 42.0 : 85.0
    };
  });

  return {
    sensors,
    comm: {
      esp32_status: "online",
      lora_rssi: -65,
      lora_snr: 8.5,
      gateway_status: "online",
      latency_ms: 120,
      packet_loss: 0.4,
      packets_sent: 2450
    },
    edge: {
      filtered_outliers: 14,
      anomaly_detected: false,
      compression_ratio: 3.2,
      local_storage_used_bytes: 4120
    },
    valves,
    drone: {
      x: 10,
      y: 10,
      battery: 100,
      tank_payload: 100,
      status: "idle",
      path: [
        { x: 10, y: 10 },
        { x: 30, y: 20 },
        { x: 50, y: 45 },
        { x: 75, y: 60 },
        { x: 90, y: 85 }
      ]
    },
    alerts: [
      {
        id: "alert-1",
        zone: "Zone Delta",
        type: "Soil Moisture Low",
        severity: "critical",
        message: "Critical moisture drop detected in Zone Delta (19.5%). Immediate irrigation recommended.",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        resolved: false
      },
      {
        id: "alert-2",
        zone: "Zone Delta",
        type: "Battery Level Warning",
        severity: "warning",
        message: "LoRa Node D battery is critically low (3.45V). Schedule battery replacement.",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        resolved: false
      }
    ]
  };
};

// Update simulation state
export const updateSimulation = (prev: SystemState, autoIrrigationEnabled: boolean): SystemState => {
  const next = JSON.parse(JSON.stringify(prev)) as SystemState;

  // 1. Update packets and latency
  next.comm.packets_sent += Math.floor(Math.random() * 3) + 1;
  next.comm.latency_ms = Math.floor(100 + Math.random() * 40);
  next.comm.lora_rssi = -60 - Math.floor(Math.random() * 15);
  next.comm.lora_snr = +(7.0 + Math.random() * 3.0).toFixed(1);

  // 2. Process each Zone
  ZONES.forEach(zone => {
    const s = next.sensors[zone];
    const v = next.valves[zone];

    // Check if valve is open
    if (v.valve_open) {
      // Moisture rises
      const maxMoist = v.close_threshold || 65.0;
      s.soil_moisture = +(s.soil_moisture + 0.4 + Math.random() * 0.2).toFixed(1);
      if (s.soil_moisture > maxMoist) s.soil_moisture = maxMoist;
      
      // Auto-close if threshold reached
      if (v.close_threshold && s.soil_moisture >= v.close_threshold) {
        v.valve_open = false;
        v.flow_rate = 0.0;
        v.close_threshold = undefined; // reset threshold
        next.alerts.unshift({
          id: `alert-auto-close-${Date.now()}`,
          zone,
          type: "Valve Auto-Closed",
          severity: "info",
          message: `Closed Valve ${zone.split(' ').pop()} dynamically. Moisture target of ${maxMoist}% achieved.`,
          timestamp: new Date().toISOString(),
          resolved: false
        });
      } else {
        // Water level goes down in localized tanks
        v.water_level = +(v.water_level - 0.15).toFixed(2);
        if (v.water_level < 10) v.water_level = 10.0;
        v.flow_rate = 45.2; // flow rate
      }
    } else {
      // Moisture naturally drops
      s.soil_moisture = +(s.soil_moisture - 0.05 - Math.random() * 0.05).toFixed(1);
      if (s.soil_moisture < 12.0) s.soil_moisture = 12.0;
      
      // Rain increases moisture
      if (s.rainfall > 0) {
        s.soil_moisture = +(s.soil_moisture + s.rainfall * 0.2).toFixed(1);
      }
      
      v.flow_rate = 0.0;
      // Refill tanks slowly (natural rain/recharging)
      if (v.water_level < 100) {
        v.water_level = +(v.water_level + 0.05).toFixed(2);
      }
    }

    // Auto irrigation AI intervention
    if (autoIrrigationEnabled && s.soil_moisture < 22.0 && !v.valve_open) {
      v.valve_open = true;
      next.alerts.unshift({
        id: `alert-auto-irr-${Date.now()}`,
        zone,
        type: "AI Irrigation Actuated",
        severity: "info",
        message: `AI closed-loop control opened Valve ${zone[-1]} due to low moisture (${s.soil_moisture}%).`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    // Dynamic temperature cyclic updates
    const hours = new Date().getHours();
    const isDay = hours > 6 && hours < 18;
    if (isDay) {
      s.soil_temp = +(s.soil_temp + 0.05 + Math.random() * 0.03).toFixed(1);
      if (s.soil_temp > 32.0) s.soil_temp = 32.0;
      s.solar_radiation = +(500 + Math.random() * 100).toFixed(1);
    } else {
      s.soil_temp = +(s.soil_temp - 0.05 - Math.random() * 0.03).toFixed(1);
      if (s.soil_temp < 18.0) s.soil_temp = 18.0;
      s.solar_radiation = 0.0;
    }

    // Fluctuating weather factors
    s.wind_speed = +(10 + Math.random() * 8).toFixed(1);
    s.humidity = +(65 + Math.random() * 10).toFixed(1);

    // Minor NPK/pH drifts
    s.ph = +(s.ph + (Math.random() - 0.5) * 0.01).toFixed(2);
    s.ec = +(s.ec + (Math.random() - 0.5) * 0.01).toFixed(2);
  });

  // 3. Edge anomaly simulation
  next.edge.local_storage_used_bytes += Math.floor(Math.random() * 64);
  if (Math.random() > 0.95) {
    next.edge.anomaly_detected = true;
    next.edge.filtered_outliers += 1;
    // Push alert
    next.alerts.unshift({
      id: `alert-anomaly-${Date.now()}`,
      zone: "Zone Delta",
      type: "Edge Computing Anomaly",
      severity: "warning",
      message: "Edge preprocessor isolated telemetry spike (transient sensor outlier filtered out).",
      timestamp: new Date().toISOString(),
      resolved: false
    });
  } else {
    next.edge.anomaly_detected = false;
  }

  // 4. Drone state simulation
  if (next.drone.status === "flying" || next.drone.status === "spraying") {
    next.drone.battery = Math.max(0, next.drone.battery - 1.2);
    if (next.drone.status === "spraying") {
      next.drone.tank_payload = Math.max(0, next.drone.tank_payload - 4.0);
    }
    
    if (next.drone.path && next.drone.path.length > 0) {
      // Initialize waypoint index if not present
      if (next.drone.current_wpt === undefined || next.drone.current_wpt >= next.drone.path.length) {
        next.drone.current_wpt = 0;
      }
      
      const target = next.drone.path[next.drone.current_wpt];
      const dx = target.x - next.drone.x;
      const dy = target.y - next.drone.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // If we are close to the target waypoint, advance to the next one
      if (dist < 4.0) {
        // Toggle drone status between flying and spraying dynamically
        next.drone.status = next.drone.status === "flying" ? "spraying" : "flying";
        
        if (next.drone.current_wpt + 1 < next.drone.path.length) {
          next.drone.current_wpt += 1;
        } else {
          // Path completed! Go to charging
          next.drone.status = "charging";
          next.drone.current_wpt = 0;
          next.alerts.unshift({
            id: `drone-success-${Date.now()}`,
            zone: "Orchard Area",
            type: "Drone Mission Complete",
            severity: "info",
            message: "Foliar spray mission completed. Octacopter returned to base station for charging.",
            timestamp: new Date().toISOString(),
            resolved: false
          });
        }
      } else {
        // Move towards the target at a realistic speed (8 units per tick)
        const speed = 8.0; 
        const ratio = speed / dist;
        next.drone.x += dx * Math.min(1.0, ratio);
        next.drone.y += dy * Math.min(1.0, ratio);
      }
    } else {
      next.drone.status = "idle";
    }

    if (next.drone.battery < 15) {
      next.drone.status = "charging";
    }
  } else if (next.drone.status === "charging") {
    next.drone.battery = Math.min(100, next.drone.battery + 8.0);
    next.drone.x = 10;
    next.drone.y = 10;
    if (next.drone.battery === 100) {
      next.drone.status = "idle";
      next.drone.tank_payload = 100;
      next.drone.current_wpt = 0;
    }
  }

  return next;
};
