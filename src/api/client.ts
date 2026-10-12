/* Auto-generated from the Angular DefaultService — do not edit by hand. */
import type { components } from './schema';

type S = components['schemas'];

export interface RequestOptions {
  signal?: AbortSignal;
}

let accessToken: string | undefined;
export function setAccessToken(token: string | undefined) { accessToken = token; }

async function request<T>(path: string, init: { method: string; query?: Record<string, unknown>; json?: unknown; form?: FormData; signal?: AbortSignal }): Promise<T> {
  const base = (process.env.NEXT_PUBLIC_BACKEND_URL) || 'http://localhost:3030/';
  let url = base.replace(/\/$/, '') + path;
  if (init.query) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(init.query)) {
      if (v === undefined || v === null) continue;
      qs.append(k, String(v));
    }
    const s = qs.toString();
    if (s) url += (url.includes('?') ? '&' : '?') + s;
  }
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = 'Bearer ' + accessToken;
  let body: BodyInit | undefined;
  if (init.form) { body = init.form; } else if (init.json !== undefined) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(init.json); }
  const resp = await fetch(url, { method: init.method.toUpperCase(), headers, body, signal: init.signal });
  if (!resp.ok) {
    const err = new Error('HTTP ' + resp.status + ' ' + url) as Error & { status: number };
    err.status = resp.status;
    throw err;
  }
  const ct = resp.headers.get('content-type') || '';
  if (ct.includes('application/json')) return (await resp.json()) as T;
  if (ct.includes('text/') || ct.includes('svg')) return (await resp.text()) as unknown as T;
  return (await resp.blob()) as unknown as T;
}

function fillPath(template: string, params: Record<string, unknown>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => encodeURIComponent(String(params[k])));
}

export async function achievementsCreateNew(body: S['AchievementCreationRequest'], opts?: RequestOptions): Promise<S['AchievementCreationRequest']> {
  const urlPath = '/achievements';
  return request<S['AchievementCreationRequest']>(urlPath, { method: 'post', json: body, signal: opts?.signal });
}

export async function achievementsDeleteSingle(achievementId: number, opts?: RequestOptions): Promise<S['EmptyDict']> {
  const urlPath = fillPath('/achievements/{achievementId}', { achievementId });
  return request<S['EmptyDict']>(urlPath, { method: 'delete', signal: opts?.signal });
}

export async function achievementsEditSingle(body: S['AchievementCreationRequest'], achievementId: number, opts?: RequestOptions): Promise<S['AchievementResponse']> {
  const urlPath = fillPath('/achievements/{achievementId}', { achievementId });
  return request<S['AchievementResponse']>(urlPath, { method: 'put', json: body, signal: opts?.signal });
}

export async function achievementsGetAll(_limit?: number, _start?: number, achievement?: number, year?: number, opts?: RequestOptions): Promise<S['AchievementsResponse']> {
  const urlPath = '/achievements';
  const query: Record<string, unknown> = { _limit, _start, achievement, year };
  return request<S['AchievementsResponse']>(urlPath, { method: 'get', query, signal: opts?.signal });
}

export async function achievementsGetSingle(achievementId: number, opts?: RequestOptions): Promise<S['AchievementResponse']> {
  const urlPath = fillPath('/achievements/{achievementId}', { achievementId });
  return request<S['AchievementResponse']>(urlPath, { method: 'get', signal: opts?.signal });
}

export async function achievementsGetSuccessful(opts?: RequestOptions): Promise<S['AchievementResponse']> {
  const urlPath = '/achievements/special/successful';
  return request<S['AchievementResponse']>(urlPath, { method: 'get', signal: opts?.signal });
}

export async function adminAchievementsGrant(body: S['AchievementGrantRequest'], opts?: RequestOptions): Promise<S['AchievementGrantResponse']> {
  const urlPath = '/admin/achievements/grant';
  return request<S['AchievementGrantResponse']>(urlPath, { method: 'post', json: body, signal: opts?.signal });
}

export async function adminDiplomaGrantForm(files: Blob | File, userId: number, year?: number, opts?: RequestOptions): Promise<unknown> {
  const urlPath = fillPath('/admin/diploma/{userId}/grant', { userId });
  const query: Record<string, unknown> = { year };
  const form = new FormData();
  form.append('files', files as Blob);
  return request<unknown>(urlPath, { method: 'post', query, form, signal: opts?.signal });
}

export async function adminEmailSend(body: S['EmailSendRequest'], opts?: RequestOptions): Promise<S['EmailSendResponse']> {
  const urlPath = '/admin/e-mail';
  return request<S['EmailSendResponse']>(urlPath, { method: 'post', json: body, signal: opts?.signal });
}

export async function adminExecutionGetMultiple(user?: number, module?: number, limit?: number, page?: number, from?: string, to?: string, result?: S['ExecutionResult'], year?: number, opts?: RequestOptions): Promise<S['ExecutionsResponse']> {
  const urlPath = '/admin/execs';
  const query: Record<string, unknown> = { user, module, limit, page, from, to, result, year };
  return request<S['ExecutionsResponse']>(urlPath, { method: 'get', query, signal: opts?.signal });
}

export async function adminMonitoringDashboardURL(opts?: RequestOptions): Promise<S['MonitoringDashboardURLResponse']> {
  const urlPath = '/admin/monitoring-dashboard';
  return request<S['MonitoringDashboardURLResponse']>(urlPath, { method: 'get', signal: opts?.signal });
}

export async function adminTaskDeploySingle(taskId: number, opts?: RequestOptions): Promise<S['AdminTaskMergeResponse']> {
  const urlPath = fillPath('/admin/atasks/{taskId}/deploy', { taskId });
  return request<S['AdminTaskMergeResponse']>(urlPath, { method: 'post', signal: opts?.signal });
}

export async function adminTaskMergeSingle(taskId: number, opts?: RequestOptions): Promise<S['AdminTaskMergeResponse']> {
  const urlPath = fillPath('/admin/atasks/{taskId}/merge', { taskId });
  return request<S['AdminTaskMergeResponse']>(urlPath, { method: 'post', signal: opts?.signal });
}

export async function adminTasksGetAll(wave?: number, year?: number, opts?: RequestOptions): Promise<S['AdminTasksResponse']> {
  const urlPath = '/admin/atasks';
  const query: Record<string, unknown> = { wave, year };
  return request<S['AdminTasksResponse']>(urlPath, { method: 'get', query, signal: opts?.signal });
}

export async function adminTasksGetDeploySingle(taskId: number, opts?: RequestOptions): Promise<S['AdminTaskDeployResponse']> {
  const urlPath = fillPath('/admin/atasks/{taskId}/deploy', { taskId });
  return request<S['AdminTaskDeployResponse']>(urlPath, { method: 'get', signal: opts?.signal });
}

export async function adminTasksGetSingle(taskId: number, opts?: RequestOptions): Promise<S['AdminTaskResponse']> {
  const urlPath = fillPath('/admin/atasks/{taskId}', { taskId });
  return request<S['AdminTaskResponse']>(urlPath, { method: 'get', signal: opts?.signal });
}

export async function articlesCreateNew(body: S['ArticleCreationRequest'], opts?: RequestOptions): Promise<S['ArticleCreationRequest']> {
  const urlPath = '/articles';
  return request<S['ArticleCreationRequest']>(urlPath, { method: 'post', json: body, signal: opts?.signal });
}

export async function articlesDeleteSingle(articleId: number, opts?: RequestOptions): Promise<S['EmptyDict']> {
  const urlPath = fillPath('/articles/{articleId}', { articleId });
  return request<S['EmptyDict']>(urlPath, { method: 'delete', signal: opts?.signal });
}

export async function articlesEditSingle(body: S['ArticleCreationRequest'], articleId: number, opts?: RequestOptions): Promise<S['ArticleResponse']> {
  const urlPath = fillPath('/articles/{articleId}', { articleId });
  return request<S['ArticleResponse']>(urlPath, { method: 'put', json: body, signal: opts?.signal });
}

export async function articlesGetAll(_limit?: number, _start?: number, article?: number, year?: number, opts?: RequestOptions): Promise<S['ArticlesResponse']> {
  const urlPath = '/articles';
  const query: Record<string, unknown> = { _limit, _start, article, year };
  return request<S['ArticlesResponse']>(urlPath, { method: 'get', query, signal: opts?.signal });
}

export async function articlesGetSingle(articleId: number, opts?: RequestOptions): Promise<S['ArticleResponse']> {
  const urlPath = fillPath('/articles/{articleId}', { articleId });
  return request<S['ArticleResponse']>(urlPath, { method: 'get', signal: opts?.signal });
}

export async function basicProfileGetSingle(opts?: RequestOptions): Promise<S['BasicProfileResponse']> {
  const urlPath = '/basicProfile';
  return request<S['BasicProfileResponse']>(urlPath, { method: 'get', signal: opts?.signal });
}

export async function changePassword(body: S['ChangePasswordRequest'], opts?: RequestOptions): Promise<S['ChangePasswordResult']> {
  const urlPath = '/settings/changePassword';
  return request<S['ChangePasswordResult']>(urlPath, { method: 'post', json: body, signal: opts?.signal });
}

export async function contentsCreateNewForm(files: Blob | File[], path?: string, opts?: RequestOptions): Promise<S['EmptyDict']> {
  const urlPath = '/content';
  const query: Record<string, unknown> = { path };
  const form = new FormData();
  form.append('files', files as Blob);
  return request<S['EmptyDict']>(urlPath, { method: 'post', query, form, signal: opts?.signal });
}

export async function contentsDeleteSingle(path?: string, opts?: RequestOptions): Promise<S['EmptyDict']> {
  const urlPath = '/content';
  const query: Record<string, unknown> = { path };
  return request<S['EmptyDict']>(urlPath, { method: 'delete', query, signal: opts?.signal });
}

export async function contentsGetSingle(path?: string, opts?: RequestOptions): Promise<Blob | S['DirContentResponse']> {
  const urlPath = '/content';
  const query: Record<string, unknown> = { path };
  return request<Blob | S['DirContentResponse']>(urlPath, { method: 'get', query, signal: opts?.signal });
}

export async function diplomasListForUserSingle(userId: number, opts?: RequestOptions): Promise<S['DiplomasListResponse']> {
  const urlPath = fillPath('/diplomas/{userId}', { userId });
  return request<S['DiplomasListResponse']>(urlPath, { method: 'get', signal: opts?.signal });
}

export async function feedbackCreateNew(body: S['FeedbackCreationRequest'], opts?: RequestOptions): Promise<S['FeedbackCreationRequest']> {
  const urlPath = '/feedbacks';
  return request<S['FeedbackCreationRequest']>(urlPath, { method: 'post', json: body, signal: opts?.signal });
}

export async function feedbackEditSingle(body: S['FeedbackUpdateRequest'], feedbackId: number, opts?: RequestOptions): Promise<S['FeedbacksResponse']> {
  const urlPath = fillPath('/feedbacks/{feedbackId}', { feedbackId });
  return request<S['FeedbacksResponse']>(urlPath, { method: 'put', json: body, signal: opts?.signal });
}

export async function feedbackGetSingle(feedbackId: number, opts?: RequestOptions): Promise<S['FeedbacksResponse']> {
  const urlPath = fillPath('/feedbacks/{feedbackId}', { feedbackId });
  return request<S['FeedbacksResponse']>(urlPath, { method: 'get', signal: opts?.signal });
}

export async function forgottenPasswordReset(body: S['ForgottenPasswordRequest'], opts?: RequestOptions): Promise<S['ForgottenPasswordResult']> {
  const urlPath = '/forgottenPassword';
  return request<S['ForgottenPasswordResult']>(urlPath, { method: 'post', json: body, signal: opts?.signal });
}

export async function instanceConfigGetAll(opts?: RequestOptions): Promise<S['AdminInstanceConfigResponse']> {
  const urlPath = '/admin/instanceConfig';
  return request<S['AdminInstanceConfigResponse']>(urlPath, { method: 'get', signal: opts?.signal });
}

export async function instanceConfigSetSingle(body: S['AdminInstanceConfig'], opts?: RequestOptions): Promise<string> {
  const urlPath = '/admin/instanceConfig';
  return request<string>(urlPath, { method: 'post', json: body, signal: opts?.signal });
}

export async function modulesGetSingle(modulesId: number, opts?: RequestOptions): Promise<S['ModuleResponse']> {
  const urlPath = fillPath('/modules/{modulesId}', { modulesId });
  return request<S['ModuleResponse']>(urlPath, { method: 'get', signal: opts?.signal });
}

export async function modulesSubmitFilesForm(files: Blob | File, modulesId: number, opts?: RequestOptions): Promise<S['ModuleSubmitResponse']> {
  const urlPath = fillPath('/modules/{modulesId}/submitFiles', { modulesId });
  const form = new FormData();
  form.append('files', files as Blob);
  return request<S['ModuleSubmitResponse']>(urlPath, { method: 'post', form, signal: opts?.signal });
}

export async function modulesSubmitSingle(modulesId: number, body?: S['ModuleSubmissionRequest'], opts?: RequestOptions): Promise<S['ModuleSubmitResponse']> {
  const urlPath = fillPath('/modules/{modulesId}/submit', { modulesId });
  return request<S['ModuleSubmitResponse']>(urlPath, { method: 'post', json: body, signal: opts?.signal });
}

export async function postsCreateNew(body: S['PostsCreationRequest'], opts?: RequestOptions): Promise<S['PostsCreationRequest']> {
  const urlPath = '/posts';
  return request<S['PostsCreationRequest']>(urlPath, { method: 'post', json: body, signal: opts?.signal });
}

export async function postsDeleteSingle(postsId: number, opts?: RequestOptions): Promise<S['EmptyDict']> {
  const urlPath = fillPath('/posts/{postsId}', { postsId });
  return request<S['EmptyDict']>(urlPath, { method: 'delete', signal: opts?.signal });
}

export async function postsEditSingle(body: S['PostsEditRequest'], postsId: number, opts?: RequestOptions): Promise<S['PostResponse']> {
  const urlPath = fillPath('/posts/{postsId}', { postsId });
  return request<S['PostResponse']>(urlPath, { method: 'put', json: body, signal: opts?.signal });
}

export async function postsResolve(postsId: number, opts?: RequestOptions): Promise<S['PostResponse']> {
  const urlPath = fillPath('/posts/{postsId}/resolve', { postsId });
  return request<S['PostResponse']>(urlPath, { method: 'post', signal: opts?.signal });
}

export async function postsUnresolve(postsId: number, opts?: RequestOptions): Promise<S['PostResponse']> {
  const urlPath = fillPath('/posts/{postsId}/resolve', { postsId });
  return request<S['PostResponse']>(urlPath, { method: 'delete', signal: opts?.signal });
}

export async function profileEditMy(body: S['ProfileEdit'], opts?: RequestOptions): Promise<S['ProfileResponse']> {
  const urlPath = '/profile';
  return request<S['ProfileResponse']>(urlPath, { method: 'put', json: body, signal: opts?.signal });
}

export async function profileGetMy(year?: number, opts?: RequestOptions): Promise<S['ProfileResponse']> {
  const urlPath = '/profile';
  const query: Record<string, unknown> = { year };
  return request<S['ProfileResponse']>(urlPath, { method: 'get', query, signal: opts?.signal });
}

export async function profileGetSingle(profileId: number, year?: number, opts?: RequestOptions): Promise<S['ProfileResponse']> {
  const urlPath = fillPath('/profile/{profileId}', { profileId });
  const query: Record<string, unknown> = { year };
  return request<S['ProfileResponse']>(urlPath, { method: 'get', query, signal: opts?.signal });
}

export async function profileUploadPictureForm(file: Blob | File, opts?: RequestOptions): Promise<S['EmptyDict']> {
  const urlPath = '/profile/picture';
  const form = new FormData();
  form.append('file', file as Blob);
  return request<S['EmptyDict']>(urlPath, { method: 'post', form, signal: opts?.signal });
}

export async function registerNewUser(body: S['RegistrationRequest'], opts?: RequestOptions): Promise<S['PossibleErrorDict']> {
  const urlPath = '/registration';
  return request<S['PossibleErrorDict']>(urlPath, { method: 'post', json: body, signal: opts?.signal });
}

export async function runCode(body: S['RunCodeRequest'], moduleId: number, opts?: RequestOptions): Promise<S['RunCodeResponse']> {
  const urlPath = fillPath('/runCode/{moduleId}/submit', { moduleId });
  return request<S['RunCodeResponse']>(urlPath, { method: 'post', json: body, signal: opts?.signal });
}

export async function subFilesDeleteSingle(submFileId: number, opts?: RequestOptions): Promise<S['EmptyDict']> {
  const urlPath = fillPath('/submFiles/{submFileId}', { submFileId });
  return request<S['EmptyDict']>(urlPath, { method: 'delete', signal: opts?.signal });
}

export async function submFilesGetSingle(submFileId: number, opts?: RequestOptions): Promise<Blob> {
  const urlPath = fillPath('/submFiles/{submFileId}', { submFileId });
  return request<Blob>(urlPath, { method: 'get', signal: opts?.signal });
}

export async function taskDetailsGetSingle(taskDetailsId: number, opts?: RequestOptions): Promise<S['TaskDetailResponse']> {
  const urlPath = fillPath('/taskDetails/{taskDetailsId}', { taskDetailsId });
  return request<S['TaskDetailResponse']>(urlPath, { method: 'get', signal: opts?.signal });
}

export async function tasksGetAll(year?: number, opts?: RequestOptions): Promise<S['TasksResponse']> {
  const urlPath = '/tasks';
  const query: Record<string, unknown> = { year };
  return request<S['TasksResponse']>(urlPath, { method: 'get', query, signal: opts?.signal });
}

export async function tasksGetSingle(tasksId: number, opts?: RequestOptions): Promise<S['TaskResponse']> {
  const urlPath = fillPath('/tasks/{tasksId}', { tasksId });
  return request<S['TaskResponse']>(urlPath, { method: 'get', signal: opts?.signal });
}

export async function threadDetailsGetSingle(threadDetailsId: number, opts?: RequestOptions): Promise<S['ThreadDetailResponse']> {
  const urlPath = fillPath('/threadDetails/{threadDetailsId}', { threadDetailsId });
  return request<S['ThreadDetailResponse']>(urlPath, { method: 'get', signal: opts?.signal });
}

export async function threadsCreateNew(body: S['ThreadsCreationRequest'], opts?: RequestOptions): Promise<S['ThreadResponse']> {
  const urlPath = '/threads';
  return request<S['ThreadResponse']>(urlPath, { method: 'post', json: body, signal: opts?.signal });
}

export async function threadsGetAll(wave?: number, year?: number, opts?: RequestOptions): Promise<S['ThreadsResponse']> {
  const urlPath = '/threads';
  const query: Record<string, unknown> = { wave, year };
  return request<S['ThreadsResponse']>(urlPath, { method: 'get', query, signal: opts?.signal });
}

export async function threadsGetSingle(threadsId: number, opts?: RequestOptions): Promise<S['ThreadResponse']> {
  const urlPath = fillPath('/threads/{threadsId}', { threadsId });
  return request<S['ThreadResponse']>(urlPath, { method: 'get', signal: opts?.signal });
}

export async function threadsMarkVisited(threadsId: number, opts?: RequestOptions): Promise<S['EmptyDict']> {
  const urlPath = fillPath('/threads/{threadsId}', { threadsId });
  return request<S['EmptyDict']>(urlPath, { method: 'put', signal: opts?.signal });
}

export async function usersDeleteSingle(usersId: number, opts?: RequestOptions): Promise<S['EmptyDict']> {
  const urlPath = fillPath('/users/{usersId}', { usersId });
  return request<S['EmptyDict']>(urlPath, { method: 'delete', signal: opts?.signal });
}

export async function usersGetAll(filter?: string, sort?: string, year?: number, opts?: RequestOptions): Promise<S['UsersResponse']> {
  const urlPath = '/users';
  const query: Record<string, unknown> = { filter, sort, year };
  return request<S['UsersResponse']>(urlPath, { method: 'get', query, signal: opts?.signal });
}

export async function usersGetSingle(usersId: number, year?: number, opts?: RequestOptions): Promise<S['UserResponse']> {
  const urlPath = fillPath('/users/{usersId}', { usersId });
  const query: Record<string, unknown> = { year };
  return request<S['UserResponse']>(urlPath, { method: 'get', query, signal: opts?.signal });
}

export async function usersGetSingleDiscordInvite(usersId: number, year?: number, opts?: RequestOptions): Promise<string> {
  const urlPath = fillPath('/users/{usersId}/discord', { usersId });
  const query: Record<string, unknown> = { year };
  return request<string>(urlPath, { method: 'get', query, signal: opts?.signal });
}

export async function wavesCreateNew(body: S['WaveCreationRequest'], opts?: RequestOptions): Promise<S['WaveResponse']> {
  const urlPath = '/waves';
  return request<S['WaveResponse']>(urlPath, { method: 'post', json: body, signal: opts?.signal });
}

export async function wavesDeleteSingle(waveId: number, opts?: RequestOptions): Promise<S['EmptyDict']> {
  const urlPath = fillPath('/waves/{waveId}', { waveId });
  return request<S['EmptyDict']>(urlPath, { method: 'delete', signal: opts?.signal });
}

export async function wavesGetAll(year?: number, opts?: RequestOptions): Promise<S['Waves']> {
  const urlPath = '/waves';
  const query: Record<string, unknown> = { year };
  return request<S['Waves']>(urlPath, { method: 'get', query, signal: opts?.signal });
}

export async function wavesGetSingle(waveId: number, opts?: RequestOptions): Promise<S['WaveResponse']> {
  const urlPath = fillPath('/waves/{waveId}', { waveId });
  return request<S['WaveResponse']>(urlPath, { method: 'get', signal: opts?.signal });
}

export async function wavesUpdateSingle(body: S['WaveUpdateRequest'], waveId: number, opts?: RequestOptions): Promise<S['WaveResponse']> {
  const urlPath = fillPath('/waves/{waveId}', { waveId });
  return request<S['WaveResponse']>(urlPath, { method: 'put', json: body, signal: opts?.signal });
}

export async function yearsCreateNew(body: S['YearCreationRequest'], opts?: RequestOptions): Promise<S['YearResponse']> {
  const urlPath = '/years';
  return request<S['YearResponse']>(urlPath, { method: 'post', json: body, signal: opts?.signal });
}

export async function yearsDeleteSingle(yearId: number, opts?: RequestOptions): Promise<S['EmptyDict']> {
  const urlPath = fillPath('/years/{yearId}', { yearId });
  return request<S['EmptyDict']>(urlPath, { method: 'delete', signal: opts?.signal });
}

export async function yearsGetAll(opts?: RequestOptions): Promise<S['Years']> {
  const urlPath = '/years';
  return request<S['Years']>(urlPath, { method: 'get', signal: opts?.signal });
}

export async function yearsGetSingle(yearId: number, opts?: RequestOptions): Promise<S['YearResponse']> {
  const urlPath = fillPath('/years/{yearId}', { yearId });
  return request<S['YearResponse']>(urlPath, { method: 'get', signal: opts?.signal });
}

export async function yearsUpdateSingle(body: S['YearUpdateRequest'], yearId: number, opts?: RequestOptions): Promise<S['YearResponse']> {
  const urlPath = fillPath('/years/{yearId}', { yearId });
  return request<S['YearResponse']>(urlPath, { method: 'put', json: body, signal: opts?.signal });
}

export async function authorizeForm(grant_type: string, username = '', password = '', refresh_token = '', opts?: RequestOptions): Promise<S['AuthResponse']> {
  const base = (process.env.NEXT_PUBLIC_BACKEND_URL) || 'http://localhost:3030/';
  const body = new URLSearchParams({ grant_type, username, password, refresh_token });
  const resp = await fetch(base.replace(/\/$/, '') + '/auth', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString(), signal: opts?.signal });
  if (!resp.ok) { const err = new Error('HTTP ' + resp.status) as Error & { status: number }; err.status = resp.status; throw err; }
  return (await resp.json()) as S['AuthResponse'];
}

// Hand-written: POST /feedback (missed by the endpoint extractor; used by the feedback modal)
export async function sendEmailWithFeedback(body: S['FeedbackRequest'], opts?: RequestOptions): Promise<S['FeedbackResponse']> {
  const urlPath = '/feedback';
  return request<S['FeedbackResponse']>(urlPath, { method: 'post', json: body, signal: opts?.signal });
}
