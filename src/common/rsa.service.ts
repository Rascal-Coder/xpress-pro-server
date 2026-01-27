import { Inject, Provide, Singleton } from '@midwayjs/core';
import { RedisService } from '@midwayjs/redis';
import { R } from './base.error.util';
import * as crypto from 'crypto';
import { PublicKeyVO } from '@/module/system/auth/vo/publickey';
@Provide()
@Singleton()
export class RSAService {
  @Inject()
  redisService: RedisService;

  async getPublicKey(): Promise<PublicKeyVO> {
    // 使用 Node.js 内置 crypto 生成 RSA 密钥对
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });
    await this.redisService.set(`publicKey:${publicKey}`, privateKey);
    return {
      publicKey,
    };
  }

  async decrypt(publicKey: string, data: string): Promise<string> {
    const privateKey = await this.redisService.get(`publicKey:${publicKey}`);

    await this.redisService.del(`publicKey:${publicKey}`);

    if (!privateKey) {
      throw R.error('解密私钥错误或已失效');
    }

    const res = crypto
      .privateDecrypt(
        {
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        Buffer.from(data, 'base64')
      )
      .toString('utf8');
    return res;
  }
}
