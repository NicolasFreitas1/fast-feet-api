export class FileTooLargeError extends Error {
  constructor() {
    super('File exceeds the maximum allowed size')
  }
}
