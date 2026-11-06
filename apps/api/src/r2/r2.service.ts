import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';

@Injectable()
export class R2Service {
  private readonly client: S3Client | null = null;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    const accountId = config.get<string>('R2_ACCOUNT_ID');
    const accessKey = config.get<string>('R2_ACCESS_KEY_ID');
    const secretKey = config.get<string>('R2_SECRET_ACCESS_KEY');
    this.bucket = config.get<string>('R2_BUCKET', 'posha-avatars');
    this.publicUrl = (config.get<string>('R2_PUBLIC_URL', '') || '').replace(/\/$/, '');

    if (accountId && accessKey && secretKey) {
      this.client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
        requestChecksumCalculation: 'WHEN_REQUIRED',
        responseChecksumValidation: 'WHEN_REQUIRED',
      } as any);
    }
  }

  async getSignedImageUrl(key: string): Promise<string> {
    if (this.publicUrl) return `${this.publicUrl}/${key.replace(/^\//, '')}`;
    if (!this.client) throw new Error('R2 not configured');
    const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, cmd, { expiresIn: 3600 });
  }

  ownsCreatorImageKey(userId: string, key: string, kind?: 'avatar' | 'cover'): boolean {
    const prefixes = kind
      ? [`creator/${userId}/${kind}/`, ...(kind === 'avatar' ? [`avatars/${userId}/`] : [])]
      : [`creator/${userId}/`, `avatars/${userId}/`];
    return prefixes.some(prefix => key.startsWith(prefix));
  }

  async presignAvatar(userId: string, contentType: string): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
    if (!this.client) throw new Error('R2 not configured');
    const ext = contentType.includes('png') ? 'png' : 'jpg';
    const key = `creator/${userId}/avatar/${randomUUID()}.${ext}`;
    const cmd = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType });
    const uploadUrl = await getSignedUrl(this.client, cmd, { expiresIn: 900 });
    return { uploadUrl, key, publicUrl: this.publicUrl ? `${this.publicUrl}/${key}` : '' };
  }

  async presignCover(userId: string, contentType: string): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
    if (!this.client) throw new Error('R2 not configured');
    const ext = contentType.includes('png') ? 'png' : 'jpg';
    const key = `creator/${userId}/cover/${randomUUID()}.${ext}`;
    const cmd = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType });
    const uploadUrl = await getSignedUrl(this.client, cmd, { expiresIn: 900 });
    return { uploadUrl, key, publicUrl: this.publicUrl ? `${this.publicUrl}/${key}` : '' };
  }

  async presignCreatorImage(
    userId: string,
    kind: 'avatar' | 'cover',
    contentType: string,
  ): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
    return kind === 'avatar'
      ? this.presignAvatar(userId, contentType)
      : this.presignCover(userId, contentType);
  }

}
