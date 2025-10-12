export interface ProcessByPidRequest {
  pid: number;
}

export interface AdjacentProcess {
  processId: number;
  eProcessAddress: string;
  processName: string;
}

export interface ProcessInfo {
  processId: number;
  processName: number;
  currentProcessAddress: string;
  threadCount: number;
  parentProcessId: number;
  priorityClassBase: number;
  createTime: string;
  basePriority: number;
  handleCount: number;
  sessionID: number;
  workingSetSize: number;
  peakWorkingSetSize: number;
  workingSetSizeInKB: number;
  peakWorkingSetSizeInKB: number;
  virtualSize: number;
  peakVirtualSize: number;
  virtualSizeInKB: number;
  peakVirtualSizeInKB: number;
  pageFaultCount: number;
  peakPageFaultCount: number;
  pageFileUsage: number;
  peakPageFileUsage: number;
  pageFileUsageInKB: number;
  peakPageFileUsageInKB: number;
  privateUsage: number;
  privateUsageInKB: number;
  executablePath: string;
  commandLine: string;
  environmentVariables: string;
  modules: string;
  threads: string;
  owner: string;
  description: string;
  version: string;
  company: string;
  windowTitle: string;
  previousProcess: AdjacentProcess;
  nextProcess: AdjacentProcess;
}

export interface ProcessBasic {
  index: number;
  processName: string;
  processId: number;
}

export interface IterateProcessesResponse {
  success: boolean;
  processCount: number;
  processes: ProcessInfo[];
}

export interface ProcessByPidResponse {
  success: boolean;
  processInfo: ProcessInfo;
  error?: string;
}