import { Request, Response } from "express";
import { portalAuthService } from "./portal-auth.service.js";
import { portalSessionService } from "./portal-session.service.js";
import { Client } from "../clients/schemas/client.schema.js";
import { Matter } from "../matters/schemas/matter.schema.js";
import { DocumentMeta } from "../documents/schemas/document.schema.js";
import { documentRepository } from "../documents/document.repository.js";
import { documentDownloadService } from "../documents/document-download.service.js";
import { InvoiceModel } from "../billing/schemas/invoice.schema.js";
import { invoicePdfService } from "../billing/invoice-pdf.service.js";
import { invoiceRepository as billingRepository } from "../billing/invoice.repository.js";
import { AppError } from "../../shared/app-error.js";
import { stripeService } from "../billing/stripe.service.js";

export const portalAuthController = {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const ipAddress = req.ip || "127.0.0.1";
    const userAgent = req.headers["user-agent"] || "unknown";

    const data = await portalAuthService.login(email, password, { ipAddress, userAgent });
    res.status(200).json({ success: true, ...data });
  },

  async logout(req: Request, res: Response) {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await portalAuthService.logout(refreshToken);
    }
    res.status(200).json({ success: true });
  },

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw AppError.badRequest("Refresh token is required.");
    }
    const ipAddress = req.ip || "127.0.0.1";
    const userAgent = req.headers["user-agent"] || "unknown";

    const data = await portalSessionService.refreshSession(refreshToken, { ipAddress, userAgent });
    res.status(200).json({ success: true, ...data });
  },

  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    await portalAuthService.forgotPassword(email);
    res.status(200).json({ success: true, message: "If the email exists, a reset link has been logged/sent." });
  },

  async resetPassword(req: Request, res: Response) {
    const { token, password } = req.body;
    await portalAuthService.resetPassword(token, password);
    res.status(200).json({ success: true, message: "Password updated successfully." });
  },

  // Portal User Data Endpoints
  async getProfile(req: Request, res: Response) {
    const { clientId, firmId } = req.portalUser as any;
    const client = await Client.findOne({ _id: clientId, firmId });
    if (!client) {
      throw AppError.notFound("Client profile not found.");
    }
    res.status(200).json({ success: true, data: client });
  },

  async updateProfile(req: Request, res: Response) {
    const { clientId, firmId } = req.portalUser as any;
    const { phone, address } = req.body;

    const updates: any = {};
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) {
      updates.address = {
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        postalCode: address.zipCode || address.postalCode || "",
        country: address.country || "",
      };
    }

    const client = await Client.findOneAndUpdate(
      { _id: clientId, firmId },
      { $set: updates },
      { new: true }
    );

    if (!client) {
      throw AppError.notFound("Client profile not found.");
    }

    console.log(`[AUDIT] Portal User Profile Updated: ClientID=${clientId}`);
    res.status(200).json({ success: true, data: client });
  },

  async getMatters(req: Request, res: Response) {
    const { clientId, firmId } = req.portalUser as any;
    const { search } = req.query;

    const query: any = {
      clientId,
      firmId,
      status: { $ne: "ARCHIVED" },
    };

    if (search) {
      query.title = { $regex: search as string, $options: "i" };
    }

    const matters = await Matter.find(query).populate("practiceAreaId", "name").exec();
    res.status(200).json({ success: true, data: matters });
  },

  async getMatterDetails(req: Request, res: Response) {
    const { clientId, firmId } = req.portalUser as any;
    const { id } = req.params;

    const matter = await Matter.findOne({
      _id: id,
      clientId,
      firmId,
      status: { $ne: "ARCHIVED" },
    }).populate("practiceAreaId", "name").exec();

    if (!matter) {
      throw AppError.notFound("Matter not found.");
    }

    res.status(200).json({ success: true, data: matter });
  },

  async getDocuments(req: Request, res: Response) {
    const { clientId, firmId } = req.portalUser as any;
    const { search } = req.query;

    const clientMatters = await Matter.find({
      clientId,
      firmId,
      status: { $ne: "ARCHIVED" },
    }).select("_id").exec();
    const clientMatterIds = clientMatters.map((m) => m._id);

    const query: any = {
      firmId,
      deleted: false,
      sharedWithPortal: true,
      $or: [
        { clientId },
        { matterId: { $in: clientMatterIds } },
      ],
    };

    if (search) {
      query.documentName = { $regex: search as string, $options: "i" };
    }

    const documents = await DocumentMeta.find(query)
      .populate("matterId", "title")
      .populate("clientId", "firstName lastName companyName")
      .exec();

    res.status(200).json({ success: true, data: documents });
  },

  async downloadDocument(req: Request, res: Response) {
    const { clientId, firmId } = req.portalUser as any;
    const { id } = req.params;

    const doc = await documentRepository.findById(id as string, firmId);
    if (!doc || !doc.sharedWithPortal) {
      throw AppError.notFound("Document not found.");
    }

    // Verify ownership or relationship
    const isOwner = doc.clientId?.toString() === clientId;
    let isLinkedToMatter = false;

    if (doc.matterId) {
      const matter = await Matter.findOne({
        _id: doc.matterId,
        clientId,
        firmId,
        status: { $ne: "ARCHIVED" },
      });
      if (matter) {
        isLinkedToMatter = true;
      }
    }

    if (!isOwner && !isLinkedToMatter) {
      throw AppError.forbidden("You do not have access to this document.");
    }

    const result = await documentDownloadService.getDownloadStream(firmId, id as string);

    console.log(`[AUDIT] Client Portal Document Downloaded: PortalUserId=${req.portalUser!.portalUserId}, DocumentID=${id}`);

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(result.fileName)}"`);
    res.setHeader("Content-Length", result.fileSize.toString());
    result.stream.pipe(res);
  },

  async getInvoices(req: Request, res: Response) {
    const { clientId, firmId } = req.portalUser as any;
    const { search } = req.query;

    const query: any = {
      clientId,
      firmId,
      status: { $ne: "DRAFT" },
    };

    if (search) {
      query.invoiceNumber = { $regex: search as string, $options: "i" };
    }

    const invoices = await InvoiceModel.find(query).sort({ createdAt: -1 }).exec();
    res.status(200).json({ success: true, data: invoices });
  },

  async downloadInvoicePDF(req: Request, res: Response) {
    const { clientId, firmId } = req.portalUser as any;
    const { id } = req.params;

    const invoice = await InvoiceModel.findOne({
      _id: id,
      clientId,
      firmId,
      status: { $ne: "DRAFT" },
    });

    if (!invoice) {
      throw AppError.notFound("Invoice not found.");
    }

    const items = await billingRepository.findItemsByInvoiceId(id as string);
    const pdfBuffer = await invoicePdfService.generateInvoicePdf(invoice, items);

    console.log(`[AUDIT] Client Portal Invoice PDF Downloaded: PortalUserId=${(req.portalUser as any).portalUserId}, InvoiceID=${id}`);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${invoice.invoiceNumber}.pdf"`);
    res.send(pdfBuffer);
  },

  async createCheckoutSession(req: Request, res: Response) {
    const { firmId } = req.portalUser as any;
    const { id } = req.params;

    const session = await stripeService.createCheckoutSession(firmId, id as string);
    res.status(200).json({ success: true, data: session });
  },
};
