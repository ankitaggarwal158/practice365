import { Request, Response, NextFunction } from "express";
import { invoiceService } from "./invoice.service.js";
import { paymentService } from "./payment.service.js";
import { invoicePdfService } from "./invoice-pdf.service.js";
import * as userService from "../users/service/user.service.js";

async function getFirmId(req: Request): Promise<string> {
  if (!req.user) throw new Error("Unauthorized");
  const user = await userService.getCurrentUser(req.user.userId);
  return user.firmId.toString();
}

export const invoiceController = {
  async createDraft(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getFirmId(req);
      const result = await invoiceService.createDraftInvoice(firmId, req.user!.userId, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getInvoiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getFirmId(req);
      const result = await invoiceService.getInvoiceDetails(firmId, req.params.id as string);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async updateDraft(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getFirmId(req);
      const result = await invoiceService.updateDraftInvoice(firmId, req.params.id as string, req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async deleteDraft(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getFirmId(req);
      await invoiceService.deleteDraftInvoice(firmId, req.params.id as string, req.user!.userId);
      res.json({ success: true, message: "Invoice draft deleted" });
    } catch (error) {
      next(error);
    }
  },

  async issueInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getFirmId(req);
      const result = await invoiceService.issueInvoice(firmId, req.params.id as string);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async cancelInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getFirmId(req);
      const result = await invoiceService.cancelInvoice(firmId, req.params.id as string);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async recordPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getFirmId(req);
      const result = await paymentService.recordPayment(firmId, req.params.id as string, req.user!.userId, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getInvoicePayments(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getFirmId(req);
      const result = await paymentService.getPaymentsForInvoice(req.params.id as string, firmId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async downloadPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getFirmId(req);
      const details = await invoiceService.getInvoiceDetails(firmId, req.params.id as string);
      const pdfBuffer = await invoicePdfService.generateInvoicePdf(details, details.items);
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${details.invoiceNumber}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  },

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getFirmId(req);
      const filters = { ...req.query, firmId };
      const { data, total } = await invoiceService.search(filters);
      res.json({
        success: true,
        data,
        pagination: {
          total,
          page: Number(req.query.page) || 1,
          limit: Number(req.query.limit) || 50,
          pages: Math.ceil(total / (Number(req.query.limit) || 50)),
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
