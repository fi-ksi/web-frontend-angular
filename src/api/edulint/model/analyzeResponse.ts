/**
 * EduLint web API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: 1.0.1
 * Contact: contact@edulint.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { ConfigError } from './configError';
import { HashStr } from './hashStr';
import { Problems } from './problems';

export interface AnalyzeResponse { 
    problems?: Problems;
    config_errors?: Array<ConfigError>;
    hash?: HashStr;
}