import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { ChangeUserPasswordUseCase } from '@/domain/delivery/application/use-cases/change-user-password'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { IsAdmin } from '@/infra/auth/is-admin.decorator'
import { IsAdminGuard } from '@/infra/auth/is-admin.guard'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import {
  ApiAdminAuth,
  ApiResourceNotFoundResponse,
  ApiUuidParam,
  ApiValidationErrorResponse,
} from '@/infra/http/swagger/swagger.decorators'
import { ChangePasswordRequestDto } from '@/infra/http/swagger/swagger.models'
import { z } from 'zod'

const changePasswordBodySchema = z.object({
  newPassword: z.string().min(6),
})

type ChangePasswordBodySchema = z.infer<typeof changePasswordBodySchema>

@Controller('auth/users/:userId/password')
@UseGuards(IsAdminGuard)
@ApiTags('Auth')
export class ChangeUserPasswordController {
  constructor(private changeUserPassword: ChangeUserPasswordUseCase) {}

  @Patch()
  @IsAdmin()
  @HttpCode(204)
  @ApiOperation({ summary: 'Change a user password' })
  @ApiAdminAuth()
  @ApiUuidParam('userId', 'User identifier.')
  @ApiBody({ type: ChangePasswordRequestDto })
  @ApiNoContentResponse({ description: 'Password changed successfully.' })
  @ApiValidationErrorResponse()
  @ApiResourceNotFoundResponse('User not found.')
  async handle(
    @Param('userId') userId: string,
    @Body(new ZodValidationPipe(changePasswordBodySchema))
    body: ChangePasswordBodySchema,
  ) {
    const result = await this.changeUserPassword.execute({
      userId,
      newPassword: body.newPassword,
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException('User not found')
        default:
          throw new BadRequestException()
      }
    }
  }
}
