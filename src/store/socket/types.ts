export interface SocketState {
  [key: string]: boolean | SocketError | EndStops | ConsoleEntry[] | ChartData[] | string | string[] | Printer | null;
  open: boolean;
  connecting: boolean; // if the socket is down, are we still attempting to reconnect?
  ready: boolean;
  acceptingNotifications: boolean;
  error: SocketError | null;
  endstops: EndStops;
  macros: Macro[];
  plugins: string[]; // active plugins (device_power)
  failed_plugins: string[];
  console: ConsoleEntry[]; // console stream
  availableCommands: GcodeCommands; // available gcode commands
  chart: ChartData[]; // chart data
  printer: Printer;
}

export interface GcodeCommands {
  [key: string]: string;
}

export interface Printer {
  [key: string]: any;
}

// export interface Macros {
//   [key: string]: Macro;
// }

export interface Macro {
  name: string;
  visible?: boolean;
}

export interface SocketError {
    code: number;
    message: string;
}

export interface TimeEstimates {
  type: 'file' | 'slicer' | 'filament' | 'totals';
  progress: string;
  timeLeft: string;
  duration: string;
  totalDuration: string;
}

export interface Endstops {
  [key: string]: string;
}

export interface Heater {
  name: string;
  prettyName: string;
  key: string;
  color: string;
  temperature: number;
  target: number;
  power: number;
  minTemp?: number;
  maxTemp?: number;
}

export interface Fan {
  config: FanConfig;
  name: string;
  prettyName: string;
  key: string;
  color: string;
  type: string;
  controllable: boolean;
  speed?: number;
  temperature?: number;
  target?: number;
  minTemp?: number;
  maxTemp?: number;
}

export interface FanConfig {
  [index: string]: string | undefined;
  pin: string;
}

export interface OutputPin {
  name: string;
  prettyName: string;
  key: string;
  color: string;
  type: string;
  controllable: boolean;
  pwm: boolean;
  scale: number;
  static: number;
}

export interface OutputPinConfig {
  [index: string]: string | undefined;
  pwm?: string;
  static_value?: string;
  value?: string;
  shutdown_value?: string;
  cycle_time?: string;
  hardware_pwm?: string;
  scale?: string;
}

export interface Sensor {
  name: string;
  prettyName: string;
  key: string;
  color: string;
  type: string;
  temperature: number;
  target?: number;
  measured_min_temp?: number;
  measured_max_temp?: number;
  maxTemp?: number;
  minTemp?: number;
}

export interface ChartData {
  [key: string]: number | Date;
  date: Date;
}

export interface EndStops {
  [key: string]: 'TRIGGERED' | 'open';
}

export interface RunoutSensor {
  name: string;
  enabled: boolean;
  filament_detected: boolean;
}

export interface BedMesh {
  profile_name: string;
  active: boolean;
  markedForRemoval?: boolean;
  markedForSave?: boolean;
  mesh_max?: number[];
  mesh_min?: number[];
  mesh_matrix?: number[][];
  probed_matrix?: number[][];
}

export interface BedMeshProfile {
  algo: string;
  max_x: string;
  max_y: string;
  mesh_x_pps: string;
  mesh_y_pps: string;
  min_x: string;
  min_y: string;
  points: string;
  tension: string;
  version: string;
  x_count: string;
  y_count: string;
}

export interface ConsoleEntry {
  message: string;
  type: 'command' | 'response';
  time?: number;
}
