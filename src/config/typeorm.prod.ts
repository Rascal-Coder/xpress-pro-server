import { env } from 'process';

export default {
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: env.DB_HOST || 'localhost', // 数据库ip地址，本地就写localhost
        port: 3306,
        username: env.DB_USERNAME || 'root',
        password: env.DB_PASSWORD || '123456',
        database: 'xpress_rolldown_db', // 数据库名称
        synchronize: false,
        logging: false,
        // 扫描entity文件夹
        entities: ['**/entity/*{.ts,.js}'],
        timezone: '+00:00',
        migrations: ['**/migration/*.ts'],
        cli: {
          migrationsDir: 'migration',
        },
      },
    },
  },
};
