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
import { Article } from './article';
import { DirContent } from './dirContent';

export interface ArticleResponse { 
    article: Article;
    contents: Array<DirContent>;
}