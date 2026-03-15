import { applyDecorators } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiUnsupportedMediaTypeResponse,
} from '@nestjs/swagger'
import { ErrorResponseDto } from './swagger.models'

export function ApiJwtAuth() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid JWT token.',
      type: ErrorResponseDto,
    }),
  )
}

export function ApiAdminAuth() {
  return applyDecorators(
    ApiJwtAuth(),
    ApiForbiddenResponse({
      description: 'Only admins can access this endpoint.',
      type: ErrorResponseDto,
    }),
  )
}

export function ApiUuidParam(
  name = 'id',
  description = 'Resource identifier.',
) {
  return ApiParam({
    name,
    description,
    schema: { type: 'string', format: 'uuid' },
  })
}

export function ApiPaginationQuery() {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      schema: { type: 'integer', minimum: 1, default: 1 },
    }),
    ApiQuery({
      name: 'perPage',
      required: false,
      schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    }),
  )
}

export function ApiNearbyOrdersQuery() {
  return applyDecorators(
    ApiQuery({
      name: 'latitude',
      required: true,
      schema: { type: 'number', format: 'double' },
    }),
    ApiQuery({
      name: 'longitude',
      required: true,
      schema: { type: 'number', format: 'double' },
    }),
    ApiPaginationQuery(),
  )
}

export function ApiValidationErrorResponse(
  description = 'Invalid request data.',
) {
  return ApiBadRequestResponse({
    description,
    type: ErrorResponseDto,
  })
}

export function ApiResourceNotFoundResponse(
  description = 'Resource not found.',
) {
  return ApiNotFoundResponse({
    description,
    type: ErrorResponseDto,
  })
}

export function ApiConflictErrorResponse(description = 'Conflict.') {
  return ApiConflictResponse({
    description,
    type: ErrorResponseDto,
  })
}

export function ApiForbiddenErrorResponse(description = 'Forbidden.') {
  return ApiForbiddenResponse({
    description,
    type: ErrorResponseDto,
  })
}

export function ApiUnsupportedMediaTypeErrorResponse(
  description = 'Unsupported media type.',
) {
  return ApiUnsupportedMediaTypeResponse({
    description,
    type: ErrorResponseDto,
  })
}
