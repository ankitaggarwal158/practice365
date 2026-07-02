export type EventType =
  | "COURT_DATE"
  | "HEARING"
  | "MEETING"
  | "DEADLINE"
  | "APPOINTMENT"
  | "REMINDER"
  | "INTERNAL_EVENT"
  | "OTHER";

export type EventStatus = "UPCOMING" | "COMPLETED" | "MISSED" | "CANCELLED";

export interface CalendarEventUser {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
}

export interface CalendarEvent {
  id: string;
  firmId: string;
  matterId: string | null;
  title: string;
  description: string;
  eventType: EventType;
  startDateTime: string;
  endDateTime: string;
  allDay: boolean;
  location: string;
  assignedUsers: CalendarEventUser[];
  reminderOffsets: number[];
  status: EventStatus;
  completedAt: string | null;
  completedBy: CalendarEventUser | null;
  createdBy: CalendarEventUser;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  matterId?: string | null;
  title: string;
  description?: string;
  eventType: EventType;
  startDateTime: string;
  endDateTime: string;
  allDay?: boolean;
  location?: string;
  assignedUsers?: string[];
  reminderOffsets?: number[];
  status?: EventStatus;
}

export interface UpdateEventRequest {
  matterId?: string | null;
  title?: string;
  description?: string;
  eventType?: EventType;
  startDateTime?: string;
  endDateTime?: string;
  allDay?: boolean;
  location?: string;
  assignedUsers?: string[];
  reminderOffsets?: number[];
  status?: EventStatus;
}
