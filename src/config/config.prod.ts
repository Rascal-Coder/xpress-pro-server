import { MidwayConfig } from '@midwayjs/core';
import * as redisStore from 'cache-manager-ioredis';
import { env } from 'process';

import { TokenConfig } from '@/interface/token.config';
import { MailConfig, MinioConfig } from '@/interface';
import typeormConfig from './typeorm.prod';
import { EverythingSubscriber } from '@/typeorm-event-subscriber';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1767507947430_3851',
  koa: {
    port: 7001,
    globalPrefix: '/api',
  },
  typeorm: typeormConfig.typeorm,
  redis: {
    client: {
      port: 6379, // Redis port
      host: env.REDIS_HOST || 'localhost', // Redis host
      password: env.REDIS_PASSWORD || '123456',
      db: 0,
    },
  },
  i18n: {
    localeTable: {
      en_US: require('../locales/en_US'),
      zh_CN: require('../locales/zh_CN'),
    },
    defaultLocale: 'zh_CN',
  },
  validate: {
    validationOptions: {
      allowUnknown: true,
    },
  },
  token: {
    expire: 60 * 60 * 2, // 2小时
    refreshExpire: 60 * 60 * 24 * 7, // 7天
  } as TokenConfig,
  cache: {
    store: redisStore,
    options: {
      port: 6379, // default value
      host: env.REDIS_HOST || 'localhost', // Redis host
      password: env.REDIS_PASSWORD || '123456',
      db: 0,
      keyPrefix: 'cache:',
      ttl: 100,
    },
  },
  captcha: {
    default: {
      size: 4,
      noise: 1,
      width: 120,
      height: 40,
    },
    image: {
      type: 'mixed',
    },
    formula: {},
    text: {},
    expirationTime: 3600,
    idPrefix: 'captcha',
  },
  minio: {
    endPoint: 'localhost',
    port: 9001,
    useSSL: false,
    accessKey: 'minio',
    secretKey: 'minio@123',
    bucketName: 'xpress-minio',
  } as MinioConfig,
  bull: {
    defaultQueueOptions: {
      redis: {
        port: 6379,
        host: env.REDIS_HOST || 'localhost',
        password: env.REDIS_PASSWORD || '123456',
      },
    },
  },
  mail: {
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    auth: {
      user: env.MAIL_USER,
      pass: env.MAIL_PASS,
    },
  } as MailConfig,
  subscribers: [EverythingSubscriber],
} as MidwayConfig;
