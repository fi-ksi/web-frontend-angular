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
import { UserRole } from './userRole';

export interface CorrectionInfoUser { 
    id: number;
    first_name: string;
    last_name: string;
    role: UserRole;
    gender: CorrectionInfoUser.GenderEnum;
}
export namespace CorrectionInfoUser {
    export type GenderEnum = 'male' | 'female' | 'other';
    export const GenderEnum = {
        Male: 'male' as GenderEnum,
        Female: 'female' as GenderEnum,
        Other: 'other' as GenderEnum
    };
}