import { applyDecorators, Controller as NestController } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

export function Controller(label: string) {
  return applyDecorators(
    ApiTags(label),
    NestController(label),
  );
}