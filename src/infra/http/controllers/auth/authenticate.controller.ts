import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
} from '@nestjs/common'
import { AuthenticateUseCase } from '@/domain/delivery/application/use-cases/authenticate'
import { InvalidCredentialsError } from '@/domain/delivery/application/use-cases/errors/invalid-credentials-error'
import { Public } from '@/infra/auth/public'
import { AuthPresenter } from '@/infra/http/presenters/auth-presenter'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'

const authenticateBodySchema = z.object({
  cpf: z.string().min(1),
  password: z.string().min(1),
})

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@Public()
@Controller('auth')
export class AuthenticateController {
  constructor(private authenticate: AuthenticateUseCase) {}

  @Post('login')
  async handle(
    @Body(new ZodValidationPipe(authenticateBodySchema))
    body: AuthenticateBodySchema,
  ) {
    const result = await this.authenticate.execute({
      cpf: body.cpf,
      password: body.password,
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case InvalidCredentialsError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException()
      }
    }

    return AuthPresenter.loginToHTTP(
      result.value.accessToken,
      result.value.userRole,
    )
  }
}
