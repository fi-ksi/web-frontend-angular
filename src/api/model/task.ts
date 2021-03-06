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

export interface Task { 
    id: number;
    title: string;
    author: number;
    co_author: number;
    details: number;
    intro: string;
    max_score: number;
    time_published: string;
    time_deadline: string;
    state: Task.StateEnum;
    picture_base: string;
    picture_suffix: Task.PictureSuffixEnum;
    wave: number;
    feedbacks: number;
    prerequisities: Array<number> | Array<Array<number>>;
}
export namespace Task {
    export type StateEnum = 'locked' | 'base' | 'correcting' | 'done';
    export const StateEnum = {
        Locked: 'locked' as StateEnum,
        Base: 'base' as StateEnum,
        Correcting: 'correcting' as StateEnum,
        Done: 'done' as StateEnum
    };
    export type PictureSuffixEnum = '.svg';
    export const PictureSuffixEnum = {
        Svg: '.svg' as PictureSuffixEnum
    };
}