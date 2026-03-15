import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { StorageUploader, UploadFileResult } from '../storage/storage-uploader'
import { FileTooLargeError } from './errors/file-too-large-error'
import { InvalidFileTypeError } from './errors/invalid-file-type-error'

const MAX_FILE_SIZE_IN_BYTES = 5 * 1024 * 1024
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

interface UploadProofOfDeliveryUseCaseRequest {
  fileName: string
  fileType: string
  size: number
  body: Buffer
}

type UploadProofOfDeliveryUseCaseResponse = Either<
  InvalidFileTypeError | FileTooLargeError,
  UploadFileResult
>

@Injectable()
export class UploadProofOfDeliveryUseCase {
  constructor(private storageUploader: StorageUploader) {}

  async execute({
    fileName,
    fileType,
    size,
    body,
  }: UploadProofOfDeliveryUseCaseRequest): Promise<UploadProofOfDeliveryUseCaseResponse> {
    if (
      !ALLOWED_FILE_TYPES.includes(
        fileType as (typeof ALLOWED_FILE_TYPES)[number],
      )
    ) {
      return left(new InvalidFileTypeError())
    }

    if (size > MAX_FILE_SIZE_IN_BYTES) {
      return left(new FileTooLargeError())
    }

    const upload = await this.storageUploader.upload({
      fileName,
      fileType,
      body,
    })

    return right(upload)
  }
}
