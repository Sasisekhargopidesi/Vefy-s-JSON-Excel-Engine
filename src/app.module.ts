import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JsonToExcelModule } from './json-to-excel/json-to-excel.module';

@Module({
  imports: [
    // 🔹 Serve frontend HTML from /public
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),

    // 🔹 Existing JSON → Excel module (UNCHANGED)
    JsonToExcelModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
