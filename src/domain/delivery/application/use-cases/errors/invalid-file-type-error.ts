export class InvalidFileTypeError extends Error {
  constructor() {
    super('File type is not supported')
  }
}
