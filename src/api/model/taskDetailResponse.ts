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
import { Achievement } from './achievement';
import { KSIModule } from './kSIModule';
import { ModuleScore } from './moduleScore';
import { Post } from './post';
import { TaskDetails } from './taskDetails';
import { Thread } from './thread';
import { ThreadDetail } from './threadDetail';
import { UserScore } from './userScore';

export interface TaskDetailResponse { 
    taskDetails: TaskDetails;
    achievements: Array<Achievement>;
    posts: Array<Post>;
    modules: Array<KSIModule>;
    moduleScores: Array<ModuleScore>;
    userScores: Array<UserScore>;
    threads: Array<Thread>;
    threadDetails: Array<ThreadDetail>;
}