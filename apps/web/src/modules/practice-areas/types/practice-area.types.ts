export interface PracticeArea {
  id: string;
  firmId: string;
  name: string;
  code: string;
  description: string;
  displayOrder: number;
  color: string;
  icon: string;
  isSystem: boolean;
  isActive: boolean;
  defaultHourlyRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePracticeAreaRequest {
  name: string;
  code: string;
  description?: string;
  color?: string;
  icon?: string;
  defaultHourlyRate?: number;
}

export interface UpdatePracticeAreaRequest {
  name?: string;
  description?: string;
  displayOrder?: number;
  color?: string;
  icon?: string;
  defaultHourlyRate?: number;
}

export interface PracticeAreaReorderItem {
  id: string;
  displayOrder: number;
}

export interface ReorderPracticeAreasRequest {
  practiceAreas: PracticeAreaReorderItem[];
}
