import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, IsUrl, Min } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ description: 'Уникальное название комнаты' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Вместимость комнаты' })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiPropertyOptional({ description: 'URL фото комнаты', format: 'url' })
  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @ApiPropertyOptional({
    description: 'JSON с описанием оборудования',
    type: 'object',
    example: { projector: true, whiteboard: true },
  })
  @IsOptional()
  equipment?: object;
}

export class UpdateRoomDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @IsOptional()
  equipment?: object;
}
