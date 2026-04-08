import { z, ZodType } from 'zod';

type SchemaObject = Record<string, unknown>;

export function zodSchema(schema: ZodType): { schema: SchemaObject } {

  return { schema: z.toJSONSchema(schema as any) as SchemaObject };
}
