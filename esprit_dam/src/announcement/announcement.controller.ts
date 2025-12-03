import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnnouncementService } from './announcement.service';
import { GenerateAnnouncementDto } from './dto/generate-announcement.dto';
import { Announcement } from './schemas/announcement.schema';
import { AnnouncementVariation } from './services/gradio-ai.service';

@ApiTags('Announcements')
@Controller('announcements')
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate 3 announcement variations using AI (without saving)' })
  @ApiResponse({ status: 201, description: 'Announcements generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 503, description: 'Gradio service unavailable' })
  async generateAnnouncement(
    @Body() generateAnnouncementDto: GenerateAnnouncementDto,
  ): Promise<{ announcements: AnnouncementVariation[] }> {
    const { audience, instruction } = generateAnnouncementDto;
    const announcements = await this.announcementService['gradioAiService'].generateAnnouncements(
      audience,
      instruction,
    );
    return { announcements };
  }

  @Post('generate-and-save')
  @ApiOperation({ summary: 'Generate 3 AI announcements and save to database' })
  @ApiResponse({ status: 201, description: 'Successfully generated and saved 3 announcements' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 503, description: 'Gradio service unavailable' })
  async generateAndSave(
    @Body() generateAnnouncementDto: GenerateAnnouncementDto & { senderId: string },
  ): Promise<{ announcements: Announcement[] }> {
    const { audience, instruction, senderId } = generateAnnouncementDto;
    const announcements = await this.announcementService.generateAndSave(
      audience,
      instruction,
      senderId,
    );
    return { announcements };
  }

  @Get()
  @ApiOperation({ summary: 'Get all announcements' })
  @ApiResponse({ status: 200, description: 'List of all announcements' })
  async findAll(): Promise<{ announcements: Announcement[] }> {
    const announcements = await this.announcementService.findAll();
    return { announcements };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get announcement by ID' })
  @ApiResponse({ status: 200, description: 'Announcement found' })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  async findOne(@Param('id') id: string): Promise<{ announcement: Announcement }> {
    const announcement = await this.announcementService.findOne(id);
    return { announcement };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete announcement by ID' })
  @ApiResponse({ status: 200, description: 'Announcement deleted successfully' })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.announcementService.remove(id);
  }
}
