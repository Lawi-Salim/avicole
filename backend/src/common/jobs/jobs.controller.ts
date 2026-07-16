import { Controller, Inject, Post, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { VerificationsJob } from './verifications.job.js';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  private readonly logger = new Logger(JobsController.name);

  constructor(@Inject(VerificationsJob) private readonly verificationsJob: VerificationsJob) {}

  @Post('verifications/run')
  async runVerifications() {
    this.logger.log('Déclenchement manuel des vérifications');
    const result = await this.verificationsJob.runAllChecks();
    return {
      message: 'Vérifications exécutées avec succès',
      result,
    };
  }
}
