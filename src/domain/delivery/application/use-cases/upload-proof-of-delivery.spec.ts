import { FakeStorageUploader } from 'test/storage/fake-storage-uploader'
import { UploadProofOfDeliveryUseCase } from './upload-proof-of-delivery'
import { InvalidFileTypeError } from './errors/invalid-file-type-error'
import { FileTooLargeError } from './errors/file-too-large-error'

let fakeStorageUploader: FakeStorageUploader
let sut: UploadProofOfDeliveryUseCase

describe('Upload Proof Of Delivery', () => {
  beforeEach(() => {
    fakeStorageUploader = new FakeStorageUploader()
    sut = new UploadProofOfDeliveryUseCase(fakeStorageUploader)
  })

  it('should upload a valid proof of delivery file', async () => {
    const result = await sut.execute({
      fileName: 'proof.jpg',
      fileType: 'image/jpeg',
      size: 1024,
      body: Buffer.from('proof'),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.url).toBe('https://storage.test/proof.jpg')
    }
    expect(fakeStorageUploader.uploads).toHaveLength(1)
  })

  it('should reject unsupported file types', async () => {
    const result = await sut.execute({
      fileName: 'proof.pdf',
      fileType: 'application/pdf',
      size: 1024,
      body: Buffer.from('proof'),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidFileTypeError)
    expect(fakeStorageUploader.uploads).toHaveLength(0)
  })

  it('should reject files larger than 5mb', async () => {
    const result = await sut.execute({
      fileName: 'proof.jpg',
      fileType: 'image/jpeg',
      size: 5 * 1024 * 1024 + 1,
      body: Buffer.from('proof'),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(FileTooLargeError)
    expect(fakeStorageUploader.uploads).toHaveLength(0)
  })
})
