import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { StudentsModule } from './students/students.module';
import { PrismaModule } from './prisma/prisma.module';
import { AdminsModule } from './admins/admins.module';
import { CoursesModule } from './courses/courses.module';
import { StudentCourseModule } from './student-course/student-course.module';
import { ExamsModule } from './exams/exams.module';
import { CertificatesModule } from './certificates/certificates.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    StudentsModule,
    PrismaModule,
    AdminsModule,
    CoursesModule,
    StudentCourseModule,
    ExamsModule,
    CertificatesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
