import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number

  @ApiProperty({
    example: 'Bad Request',
    description: 'Error summary or validation message.',
  })
  message!: string

  @ApiProperty({
    example: 'Bad Request',
    description: 'HTTP error label or structured validation payload.',
  })
  error!: string | Record<string, unknown>
}

export class LoginRequestDto {
  @ApiProperty({ example: '11111111111' })
  cpf!: string

  @ApiProperty({ example: '123456' })
  password!: string
}

export class LoginResponseDto {
  @ApiProperty()
  accessToken!: string

  @ApiProperty({ enum: ['ADMIN', 'DELIVERYMAN'] })
  userRole!: 'ADMIN' | 'DELIVERYMAN'
}

export class ChangePasswordRequestDto {
  @ApiProperty({ minLength: 6, example: '654321' })
  newPassword!: string
}

export class PaginationQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1, example: 1 })
  page?: number

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20, example: 20 })
  perPage?: number
}

export class NearbyOrdersQueryDto extends PaginationQueryDto {
  @ApiProperty({ example: -23.55052 })
  latitude!: number

  @ApiProperty({ example: -46.633308 })
  longitude!: number
}

export class CreateDeliverymanRequestDto {
  @ApiProperty({ example: 'John Doe' })
  name!: string

  @ApiProperty({ maxLength: 14, example: '22222222222' })
  cpf!: string

  @ApiProperty({ minLength: 6, example: '123456' })
  password!: string
}

export class EditDeliverymanRequestDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  name?: string
}

export class CreateRecipientRequestDto {
  @ApiProperty({ example: 'Jane Recipient' })
  name!: string

  @ApiProperty({ example: 'Avenida Paulista, 1000' })
  address!: string

  @ApiProperty({ maxLength: 10, example: '1199999999' })
  phone!: string

  @ApiProperty({ maxLength: 14, example: '33333333333' })
  cpf!: string

  @ApiProperty({ example: -23.55052 })
  latitude!: number

  @ApiProperty({ example: -46.633308 })
  longitude!: number
}

export class EditRecipientRequestDto {
  @ApiPropertyOptional({ example: 'Jane Recipient' })
  name?: string

  @ApiPropertyOptional({ example: 'Avenida Paulista, 1000' })
  address?: string

  @ApiPropertyOptional({ maxLength: 10, example: '1199999999' })
  phone?: string
}

export class CreateOrderRequestDto {
  @ApiProperty({ example: 'Notebook Dell' })
  name!: string

  @ApiProperty({
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  recipientId!: string
}

export class EditOrderRequestDto {
  @ApiPropertyOptional({ example: 'Notebook Dell' })
  name?: string

  @ApiPropertyOptional({
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  recipientId?: string
}

export class DeliveryProofUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image file used as proof of delivery.',
  })
  file!: unknown
}

export class DeliverymanResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string

  @ApiProperty({ example: 'John Doe' })
  name!: string

  @ApiProperty({ example: '22222222222' })
  cpf!: string
}

export class DeliverymenResponseDto {
  @ApiProperty({ type: [DeliverymanResponseDto] })
  deliverymen!: DeliverymanResponseDto[]
}

export class RecipientResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string

  @ApiProperty({ example: 'Jane Recipient' })
  name!: string

  @ApiProperty({ example: 'Avenida Paulista, 1000' })
  address!: string

  @ApiProperty({ example: '1199999999' })
  phone!: string

  @ApiProperty({ example: '33333333333' })
  cpf!: string

  @ApiProperty({ example: -23.55052 })
  latitude!: number

  @ApiProperty({ example: -46.633308 })
  longitude!: number
}

export class RecipientsResponseDto {
  @ApiProperty({ type: [RecipientResponseDto] })
  recipients!: RecipientResponseDto[]
}

export class OrderResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string

  @ApiProperty({ example: 'Notebook Dell' })
  name!: string

  @ApiProperty({ enum: ['waiting', 'pickedUp', 'delivered', 'returned'] })
  status!: 'waiting' | 'pickedUp' | 'delivered' | 'returned'

  @ApiProperty({
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  recipientId!: string

  @ApiPropertyOptional({
    format: 'uuid',
    nullable: true,
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  deliverymanId!: string | null

  @ApiPropertyOptional({
    nullable: true,
    example: 'https://cdn.example.com/uploads/proof.jpg',
  })
  deliveryPhotoUrl!: string | null

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  updatedAt!: Date | null

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  pickedUpAt!: Date | null

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  deliveredAt!: Date | null
}

export class OrdersResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  orders!: OrderResponseDto[]
}
