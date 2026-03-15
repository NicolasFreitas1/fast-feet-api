import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
} from '@nestjs/common'
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { AuthenticateUseCase } from '@/domain/delivery/application/use-cases/authenticate'
import { InvalidCredentialsError } from '@/domain/delivery/application/use-cases/errors/invalid-credentials-error'
import { Public } from '@/infra/auth/public'
import { AuthPresenter } from '@/infra/http/presenters/auth-presenter'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { ApiValidationErrorResponse } from '@/infra/http/swagger/swagger.decorators'
import {
  ErrorResponseDto,
  LoginRequestDto,
  LoginResponseDto,
} from '@/infra/http/swagger/swagger.models'
import { z } from 'zod'

const authenticateBodySchema = z.object({
  cpf: z.string().min(1),
  password: z.string().min(1),
})

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@Public()
@Controller('auth')
@ApiTags('Auth')
export class AuthenticateController {
  constructor(private authenticate: AuthenticateUseCase) {}

  @Post('login')
  @ApiOperation({ summary: 'Authenticate an admin or deliveryman' })
  @ApiBody({ type: LoginRequestDto })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiValidationErrorResponse()
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials.',
    type: ErrorResponseDto,
  })
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
