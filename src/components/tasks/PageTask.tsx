import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { tasksGetSingle } from '../../api/client';
import type { components } from '../../api/schema';
import { useAuth } from '../../auth/AuthContext';
import { useTask, useTaskDetails } from '../../hooks/useTasks';
import { useUser } from '../../hooks/useUsers';
import { ROUTES } from '../../routes';
import { formatKsiDate, translatePoints } from '../../utils/format';
import { AchievementIcon } from '../shared/AchievementIcon';
import { DiscussionThread } from '../shared/DiscussionThread';
import { Feedback } from '../shared/Feedback';
import { LoginModal } from '../shared/LoginModal';
import { Spinner } from '../shared/Spinner';
import { UsersInline } from '../shared/UsersInline';
import { TaskBody } from './TaskBody';
import { TaskModule } from './TaskModule';
import { subscribeModuleStatus } from './moduleSubmit';
import { usePageTitle } from './usePageTitle';
import './PageTask.scss';

type S = components['schemas'];

export type TaskSection = 'assigment' | 'solution' | 'discussion' | 'results' | 'assessment';

interface PageTaskProps {
  taskId: number;
  section?: TaskSection;
}

function taskPath(taskId: number, section?: TaskSection): string {
  const base = `/${ROUTES.tasks._}/${taskId}`;
  if (!section || section === 'assigment') {
    return base;
  }
  const sectionPath =
    section === 'solution'
      ? ROUTES.tasks.solution
      : section === 'discussion'
        ? ROUTES.tasks.discussion
        : section === 'results'
          ? ROUTES.tasks.results
          : ROUTES.tasks.assessment;
  return `${base}/${sectionPath}`;
}

function TaskResultsTable({ details }: { details: S['TaskDetailResponse'] }): React.ReactElement {
  const { t } = useTranslation();
  return (
    <table className="table table-striped results-table table-responsive-md">
      <thead>
        <tr>
          <th scope="col" className="text-center">{t('results.table.position')}</th>
          <th scope="col">{t('results.table.name')}</th>
          <th scope="col">{t('results.table.trophies')}</th>
          <th scope="col" className="text-center">{t('results.table.score')}</th>
        </tr>
      </thead>
      <tbody>
        {details.userScores.map((score, index) => (
          <UserScoreRow key={score.id} score={score} position={index + 1} />
        ))}
      </tbody>
    </table>
  );
}

function UserScoreRow({ score, position }: { score: S['UserScore']; position: number }): React.ReactElement | null {
  const { user } = useUser(score.user ?? score.id);
  if (!user) {
    return null;
  }
  return (
    <tr>
      <td className="text-center">{position}.</td>
      <td>
        <Link href={`/${ROUTES.profile._}/${user.id}`}>
          {user.first_name} {user.last_name}
        </Link>
      </td>
      <td>
        {user.achievements.map((achievementId) => (
          <AchievementIcon key={achievementId} achievementId={achievementId} />
        ))}
      </td>
      <td className="text-center">{score.score}</td>
    </tr>
  );
}

/**
 * Task detail page with sections: assignment, solution, discussion,
 * results and assessment. Port of the Angular PageTaskComponent.
 *
 * The Angular version switched sections via URL fragments and showed
 * non-assignment sections in a modal on desktop; here each section is a
 * nested route (see the route mapping in the final report).
 */
export function PageTask({ taskId, section = 'assigment' }: PageTaskProps): React.ReactElement {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { task: head } = useTask(taskId);
  const { details, isLoading } = useTaskDetails(taskId);
  const [loginOpen, setLoginOpen] = useState(false);

  usePageTitle(head?.title ?? t('tasks.title'));

  // Watch for module completions and navigate to the solution when the user
  // completes this task for the first time
  useEffect(
    () =>
      subscribeModuleStatus((event) => {
        if (event.result?.result !== 'ok' || !head || head.state === 'done') {
          return;
        }
        void (async () => {
          await queryClient.invalidateQueries({ queryKey: ['taskDetails', taskId] });
          await queryClient.invalidateQueries({ queryKey: ['task', taskId] });
          await queryClient.invalidateQueries({ queryKey: ['tasks'] });
          const fresh = (await tasksGetSingle(taskId)).task;
          if (fresh.state === 'done') {
            router.push(taskPath(taskId, 'solution'));
          }
        })();
      }),
    [head, taskId, queryClient, router]
  );

  // force login when the task is locked, like the Angular version
  useEffect(() => {
    if (head && head.state === 'locked' && !isLoggedIn) {
      setLoginOpen(true);
    }
  }, [head, isLoggedIn]);

  if (isLoading || !head || !details) {
    return (
      <div className="page-task">
        <Spinner />
      </div>
    );
  }

  if (head.state === 'locked' && !isLoggedIn) {
    return (
      <div className="page-task">
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onOpenRegister={() => {}} onOpenResetPassword={() => {}} />
      </div>
    );
  }

  const taskDetails = details.taskDetails;
  const deadline = new Date(head.time_deadline ?? head.time_published);
  deadline.setDate(deadline.getDate() + 1);
  const deadlinePassed = deadline < new Date();
  const authors = [head.author, head.co_author].filter((orgId) => orgId !== null);

  return (
    <div className="page-task">
      <main>
        <div className="head">
          <h2 className="task-title" dangerouslySetInnerHTML={{ __html: head.title }} />
          <div className="authors-container">
            {t(authors.length > 1 ? 'tasks.author.multiple' : 'tasks.author.single')}:{' '}
            <UsersInline users={authors} />
          </div>
          <span className="deadline">
            {t('tasks.deadline')}: {formatKsiDate(head.time_deadline ?? head.time_published)} 23:59,{' '}
            {translatePoints(t, head.max_score)}
          </span>
        </div>

        {deadlinePassed && <div className="alert alert-warning">{t('tasks.deadline-passed')}</div>}

        {section !== 'assigment' && (
          <div className="back">
            <Link href={taskPath(taskId)}>❮ {t('tasks.back-to-assigment')}</Link>
          </div>
        )}

        {section === 'assigment' && (
          <>
            <article className="body">
              <TaskBody body={taskDetails.body} trusted />
            </article>

            <div className="bottom">
              <Link href={taskPath(taskId, 'discussion')} className="discussion">
                <span className="icon">🗨</span>
                <span>{t('tasks.discussion')}</span>
                <span>({details.posts.length})</span>
              </Link>

              <div className="right-container">
                {taskDetails.solution && (
                  <Link href={taskPath(taskId, 'solution')} className="solution">
                    {t('tasks.solution')}
                  </Link>
                )}
                {isLoggedIn && taskDetails.comment !== null && (
                  <Link href={taskPath(taskId, 'assessment')} className="assessment">
                    {t('tasks.assessment.title')}
                  </Link>
                )}
                {taskDetails.best_scores.length > 0 && (
                  <Link href={taskPath(taskId, 'results')} className="results">
                    {t('tasks.results')} (
                    {details.userScores.length + (details.userScores.length >= 100 ? '+' : '')})
                  </Link>
                )}
              </div>
            </div>

            <div className="modules">
              {deadlinePassed && <div className="alert alert-warning">{t('tasks.deadline-passed')}</div>}
              {details.modules.map((module) => (
                <TaskModule key={module.id} module={module} />
              ))}
            </div>
          </>
        )}

        {section === 'discussion' && <DiscussionThread threadId={taskDetails.thread} />}

        {section === 'assessment' && (
          <>
            <h4>{t('tasks.assessment.comment')}</h4>
            {taskDetails.comment !== null ? (
              <DiscussionThread threadId={taskDetails.comment} allowNewRootPosts={false} />
            ) : (
              <div className="alert alert-info">{t('tasks.assessment.comment-none')}</div>
            )}
          </>
        )}

        {section === 'solution' && (
          <>
            <Feedback feedbackId={head.feedbacks} taskId={head.id} taskOpen={head.state !== 'base' && head.state !== 'locked'} />
            {taskDetails.solution && (
              <article className="body">
                <TaskBody body={taskDetails.solution} trusted />
              </article>
            )}
          </>
        )}

        {section === 'results' && <TaskResultsTable details={details} />}
      </main>
    </div>
  );
}
