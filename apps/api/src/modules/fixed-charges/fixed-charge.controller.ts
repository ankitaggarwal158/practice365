import { Request, Response, NextFunction } from "express";
import { fixedChargeService } from "./fixed-charge.service.js";
import { sendSuccess, sendPaginatedSuccess } from "../../shared/api-response.js";
import { AppError } from "../../shared/app-error.js";
import * as userService from "../users/service/user.service.js";

async function getRequestingUserFirmId(req: Request): Promise<string> {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  const user = await userService.getCurrentUser(req.user.userId);
  return user.firmId;
}

export class FixedChargeController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getRequestingUserFirmId(req);
      const record = await fixedChargeService.createFixedCharge(firmId, req.user!.userId, req.body);
      sendSuccess(res, record, 201);
    } catch (err) {
      next(err);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getRequestingUserFirmId(req);
      const record = await fixedChargeService.getFixedCharge(req.params.id as string, firmId);
      sendSuccess(res, record);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getRequestingUserFirmId(req);
      const record = await fixedChargeService.updateFixedCharge(req.params.id as string, firmId, req.body);
      sendSuccess(res, record);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getRequestingUserFirmId(req);
      await fixedChargeService.deleteFixedCharge(req.params.id as string, firmId, req.user!.userId);
      sendSuccess(res, { success: true });
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getRequestingUserFirmId(req);
      const filters = req.query as any;
      const result = await fixedChargeService.listFixedCharges(firmId, filters);
      sendPaginatedSuccess(res, result.data, {
        total: result.total,
        page: filters.page || 1,
        limit: filters.limit || 50,
        pages: result.pages,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const fixedChargeController = new FixedChargeController();
