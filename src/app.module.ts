import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // доступен во всех модулях без повторного импорта
      envFilePath: '.env', // можно указать массив путей
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
