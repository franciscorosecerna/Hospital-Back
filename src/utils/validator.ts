import { zValidator as honoZValidator } from "@hono/zod-validator";
import type { Context, ValidationTargets } from "hono";
import type { ZodType } from "zod";
import type { TokenPayload } from "../modules/authorization/authorizationService";

export type AuthedEnv = { Variables: { user: TokenPayload } };

export type ValidatedContext<
  TJson = unknown,
  TParam = unknown,
  TQuery = unknown,
> = Context<
  AuthedEnv,
  string,
  {
    in: { json: TJson; param: TParam; query: TQuery };
    out: { json: TJson; param: TParam; query: TQuery };
  }
>;

export function zValidator<
  Target extends keyof ValidationTargets,
  Schema extends ZodType,
>(target: Target, schema: Schema) {
  return honoZValidator(target, schema, (result) => {
    if (!result.success) {
      throw result.error;
    }
  });
}