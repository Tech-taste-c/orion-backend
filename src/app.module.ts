import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { StudentsModule } from './students/students.module';
import { PrismaModule } from './prisma/prisma.module';
import { AdminsModule } from './admins/admins.module';

@Module({
  imports: [StudentsModule, PrismaModule, AdminsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
