import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'strongPassword123' })
  password: string;

  @ApiProperty({ example: 'John Doe', required: false })
  name?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'strongPassword123' })
  password: string;
}
export class ConfirmDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: '123456' })
  code: string;
}
