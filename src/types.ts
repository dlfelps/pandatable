export enum MessageType {
  DETECT_TABLES = 'DETECT_TABLES',
  EXTRACT_TABLE = 'EXTRACT_TABLE',
  RUN_PYTHON = 'RUN_PYTHON',
}

export interface RunPythonRequest {
  type: MessageType.RUN_PYTHON;
  code: string;
  data?: Record<string, string>[];
}

export interface RunPythonResponse {
  type: 'RUN_COMPLETE' | 'ERROR';
  result?: any;
  error?: string;
}

export type MessageRequest = DetectTablesRequest | ExtractTableRequest | RunPythonRequest;

