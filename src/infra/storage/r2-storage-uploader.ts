import { randomUUID } from 'node:crypto'
import { extname } from 'node:path'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'
import {
  StorageUploader,
  UploadFileParams,
  UploadFileResult,
} from '@/domain/delivery/application/storage/storage-uploader'
import { EnvService } from '@/infra/env/env.service'

@Injectable()
export class R2StorageUploader implements StorageUploader {
  private client: S3Client

  constructor(private env: EnvService) {
    const endpoint =
      this.env.get('AWS_ENDPOINT_URL') ||
      `https://${this.env.get(
        'CLOUDFLARE_ACCOUNT_ID',
      )}.r2.cloudflarestorage.com`

    this.client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: this.env.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.env.get('AWS_SECRET_ACCESS_KEY'),
      },
    })
  }

  async upload({
    fileName,
    fileType,
    body,
  }: UploadFileParams): Promise<UploadFileResult> {
    const fileExtension = extname(fileName) || '.bin'
    const objectKey = `proofs/${randomUUID()}${fileExtension}`

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.env.get('AWS_BUCKET_NAME'),
        Key: objectKey,
        Body: body,
        ContentType: fileType,
      }),
    )

    const baseUrl = this.env.get('UPLOAD_PUBLIC_BASE_URL').replace(/\/$/, '')

    return {
      url: `${baseUrl}/${objectKey}`,
    }
  }
}
