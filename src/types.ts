export type LineStyle = 'solid' | 'dashed';
export type CardStatus = 'planned' | 'in_progress' | 'completed' | 'issue';

export interface Stage {
  id: string;
  name: string;
  color?: string;
  description?: string;
  order: number;
}

export interface SubStage {
  id: string;
  stageId: string;
  name: string;
  isKey?: boolean;
  description?: string;
  order: number;
}

export interface Role {
  id: string;
  name: string;
  subtitle?: string;
  category: 'customer' | 'partner' | 'vendor' | 'internal';
  color: string;
  order: number;
}

export interface JourneyNode {
  id: string;
  subStageId: string;
  roleId: string;
  title: string;
  description?: string;
  isKey?: boolean;
  status?: CardStatus;
  tags?: string[];
  emotion?: number; // 1 to 5 rating
  order?: number;
}

export interface Connection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
  style: LineStyle;
  color?: string;
}

export interface AttributeRow {
  id: string;
  name: string;
  iconName?: string;
  description?: string;
  type: 'touchpoint' | 'metric' | 'roadmap' | 'text';
  order: number;
  // Map of subStageId -> text content
  values: Record<string, string>;
}

export interface JourneyMapData {
  id: string;
  title: string;
  description: string;
  version: string;
  updatedAt: string;
  stages: Stage[];
  subStages: SubStage[];
  roles: Role[];
  nodes: JourneyNode[];
  connections: Connection[];
  attributeRows: AttributeRow[];
}

export type ActiveView = 'matrix' | 'flow' | 'emotion' | 'table';
