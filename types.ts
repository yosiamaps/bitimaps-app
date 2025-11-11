export type Page = 'dashboard' | 'territories' | 'publishers';

export enum TerritoryStatus {
  Available = 'Tersedia',
  InProgress = 'Dikerjakan',
  Completed = 'Selesai',
}

// Database-aligned types
export interface Publisher {
  id: number;
  name: string;
  group: string;
}

export interface Territory {
  id: number;
  name: string;
  kdl: string;
  gmaps_link?: string;
  status: TerritoryStatus;
}

export interface Assignment {
  id: number;
  territory_id: number;
  publisher_id: number | null;
  start_date: string;
  completion_date?: string | null;
  notes?: string | null;
}

// Combined types for UI
export interface AssignmentHistoryEntry {
  publisherName: string;
  startDate: string;
  completionDate: string;
  notes?: string;
}

export interface CurrentAssignmentEntry {
  publisherName: string;
  startDate: string;
  notes?: string;
}

export interface TerritoryWithDetails extends Territory {
  currentAssignment?: CurrentAssignmentEntry;
  history: AssignmentHistoryEntry[];
}

// UI types for Publisher details
export interface PublisherAssignmentEntry {
  territoryName: string;
  startDate: string;
  notes?: string;
  gmaps_link?: string;
}

export interface PublisherHistoryEntry {
  territoryName: string;
  startDate: string;
  completionDate: string;
  notes?: string;
}

export interface PublisherWithDetails extends Publisher {
  currentAssignment?: PublisherAssignmentEntry;
  history: PublisherHistoryEntry[];
}