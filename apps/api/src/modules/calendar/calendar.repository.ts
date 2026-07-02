import { Types } from "mongoose";
import { CalendarEvent } from "./schemas/calendar-event.schema.js";
import { CalendarEventDocument } from "./calendar.types.js";

export interface CalendarListFilter {
  start?: string; // Date range start ISO string
  end?: string;   // Date range end ISO string
  matterId?: string;
  assignedUserId?: string;
  eventType?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedDocs<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
}

export async function findAll(
  firmId: string,
  filter: CalendarListFilter
): Promise<PaginatedDocs<CalendarEventDocument>> {
  const page = filter.page || 1;
  const limit = filter.limit || 100; // default larger for calendar views
  const skip = (page - 1) * limit;

  const query: any = {
    firmId: new Types.ObjectId(firmId),
    deleted: false,
  };

  // Date range filters
  if (filter.start || filter.end) {
    query.startDateTime = {};
    if (filter.start) {
      query.startDateTime.$gte = new Date(filter.start);
    }
    if (filter.end) {
      query.startDateTime.$lte = new Date(filter.end);
    }
  }

  if (filter.matterId) {
    if (filter.matterId === "none") {
      query.matterId = null;
    } else if (Types.ObjectId.isValid(filter.matterId)) {
      query.matterId = new Types.ObjectId(filter.matterId);
    }
  }

  if (filter.assignedUserId && Types.ObjectId.isValid(filter.assignedUserId)) {
    query.assignedUsers = new Types.ObjectId(filter.assignedUserId);
  }

  if (filter.eventType) {
    query.eventType = filter.eventType;
  }

  if (filter.status) {
    query.status = filter.status;
  }

  if (filter.search?.trim()) {
    const searchRegex = new RegExp(filter.search.trim(), "i");
    query.$or = [{ title: searchRegex }, { description: searchRegex }, { location: searchRegex }];
  }

  const [docs, totalDocs] = await Promise.all([
    CalendarEvent.find(query)
      .populate("assignedUsers", "firstName lastName displayName")
      .populate("createdBy", "firstName lastName displayName")
      .populate("completedBy", "firstName lastName displayName")
      .sort({ startDateTime: 1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    CalendarEvent.countDocuments(query),
  ]);

  return {
    docs,
    totalDocs,
    limit,
    page,
    totalPages: Math.ceil(totalDocs / limit) || 1,
  };
}

export async function findById(
  id: string,
  firmId: string
): Promise<CalendarEventDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) {
    return null;
  }
  return CalendarEvent.findOne({
    _id: new Types.ObjectId(id),
    firmId: new Types.ObjectId(firmId),
    deleted: false,
  })
    .populate("assignedUsers", "firstName lastName displayName")
    .populate("createdBy", "firstName lastName displayName")
    .populate("completedBy", "firstName lastName displayName")
    .exec();
}

export async function create(
  payload: Partial<CalendarEventDocument>
): Promise<CalendarEventDocument> {
  const created = await CalendarEvent.create(payload);
  return created.populate([
    { path: "assignedUsers", select: "firstName lastName displayName" },
    { path: "createdBy", select: "firstName lastName displayName" },
  ]);
}

export async function update(
  id: string,
  firmId: string,
  data: Partial<CalendarEventDocument>
): Promise<CalendarEventDocument | null> {
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(firmId)) {
    return null;
  }
  return CalendarEvent.findOneAndUpdate(
    {
      _id: new Types.ObjectId(id),
      firmId: new Types.ObjectId(firmId),
      deleted: false,
    },
    { $set: data },
    { new: true }
  )
    .populate("assignedUsers", "firstName lastName displayName")
    .populate("createdBy", "firstName lastName displayName")
    .populate("completedBy", "firstName lastName displayName")
    .exec();
}

export async function softDelete(
  id: string,
  firmId: string,
  deletedBy: string
): Promise<CalendarEventDocument | null> {
  if (
    !Types.ObjectId.isValid(id) ||
    !Types.ObjectId.isValid(firmId) ||
    !Types.ObjectId.isValid(deletedBy)
  ) {
    return null;
  }
  return CalendarEvent.findOneAndUpdate(
    {
      _id: new Types.ObjectId(id),
      firmId: new Types.ObjectId(firmId),
      deleted: false,
    },
    {
      $set: {
        deleted: true,
        deletedAt: new Date(),
        deletedBy: new Types.ObjectId(deletedBy),
      },
    },
    { new: true }
  ).exec();
}

export async function complete(
  id: string,
  firmId: string,
  completedBy: string,
  status: "COMPLETED" | "UPCOMING"
): Promise<CalendarEventDocument | null> {
  if (
    !Types.ObjectId.isValid(id) ||
    !Types.ObjectId.isValid(firmId) ||
    !Types.ObjectId.isValid(completedBy)
  ) {
    return null;
  }

  const setPayload: any = { status };
  if (status === "COMPLETED") {
    setPayload.completedAt = new Date();
    setPayload.completedBy = new Types.ObjectId(completedBy);
  } else {
    setPayload.completedAt = null;
    setPayload.completedBy = null;
  }

  return CalendarEvent.findOneAndUpdate(
    {
      _id: new Types.ObjectId(id),
      firmId: new Types.ObjectId(firmId),
      deleted: false,
    },
    {
      $set: setPayload,
    },
    { new: true }
  )
    .populate("assignedUsers", "firstName lastName displayName")
    .populate("createdBy", "firstName lastName displayName")
    .populate("completedBy", "firstName lastName displayName")
    .exec();
}
