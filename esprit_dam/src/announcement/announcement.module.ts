import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnnouncementController } from './announcement.controller';
import { AnnouncementService } from './announcement.service';
import { GradioAiService } from './services/gradio-ai.service';
import { Announcement, AnnouncementSchema } from './schemas/announcement.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Announcement.name, schema: AnnouncementSchema },
    ]),
  ],
  controllers: [AnnouncementController],
  providers: [AnnouncementService, GradioAiService],
  exports: [AnnouncementService, GradioAiService],
})
export class AnnouncementModule {}
