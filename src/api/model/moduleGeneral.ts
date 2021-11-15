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
import { ModuleGeneralSubmittedFiles } from './moduleGeneralSubmittedFiles';

export interface ModuleGeneral { 
    id: number;
    type: ModuleGeneral.TypeEnum;
    name: string;
    description: string;
    autocorrect: boolean;
    max_score: string;
    state: ModuleGeneral.StateEnum;
    score: number;
    submittedFiles: Array<ModuleGeneralSubmittedFiles>;
}
export namespace ModuleGeneral {
    export type TypeEnum = 'general' | 'programming' | 'quiz' | 'sortable' | 'text';
    export const TypeEnum = {
        General: 'general' as TypeEnum,
        Programming: 'programming' as TypeEnum,
        Quiz: 'quiz' as TypeEnum,
        Sortable: 'sortable' as TypeEnum,
        Text: 'text' as TypeEnum
    };
    export type StateEnum = 'correct' | 'incorrect' | 'blank';
    export const StateEnum = {
        Correct: 'correct' as StateEnum,
        Incorrect: 'incorrect' as StateEnum,
        Blank: 'blank' as StateEnum
    };
}