import { Request, Response, NextFunction } from "express";
import { timeEntryService } from "./time-entry.service.js";
import { timerService } from "./timer.service.js";
import * as userService from "../users/service/user.service.js";

async function getFirmId(req: Request): Promise<string> {
  if (!req.user) throw new Error("Unauthorized");
  const user = await userService.getCurrentUser(req.user.userId);
  return user.firmId.toString();
}

export const timeEntryController = {
  // Manual Entries
  async createManualEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getFirmId(req);
      const result = await timeEntryService.createManualEntry(firmId, req.user!.userId, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async updateEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getFirmId(req);
      const result = await timeEntryService.updateEntry(req.params.id as string, firmId, req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async deleteEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getFirmId(req);
      await timeEntryService.deleteEntry(req.params.id as string, firmId);
      res.json({ success: true, message: "Time entry deleted" });
    } catch (error) {
      next(error);
    }
  },

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getFirmId(req);
      const filters = { ...req.query, firmId };
      const { data, total } = await timeEntryService.search(filters);
      res.json({ 
        success: true, 
        data, 
        pagination: { 
          total, 
          page: Number(req.query.page) || 1, 
          limit: Number(req.query.limit) || 50,
          pages: Math.ceil(total / (Number(req.query.limit) || 50)) 
        } 
      });
    } catch (error) {
      next(error);
    }
  },

  // Timer Actions
  async startTimer(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getFirmId(req);
      const result = await timerService.startTimer(firmId, req.user!.userId, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async pauseTimer(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getFirmId(req);
      const result = await timerService.pauseTimer(firmId, req.user!.userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async resumeTimer(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getFirmId(req);
      const result = await timerService.resumeTimer(firmId, req.user!.userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async stopTimer(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getFirmId(req);
      const result = await timerService.stopTimer(firmId, req.user!.userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getActiveTimer(req: Request, res: Response, next: NextFunction) {
    try {
      const firmId = await getFirmId(req);
      const result = await timerService.getActiveTimer(firmId, req.user!.userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
};
