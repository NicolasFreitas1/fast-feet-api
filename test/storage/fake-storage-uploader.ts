import {
  StorageUploader,
  UploadFileParams,
  UploadFileResult,
} from '@/domain/delivery/application/storage/storage-uploader'

export class FakeStorageUploader implements StorageUploader {
  public uploads: UploadFileParams[] = []

  async upload(params: UploadFileParams): Promise<UploadFileResult> {
    this.uploads.push(params)

    return {
      url: `https://storage.test/${params.fileName}`,
    }
  }
}
