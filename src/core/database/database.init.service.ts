import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { Logger } from 'nestjs-pino';

@Injectable()
export class DatabaseInitService implements OnModuleInit {
  constructor(
    @InjectDataSource()
    private readonly connection: DataSource,
    private readonly logger: Logger,
  ) {}

  async onModuleInit() {
    const appRoot = process.cwd();
    const ddlDir = path.join(appRoot, 'ddl');
    const sqlFiles = fs.readdirSync(ddlDir);
    const dbName = process.env.DB_NAME || null;

    if (!dbName) {
      this.logger.error('DB_NAME environment variable not set.');
      return;
    }

    for (const file of sqlFiles) {
      if (path.extname(file) === '.sql') {
        let sqlContent = fs.readFileSync(path.join(ddlDir, file), 'utf8');
        sqlContent = sqlContent.replace(
          'USE [DB_NAME_HERE]',
          `USE [${dbName}]`,
        );

        const sqlCommands = sqlContent
          .split('GO')
          .map((cmd) => cmd.trim())
          .filter((cmd) => cmd);

        for (const sqlCommand of sqlCommands) {
          try {
            await this.connection.query(sqlCommand);
          } catch (error) {
            this.logger.error(
              `Error executing part of SQL file: ${file}`,
              error,
            );
          }
        }
        this.logger.log(`Executed SQL file: ${file}`);
      }
    }
  }
}
