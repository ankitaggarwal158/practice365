import { Types } from "mongoose";
import { Matter } from "../matters/schemas/matter.schema.js";
import { Client } from "../clients/schemas/client.schema.js";
import { TimeEntryModel } from "../time-tracking/schemas/time-entry.schema.js";
import { InvoiceModel } from "../billing/schemas/invoice.schema.js";
import { InvoicePaymentModel } from "../billing/schemas/invoice-payment.schema.js";
import { AuditLog } from "../audit-log/schemas/audit-log.schema.js";

// Matters Repository Query
export async function queryMattersReport(
  firmId: string,
  filters: any
): Promise<{ docs: any[]; total: number; summary: any }> {
  const matchStage: any = { firmId: new Types.ObjectId(firmId) };

  if (filters.status) matchStage.status = filters.status;
  if (filters.practiceAreaId) matchStage.practiceAreaId = new Types.ObjectId(filters.practiceAreaId);
  if (filters.responsibleAttorneyId) matchStage.responsibleAttorneyId = new Types.ObjectId(filters.responsibleAttorneyId);
  if (filters.clientId) matchStage.clientId = new Types.ObjectId(filters.clientId);

  if (filters.fromDate || filters.toDate) {
    matchStage.openedDate = {};
    if (filters.fromDate) matchStage.openedDate.$gte = new Date(filters.fromDate);
    if (filters.toDate) matchStage.openedDate.$lte = new Date(filters.toDate);
  }

  // Sorting
  const sortStage: any = {};
  if (filters.sort) {
    const direction = filters.sort.startsWith("-") ? -1 : 1;
    const field = filters.sort.replace(/^-/, "");
    sortStage[field] = direction;
  } else {
    sortStage.openedDate = -1;
  }

  const page = filters.page || 1;
  const limit = filters.limit || 25;
  const skip = (page - 1) * limit;

  // Aggregate with Facets
  const pipeline = [
    { $match: matchStage },
    {
      $facet: {
        docs: [
          { $sort: sortStage },
          { $skip: skip },
          { $limit: limit },
          // Lookup Client details
          {
            $lookup: {
              from: "clients",
              localField: "clientId",
              foreignField: "_id",
              as: "client",
            },
          },
          { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
          // Lookup Attorney details
          {
            $lookup: {
              from: "users",
              localField: "responsibleAttorneyId",
              foreignField: "_id",
              as: "attorney",
            },
          },
          { $unwind: { path: "$attorney", preserveNullAndEmptyArrays: true } },
          // Lookup Practice Area details
          {
            $lookup: {
              from: "practice_areas",
              localField: "practiceAreaId",
              foreignField: "_id",
              as: "practiceArea",
            },
          },
          { $unwind: { path: "$practiceArea", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              id: "$_id",
              _id: 1,
              matterNumber: 1,
              title: 1,
              status: 1,
              openedDate: 1,
              billingMethod: 1,
              estimatedValue: 1,
              clientId: 1,
              clientName: {
                $cond: {
                  if: { $eq: ["$client.clientType", "INDIVIDUAL"] },
                  then: { $trim: { input: { $concat: ["$client.firstName", " ", "$client.lastName"] } } },
                  else: "$client.companyName",
                },
              },
              responsibleAttorneyId: 1,
              responsibleAttorneyName: {
                $trim: { input: { $concat: ["$attorney.firstName", " ", "$attorney.lastName"] } },
              },
              practiceAreaId: 1,
              practiceAreaName: "$practiceArea.name",
            },
          },
        ],
        totalCount: [{ $count: "count" }],
        statusCounts: [
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ],
        billingMethodCounts: [
          { $group: { _id: "$billingMethod", count: { $sum: 1 } } }
        ],
        estimatedValueSum: [
          { $group: { _id: null, total: { $sum: "$estimatedValue" } } }
        ]
      },
    },
  ];

  const results = await Matter.aggregate(pipeline);
  const facetResult = results[0];

  const docs = facetResult.docs || [];
  const total = facetResult.totalCount[0]?.count || 0;

  // Post process status breakdowns
  const statusBreakdown: Record<string, number> = { OPEN: 0, ON_HOLD: 0, CLOSED: 0, ARCHIVED: 0 };
  facetResult.statusCounts.forEach((sc: any) => {
    if (sc._id) statusBreakdown[sc._id] = sc.count;
  });

  const billingMethodBreakdown: Record<string, number> = { HOURLY: 0, FLAT_FEE: 0, CONTINGENCY: 0 };
  facetResult.billingMethodCounts.forEach((bc: any) => {
    if (bc._id) billingMethodBreakdown[bc._id] = bc.count;
  });

  // Handle Decimal128 conversion safely
  let totalEstimatedValue = 0;
  if (facetResult.estimatedValueSum[0]?.total) {
    const val = facetResult.estimatedValueSum[0].total;
    totalEstimatedValue = typeof val.toString === "function" ? parseFloat(val.toString()) : parseFloat(val);
  }

  return {
    docs,
    total,
    summary: {
      totalCount: total,
      statusBreakdown,
      billingMethodBreakdown,
      totalEstimatedValue: isNaN(totalEstimatedValue) ? 0 : totalEstimatedValue,
    },
  };
}

// Clients Repository Query
export async function queryClientsReport(
  firmId: string,
  filters: any
): Promise<{ docs: any[]; total: number; summary: any }> {
  const matchStage: any = { firmId: new Types.ObjectId(firmId) };

  if (filters.status) matchStage.status = filters.status;
  if (filters.clientType) matchStage.clientType = filters.clientType;

  if (filters.fromDate || filters.toDate) {
    matchStage.createdAt = {};
    if (filters.fromDate) matchStage.createdAt.$gte = new Date(filters.fromDate);
    if (filters.toDate) matchStage.createdAt.$lte = new Date(filters.toDate);
  }

  // Sorting
  const sortStage: any = {};
  if (filters.sort) {
    const direction = filters.sort.startsWith("-") ? -1 : 1;
    const field = filters.sort.replace(/^-/, "");
    sortStage[field] = direction;
  } else {
    sortStage.createdAt = -1;
  }

  const page = filters.page || 1;
  const limit = filters.limit || 25;
  const skip = (page - 1) * limit;

  const pipeline = [
    { $match: matchStage },
    {
      $facet: {
        docs: [
          { $sort: sortStage },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              id: "$_id",
              _id: 1,
              clientNumber: 1,
              clientType: 1,
              status: 1,
              firstName: 1,
              lastName: 1,
              companyName: 1,
              email: 1,
              phone: 1,
              createdAt: 1,
            },
          },
        ],
        totalCount: [{ $count: "count" }],
        statusCounts: [
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ],
        clientTypeCounts: [
          { $group: { _id: "$clientType", count: { $sum: 1 } } }
        ],
      },
    },
  ];

  const results = await Client.aggregate(pipeline);
  const facetResult = results[0];

  const docs = facetResult.docs || [];
  const total = facetResult.totalCount[0]?.count || 0;

  const statusBreakdown: Record<string, number> = { ACTIVE: 0, INACTIVE: 0, ARCHIVED: 0 };
  facetResult.statusCounts.forEach((sc: any) => {
    if (sc._id) statusBreakdown[sc._id] = sc.count;
  });

  const clientTypeBreakdown: Record<string, number> = { INDIVIDUAL: 0, ORGANIZATION: 0 };
  facetResult.clientTypeCounts.forEach((ct: any) => {
    if (ct._id) clientTypeBreakdown[ct._id] = ct.count;
  });

  return {
    docs,
    total,
    summary: {
      totalCount: total,
      statusBreakdown,
      clientTypeBreakdown,
    },
  };
}

// Time Entries Repository Query
export async function queryTimeReport(
  firmId: string,
  filters: any
): Promise<{ docs: any[]; total: number; summary: any }> {
  const matchStage: any = { 
    firmId: new Types.ObjectId(firmId),
    deletedAt: { $exists: false } // Only non-deleted time entries
  };

  if (filters.matterId) matchStage.matterId = new Types.ObjectId(filters.matterId);
  if (filters.userId) matchStage.userId = new Types.ObjectId(filters.userId);
  if (filters.billingType) matchStage.billingType = filters.billingType;

  if (filters.fromDate || filters.toDate) {
    matchStage.date = {};
    if (filters.fromDate) matchStage.date.$gte = new Date(filters.fromDate);
    if (filters.toDate) matchStage.date.$lte = new Date(filters.toDate);
  }

  const sortStage: any = {};
  if (filters.sort) {
    const direction = filters.sort.startsWith("-") ? -1 : 1;
    const field = filters.sort.replace(/^-/, "");
    sortStage[field] = direction;
  } else {
    sortStage.date = -1;
  }

  const page = filters.page || 1;
  const limit = filters.limit || 25;
  const skip = (page - 1) * limit;

  const pipeline = [
    { $match: matchStage },
    {
      $facet: {
        docs: [
          { $sort: sortStage },
          { $skip: skip },
          { $limit: limit },
          // Lookup User details
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          // Lookup Matter details
          {
            $lookup: {
              from: "matters",
              localField: "matterId",
              foreignField: "_id",
              as: "matter",
            },
          },
          { $unwind: { path: "$matter", preserveNullAndEmptyArrays: true } },
          // Lookup Client details
          {
            $lookup: {
              from: "clients",
              localField: "clientId",
              foreignField: "_id",
              as: "client",
            },
          },
          { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              id: "$_id",
              _id: 1,
              durationMinutes: 1,
              hourlyRate: 1,
              billableAmount: 1,
              billingType: 1,
              date: 1,
              description: 1,
              isBilled: 1,
              userId: 1,
              userName: {
                $trim: { input: { $concat: ["$user.firstName", " ", "$user.lastName"] } },
              },
              matterId: 1,
              matterNumber: "$matter.matterNumber",
              matterTitle: "$matter.title",
              clientId: 1,
              clientName: {
                $cond: {
                  if: { $eq: ["$client.clientType", "INDIVIDUAL"] },
                  then: { $trim: { input: { $concat: ["$client.firstName", " ", "$client.lastName"] } } },
                  else: "$client.companyName",
                },
              },
            },
          },
        ],
        totalCount: [{ $count: "count" }],
        totals: [
          {
            $group: {
              _id: null,
              totalMinutes: { $sum: "$durationMinutes" },
              totalBillableMinutes: {
                $sum: {
                  $cond: [{ $eq: ["$billingType", "BILLABLE"] }, "$durationMinutes", 0]
                }
              },
              totalNonBillableMinutes: {
                $sum: {
                  $cond: [{ $eq: ["$billingType", "NON_BILLABLE"] }, "$durationMinutes", 0]
                }
              },
              totalBillableAmount: { $sum: "$billableAmount" },
            }
          }
        ],
      },
    },
  ];

  const results = await TimeEntryModel.aggregate(pipeline);
  const facetResult = results[0];

  const docs = facetResult.docs || [];
  const total = facetResult.totalCount[0]?.count || 0;

  const totalsObj = facetResult.totals[0] || {
    totalMinutes: 0,
    totalBillableMinutes: 0,
    totalNonBillableMinutes: 0,
    totalBillableAmount: 0
  };

  const totalBillableHours = totalsObj.totalBillableMinutes / 60;
  const averageHourlyRate = totalBillableHours > 0 ? (totalsObj.totalBillableAmount / totalBillableHours) : 0;

  return {
    docs,
    total,
    summary: {
      totalRecordedMinutes: totalsObj.totalMinutes,
      totalBillableMinutes: totalsObj.totalBillableMinutes,
      totalNonBillableMinutes: totalsObj.totalNonBillableMinutes,
      totalBillableAmount: totalsObj.totalBillableAmount,
      averageHourlyRate: Math.round(averageHourlyRate * 100) / 100,
    },
  };
}

// Invoices Repository Query
export async function queryInvoicesReport(
  firmId: string,
  filters: any
): Promise<{ docs: any[]; total: number; summary: any }> {
  const matchStage: any = { 
    firmId: new Types.ObjectId(firmId),
    deleted: false
  };

  if (filters.status) matchStage.status = filters.status;
  if (filters.clientId) matchStage.clientId = new Types.ObjectId(filters.clientId);
  if (filters.matterId) matchStage.matterId = new Types.ObjectId(filters.matterId);

  if (filters.fromDate || filters.toDate) {
    matchStage.issueDate = {};
    if (filters.fromDate) matchStage.issueDate.$gte = new Date(filters.fromDate);
    if (filters.toDate) matchStage.issueDate.$lte = new Date(filters.toDate);
  }

  const sortStage: any = {};
  if (filters.sort) {
    const direction = filters.sort.startsWith("-") ? -1 : 1;
    const field = filters.sort.replace(/^-/, "");
    sortStage[field] = direction;
  } else {
    sortStage.issueDate = -1;
  }

  const page = filters.page || 1;
  const limit = filters.limit || 25;
  const skip = (page - 1) * limit;

  const pipeline = [
    { $match: matchStage },
    {
      $facet: {
        docs: [
          { $sort: sortStage },
          { $skip: skip },
          { $limit: limit },
          // Lookup Client details
          {
            $lookup: {
              from: "clients",
              localField: "clientId",
              foreignField: "_id",
              as: "client",
            },
          },
          { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
          // Lookup Matter details
          {
            $lookup: {
              from: "matters",
              localField: "matterId",
              foreignField: "_id",
              as: "matter",
            },
          },
          { $unwind: { path: "$matter", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              id: "$_id",
              _id: 1,
              invoiceNumber: 1,
              status: 1,
              issueDate: 1,
              dueDate: 1,
              subtotal: 1,
              taxAmount: 1,
              totalAmount: 1,
              amountPaid: 1,
              balanceDue: 1,
              clientId: 1,
              clientName: {
                $cond: {
                  if: { $eq: ["$client.clientType", "INDIVIDUAL"] },
                  then: { $trim: { input: { $concat: ["$client.firstName", " ", "$client.lastName"] } } },
                  else: "$client.companyName",
                },
              },
              matterId: 1,
              matterTitle: "$matter.title",
            },
          },
        ],
        totalCount: [{ $count: "count" }],
        totals: [
          {
            $group: {
              _id: null,
              totalInvoiced: { $sum: "$totalAmount" },
              totalPaid: { $sum: "$amountPaid" },
              totalBalanceDue: { $sum: "$balanceDue" },
            }
          }
        ],
        statusCounts: [
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ]
      },
    },
  ];

  const results = await InvoiceModel.aggregate(pipeline);
  const facetResult = results[0];

  const docs = facetResult.docs || [];
  const total = facetResult.totalCount[0]?.count || 0;

  const totalsObj = facetResult.totals[0] || { totalInvoiced: 0, totalPaid: 0, totalBalanceDue: 0 };
  
  const statusBreakdown: Record<string, number> = {
    DRAFT: 0,
    SENT: 0,
    PAID: 0,
    PARTIALLY_PAID: 0,
    OVERDUE: 0,
    CANCELLED: 0
  };
  facetResult.statusCounts.forEach((sc: any) => {
    if (sc._id) statusBreakdown[sc._id] = sc.count;
  });

  return {
    docs,
    total,
    summary: {
      totalInvoiced: totalsObj.totalInvoiced,
      totalPaid: totalsObj.totalPaid,
      totalBalanceDue: totalsObj.totalBalanceDue,
      statusBreakdown,
    },
  };
}

// Revenue (Payments) Repository Query
export async function queryRevenueReport(
  firmId: string,
  filters: any
): Promise<{ docs: any[]; total: number; summary: any }> {
  // To aggregate payments, we start from InvoicePaymentModel
  // and lookup invoices to filter by firmId

  const matchInvoiceStage: any = {
    "invoice.firmId": new Types.ObjectId(firmId),
    "invoice.deleted": false,
  };

  const matchPaymentStage: any = {};
  if (filters.paymentMethod) matchPaymentStage.paymentMethod = filters.paymentMethod;

  if (filters.fromDate || filters.toDate) {
    matchPaymentStage.paymentDate = {};
    if (filters.fromDate) matchPaymentStage.paymentDate.$gte = new Date(filters.fromDate);
    if (filters.toDate) matchPaymentStage.paymentDate.$lte = new Date(filters.toDate);
  }

  const sortStage: any = {};
  if (filters.sort) {
    const direction = filters.sort.startsWith("-") ? -1 : 1;
    const field = filters.sort.replace(/^-/, "");
    sortStage[field] = direction;
  } else {
    sortStage.paymentDate = -1;
  }

  const page = filters.page || 1;
  const limit = filters.limit || 25;
  const skip = (page - 1) * limit;

  const pipeline = [
    // Look up parent invoice
    {
      $lookup: {
        from: "invoices",
        localField: "invoiceId",
        foreignField: "_id",
        as: "invoice",
      },
    },
    { $unwind: "$invoice" },
    // Filter by firm
    { $match: matchInvoiceStage },
    // Filter by payment fields
    { $match: matchPaymentStage },
    {
      $facet: {
        docs: [
          { $sort: sortStage },
          { $skip: skip },
          { $limit: limit },
          // Lookup Client details
          {
            $lookup: {
              from: "clients",
              localField: "invoice.clientId",
              foreignField: "_id",
              as: "client",
            },
          },
          { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
          // Lookup Matter details
          {
            $lookup: {
              from: "matters",
              localField: "invoice.matterId",
              foreignField: "_id",
              as: "matter",
            },
          },
          { $unwind: { path: "$matter", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              id: "$_id",
              _id: 1,
              paymentDate: 1,
              amount: 1,
              paymentMethod: 1,
              referenceNumber: 1,
              invoiceId: 1,
              invoiceNumber: "$invoice.invoiceNumber",
              clientId: "$invoice.clientId",
              clientName: {
                $cond: {
                  if: { $eq: ["$client.clientType", "INDIVIDUAL"] },
                  then: { $trim: { input: { $concat: ["$client.firstName", " ", "$client.lastName"] } } },
                  else: "$client.companyName",
                },
              },
              matterId: "$invoice.matterId",
              matterTitle: "$matter.title",
            },
          },
        ],
        totalCount: [{ $count: "count" }],
        totals: [
          { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
        ],
        paymentMethodCounts: [
          { $group: { _id: "$paymentMethod", total: { $sum: "$amount" } } }
        ]
      },
    },
  ];

  const results = await InvoicePaymentModel.aggregate(pipeline);
  const facetResult = results[0];

  const docs = facetResult.docs || [];
  const total = facetResult.totalCount[0]?.count || 0;

  const totalRevenue = facetResult.totals[0]?.totalRevenue || 0;

  const paymentMethodBreakdown: Record<string, number> = {
    STRIPE: 0,
    CASH: 0,
    CHECK: 0,
    BANK_TRANSFER: 0,
    OTHER: 0
  };
  facetResult.paymentMethodCounts.forEach((pm: any) => {
    if (pm._id) paymentMethodBreakdown[pm._id] = pm.total;
  });

  return {
    docs,
    total,
    summary: {
      totalRevenue,
      paymentMethodBreakdown,
    },
  };
}

// User Activity Repository Query
export async function queryUserActivityReport(
  firmId: string,
  filters: any
): Promise<{ docs: any[]; total: number; summary: any }> {
  const matchStage: any = { firmId: new Types.ObjectId(firmId) };

  if (filters.userId) matchStage.userId = new Types.ObjectId(filters.userId);
  if (filters.module) matchStage.module = filters.module;
  if (filters.action) matchStage.action = filters.action;

  if (filters.fromDate || filters.toDate) {
    matchStage.createdAt = {};
    if (filters.fromDate) matchStage.createdAt.$gte = new Date(filters.fromDate);
    if (filters.toDate) matchStage.createdAt.$lte = new Date(filters.toDate);
  }

  const sortStage: any = {};
  if (filters.sort) {
    const direction = filters.sort.startsWith("-") ? -1 : 1;
    const field = filters.sort.replace(/^-/, "");
    sortStage[field] = direction;
  } else {
    sortStage.createdAt = -1;
  }

  const page = filters.page || 1;
  const limit = filters.limit || 25;
  const skip = (page - 1) * limit;

  const pipeline = [
    { $match: matchStage },
    {
      $facet: {
        docs: [
          { $sort: sortStage },
          { $skip: skip },
          { $limit: limit },
          // Lookup User details
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              id: "$_id",
              _id: 1,
              userId: 1,
              userName: {
                $cond: {
                  if: "$user",
                  then: { $trim: { input: { $concat: ["$user.firstName", " ", "$user.lastName"] } } },
                  else: "System / Guest",
                },
              },
              userEmail: { $ifNull: ["$user.email", "N/A"] },
              module: 1,
              action: 1,
              entityType: 1,
              entityId: 1,
              createdAt: 1,
              ipAddress: 1,
              userAgent: 1,
            },
          },
        ],
        totalCount: [{ $count: "count" }],
        moduleCounts: [
          { $group: { _id: "$module", count: { $sum: 1 } } }
        ],
        actionCounts: [
          { $group: { _id: "$action", count: { $sum: 1 } } }
        ],
        userCounts: [
          { $group: { _id: "$userId", count: { $sum: 1 } } }
        ]
      },
    },
  ];

  const results = await AuditLog.aggregate(pipeline);
  const facetResult = results[0];

  const docs = facetResult.docs || [];
  const total = facetResult.totalCount[0]?.count || 0;

  const moduleBreakdown: Record<string, number> = {};
  facetResult.moduleCounts.forEach((m: any) => {
    if (m._id) moduleBreakdown[m._id] = m.count;
  });

  const actionBreakdown: Record<string, number> = {};
  facetResult.actionCounts.forEach((a: any) => {
    if (a._id) actionBreakdown[a._id] = a.count;
  });

  const userBreakdown: Record<string, number> = {};
  facetResult.userCounts.forEach((u: any) => {
    const key = u._id ? u._id.toString() : "system";
    userBreakdown[key] = u.count;
  });

  return {
    docs,
    total,
    summary: {
      totalCount: total,
      moduleBreakdown,
      actionBreakdown,
      userBreakdown,
    },
  };
}
