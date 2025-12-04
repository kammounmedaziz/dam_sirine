import { ApiProperty } from '@nestjs/swagger';

export class ChatSummaryResponseDto {
  @ApiProperty({
    description: 'Brief summary of the conversation',
    example: 'David provides a project status update, mentioning draft completion and remaining tasks.',
  })
  summary: string;

  @ApiProperty({
    description: 'Key points extracted from the conversation',
    type: [String],
    example: [
      'Draft report completed yesterday',
      'Charts and summary section still need to be added',
      'Plans to send completed version by end of today',
    ],
  })
  key_points: string[];

  @ApiProperty({
    description: 'Number of messages that were summarized',
    example: 5,
  })
  messageCount: number;

  @ApiProperty({
    description: 'Timestamp when the summary was generated',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp: Date;
}
