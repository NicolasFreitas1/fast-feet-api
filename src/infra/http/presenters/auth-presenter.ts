export interface LoginResponse {
  accessToken: string
  userRole: 'ADMIN' | 'DELIVERYMAN'
}

export class AuthPresenter {
  static loginToHTTP(
    accessToken: string,
    userRole: 'ADMIN' | 'DELIVERYMAN',
  ): LoginResponse {
    return {
      accessToken,
      userRole,
    }
  }
}
