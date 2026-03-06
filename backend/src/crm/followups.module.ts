import { Module } from '@nestjs/common';
import { FollowUpsService } from './followups.service';

@Module({
  providers: [FollowUpsService],
  exports: [FollowUpsService],
})
export class FollowUpsModule {}
