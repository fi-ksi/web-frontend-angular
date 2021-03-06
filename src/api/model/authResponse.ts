/**
 * web-backend-swagger
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

export interface AuthResponse { 
    access_token: string;
    expires_in: number;
    refresh_token: string;
    token_type: AuthResponse.TokenTypeEnum;
}
export namespace AuthResponse {
    export type TokenTypeEnum = 'Bearer';
    export const TokenTypeEnum = {
        Bearer: 'Bearer' as TokenTypeEnum
    };
}