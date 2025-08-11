import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsDate, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BookingDto {
  @ApiProperty({
    description: 'ID пользователя, делающего бронирование',
    example: 1,
  })
  @IsNumber()
  userId: number;

  @ApiProperty({ description: 'ID комнаты для бронирования', example: 2 })
  @IsNumber()
  roomId: number;

  @ApiProperty({
    description: 'Время начала бронирования',
    example: '2025-08-11T10:00:00Z',
    type: String,
    format: 'date-time',
  })
  @IsDate()
  @Type(() => Date)
  startTs: Date;

  @ApiProperty({
    description: 'Время окончания бронирования',
    example: '2025-08-11T11:00:00Z',
    type: String,
    format: 'date-time',
  })
  @IsDate()
  @Type(() => Date)
  endTs: Date;

  @ApiPropertyOptional({
    description: 'Дополнительные метаданные в формате JSON',
    example: { projector: true, notes: 'Требуется микрофон' },
  })
  @IsOptional()
  metadata?: object;
}
