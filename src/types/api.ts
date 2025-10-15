export interface ProcessByPidRequest {
  pid: number;
}

export interface AdjacentProcess {
  processId: number;
  eProcessAddress: string;
  processName: string;
}

export interface ProcessInfo {
  id: number;
  processId: number;
  processName: string;
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
  process: ProcessInfo;
  error?: string;
}

// Authentication types
export interface User {
  id: number;
  name: string;
}

export interface LoginRequest {
  name: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

// Snapshot types
export interface Snapshot {
  id: number;
  userId: number;
  snapshotType: 'iteration' | 'query';
  processCount: number;
  createdAt: string;
}

export interface SnapshotDetail extends Snapshot {
  processes: ProcessInfo[];
}

export interface SnapshotDetailResponse {
  success: boolean;
  snapshot: SnapshotDetail;
}

export interface SnapshotProcessesResponse {
  processes: ProcessInfo[];
  snapshot: SnapshotDetail;
}

export interface QueryHistory {
  id: number;
  snapshotId: number;
  pid: number;
  processName: string;
  queriedAt: string;
}

export interface QueryHistoryResponse {
  success: boolean;
  queries: QueryHistory[];
}

export interface Statistics {
  totalSnapshots: number;
  totalProcesses: number;
  iterationSnapshots: number;
  querySnapshots: number;
  uniquePids: number;
}

export interface StatisticsResponse {
  success: boolean;
  statistics: Statistics;
}