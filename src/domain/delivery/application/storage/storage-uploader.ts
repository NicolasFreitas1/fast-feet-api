export type UploadFileParams = {
  fileName: string
  fileType: string
  body: Buffer
}

export type UploadFileResult = {
  url: string
}

export abstract class StorageUploader {
  abstract upload(params: UploadFileParams): Promise<UploadFileResult>
}
