import {
  BadRequestException,
  Controller,
  ForbiddenException,
  UploadedFile,
  NotFoundException,
  Param,
  Patch,
  UnsupportedMediaTypeException,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { DeliverOrderUseCase } from '@/domain/delivery/application/use-cases/deliver-order'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { FileTooLargeError } from '@/domain/delivery/application/use-cases/errors/file-too-large-error'
import { InvalidFileTypeError } from '@/domain/delivery/application/use-cases/errors/invalid-file-type-error'
import { UploadProofOfDeliveryUseCase } from '@/domain/delivery/application/use-cases/upload-proof-of-delivery'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { OrderPresenter } from '@/infra/http/presenters/order-presenter'

@Controller('orders/:id')
export class DeliverOrderController {
  constructor(
    private uploadProofOfDelivery: UploadProofOfDeliveryUseCase,
    private deliverOrder: DeliverOrderUseCase,
  ) {}

  @Patch('deliver')
  @UseInterceptors(FileInterceptor('file'))
  async handle(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: UserPayload,
  ) {
    if (user.userRole !== 'DELIVERYMAN') {
      throw new ForbiddenException('Only deliverymen can deliver orders')
    }

    if (!file) {
      throw new BadRequestException('Delivery proof file is required')
    }

    const uploadResult = await this.uploadProofOfDelivery.execute({
      fileName: file.originalname,
      fileType: file.mimetype,
      size: file.size,
      body: file.buffer,
    })

    if (uploadResult.isLeft()) {
      const error = uploadResult.value

      switch (error.constructor) {
        case InvalidFileTypeError:
          throw new UnsupportedMediaTypeException(error.message)
        case FileTooLargeError:
          throw new BadRequestException(error.message)
        default:
          throw new BadRequestException()
      }
    }

    const result = await this.deliverOrder.execute({
      orderId: id,
      deliverymanId: user.sub,
      deliveryPhotoUrl: uploadResult.value.url,
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException('Order not found')
        case NotAllowedError:
          throw new ForbiddenException(
            'Only the assigned deliveryman can deliver this order',
          )
        default:
          throw new BadRequestException()
      }
    }

    return OrderPresenter.toHTTP(result.value.order)
  }
}
