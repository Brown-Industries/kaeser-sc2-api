import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { useContainer } from 'class-validator';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  /* KAESER-SC2-API VERSION */
  /* ************************** */
  /* ************************** */
  const version = '0.2.0';
  /* ************************** */
  /* ************************** */

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  //TODO Consider if this is needed or a good idea long term.
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  app.setGlobalPrefix('api');
  // app.useGlobalFilters(new DuplicateKeyExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  app.enableCors();

  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI,
  });

  let title = 'Kaeser Sigma Control 2 API';
  if (process.env.ENV_NAME) {
    title = 'Kaeser Sigma Control 2 API';
  }

  const config = new DocumentBuilder()
    .setTitle(title)
    .setDescription(`Kaeser Sigma Control 2 API`)
    .setLicense('GPL-3.0', 'https://www.gnu.org/licenses/gpl-3.0.en.html')
    .setVersion(version)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(3004);
}
bootstrap();
