import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { Injectable } from '@nestjs/common'
import {
  StorageUploader,
  UploadFileParams,
  UploadFileResult,
} from '@/domain/delivery/application/storage/storage-uploader'
import { EnvService } from '@/infra/env/env.service'

@Injectable()
export class LocalStorageUploader implements StorageUploader {
  constructor(private env: EnvService) {}

  async upload({
    fileName,
    body,
  }: UploadFileParams): Promise<UploadFileResult> {
    const uploadsDir = this.env.get('STORAGE_LOCAL_DIR')
    const fileExtension = extname(fileName) || '.bin'
    const generatedFileName = `${randomUUID()}${fileExtension}`

    await mkdir(uploadsDir, { recursive: true })
    await writeFile(join(uploadsDir, generatedFileName), body)

    const baseUrl = this.env.get('STORAGE_LOCAL_BASE_URL').replace(/\/$/, '')

    return {
      url: `${baseUrl}/${generatedFileName}`,
    }
  }
}
