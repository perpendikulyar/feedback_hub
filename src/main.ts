import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import * as config from 'config';

async function bootstrap() {
  const serverConfig = config.get('server');
  const logger = new Logger('bootstrap');
  const timezone = serverConfig.timezone;
  const port = process.env.PORT || serverConfig.port;

  process.env.TZ = timezone;

  const app = await NestFactory.create(AppModule);
  await app.listen(port);

  logger.log(`App running on port ${port}`);
}
bootstrap();
