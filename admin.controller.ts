import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats/global')
  async getGlobalStats() {
    return {
      totalWorkspaces: await this.adminService.countWorkspaces(),
      activeAutomationRuns: await this.adminService.getActiveJobs(),
      regulatoryDriftDetected: await this.adminService.getUnresolvedDrifts(),
    };
  }

  @Post('override/retry-job/:jobId')
  async retryFailedAutomation(@Param('jobId') jobId: string) {
    // Manually push a failed regulatory event back into the loop
    return await this.adminService.manualRetry(jobId);
  }
}