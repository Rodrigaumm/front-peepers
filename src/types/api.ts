export interface ProcessByPidRequest {
  PID: number;
}

export interface ProcessInfo {
  ProcessID: number;
  ProcessName: string;
  ThreadCount: number;
  ParentProcessID: number;
  PriorityClassBase: number;
  ElapsedTime: string;
  HandleCount: number;
  SessionID: number;
  WorkingSetSize: number;
  PeakWorkingSetSize: number;
  WorkingSetSizeInKB: number;
  PeakWorkingSetSizeInKB: number;
  VirtualSize: number;
  PeakVirtualSize: number;
  VirtualSizeInKB: number;
  PeakVirtualSizeInKB: number;
  PageFaultCount: number;
  PeakPageFaultCount: number;
  PageFileUsage: number;
  PeakPageFileUsage: number;
  PageFileUsageInKB: number;
  PeakPageFileUsageInKB: number;
  PrivateUsage: number;
  PrivateUsageInKB: number;
  ExecutablePath: string;
  CommandLine: string;
  EnvironmentVariables: string;
  Modules: string;
  Threads: string;
  Owner: string;
  Description: string;
  Version: string;
  Company: string;
  WindowTitle: string;
}

export interface ProcessBasic {
  Index: number;
  ProcessName: string;
  ProcessID: number;
}

export interface IterateProcessesResponse {
  Success: boolean;
  ProcessCount: number;
  Processes: ProcessBasic[];
}

export interface ProcessByPidResponse {
  Success: boolean;
  ProcessInfo: ProcessInfo;
  Error?: string;
}