/**
 * @description User-Service parameters
 */
export interface IUserOptions {
  uid: number;
}

export interface MinioConfig {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucketName: string;
}
