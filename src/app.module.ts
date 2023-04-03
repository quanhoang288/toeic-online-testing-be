import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
// import { BlogModule } from './modules/blog/blog.module';
import { UserModule } from './modules/user/user.module';
import { SharedModule } from './shared/shared.module';
// import { default as config } from './config';

@Module({
  imports: [
    AuthModule,
    UserModule,
    SharedModule,
    // ConfigModule.forRoot({
    //   isGlobal: true,
    //   envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    //   load: [Object.values(config)],
    // }),
  ],
})
export class AppModule {}
