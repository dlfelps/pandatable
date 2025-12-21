export enum MessageType {
  DETECT_TABLES = 'DETECT_TABLES',
  EXTRACT_TABLE = 'EXTRACT_TABLE',
}

export interface DetectTablesRequest {
  type: MessageType.DETECT_TABLES;
}

export interface DetectTablesResponse {
  tables: {
    id: string;
    hasHeader: boolean;
    name: string; // Brief summary or snippet
  }[];
}

export interface ExtractTableRequest {
  type: MessageType.EXTRACT_TABLE;
  tableId: string;
}

export interface ExtractTableResponse {
  data: Record<string, string>[];
}

export type MessageRequest = DetectTablesRequest | ExtractTableRequest;
