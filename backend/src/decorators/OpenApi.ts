import { zodSchema } from '@/swagger';
import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiParamOptions, ApiResponse, ApiResponseOptions } from '@nestjs/swagger';
import { ZodSchema } from 'zod/v4';

type OpenApiOptions = {
  operation?: {
    summary?: string;
    description?: string;
  };
  body: {
    schema: ZodSchema;
    status?: number;
    description?: string;
  };
  params?: ApiParamOptions[];
  responses?: ApiResponseOptions[];
};

export function OpenApi(options: OpenApiOptions) {
  const { operation, body, params, responses } = options;
  return applyDecorators(
    ApiOperation({ summary: operation?.summary, description: operation?.description }),
    ApiBody(zodSchema(body.schema)),
    ApiResponse({ status: body.status, description: body.description, ...zodSchema(body.schema) }),
    ...(params ?? []).map((p) => ApiParam(p)),
    ...(responses ?? []).map((r) => ApiResponse(r)),
  );
}
