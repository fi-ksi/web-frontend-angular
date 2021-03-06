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

export interface CorrectionInfoTask { 
    id: number;
    title: string;
    wave: number;
    author: number;
    corr_state: CorrectionInfoTask.CorrStateEnum;
    solvers: Array<number>;
}
export namespace CorrectionInfoTask {
    export type CorrStateEnum = 'published' | 'corrected' | 'working' | 'base';
    export const CorrStateEnum = {
        Published: 'published' as CorrStateEnum,
        Corrected: 'corrected' as CorrStateEnum,
        Working: 'working' as CorrStateEnum,
        Base: 'base' as CorrStateEnum
    };
}