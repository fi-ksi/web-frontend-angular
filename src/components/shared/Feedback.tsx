import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { feedbackCreateNew, feedbackEditSingle, feedbackGetSingle } from '../../api/client';
import type { components } from '../../api/schema';
import { useTranslation } from 'react-i18next';
import './Feedback.scss';

type S = components['schemas'];

interface FeedbackProps {
  feedbackId: number;
  taskId: number;
  taskOpen: boolean;
}

/**
 * Feedback form for a task. Ratings default to -1 (unanswered), large text
 * fields to an empty string; submitting with an unanswered rating shows the
 * "incomplete" notice instead of sending.
 */
export function Feedback({ feedbackId, taskId, taskOpen }: FeedbackProps): React.ReactElement | null {
  const { t } = useTranslation();
  const [filledNow, setFilledNow] = useState(false);
  const [incomplete, setIncomplete] = useState(false);

  const feedbackQuery = useQuery({
    queryKey: ['feedback', feedbackId],
    queryFn: async (): Promise<S['Feedback'] | null> => {
      const resp = await feedbackGetSingle(feedbackId);
      const feedback = resp.feedback;
      if (feedback.filled) return null;
      return {
        ...feedback,
        taskId: feedback.taskId ?? taskId,
        categories: feedback.categories.map((c) => ({
          ...c,
          answer: c.answer !== undefined ? c.answer : (c.ftype === 'text_large' ? '' : -1)
        }))
      };
    },
    staleTime: 60_000
  });

  const [answers, setAnswers] = useState<Record<string, string | number>>({});

  const sendMutation = useMutation({
    mutationFn: async (payload: { filled: boolean; categories: S['Category'][] }) => {
      if (payload.filled) {
        await feedbackEditSingle({ feedback: { categories: payload.categories } }, feedbackId);
      } else {
        await feedbackCreateNew({ feedback: { categories: payload.categories } as S['FeedbackCreation'] });
      }
    },
    onSuccess: () => {
      setFilledNow(true);
      void feedbackQuery.refetch();
    }
  });

  if (!taskOpen) return null;
  if (filledNow) {
    return <div className="alert alert-success filled-now">{t('tasks.feedback.sent')}</div>;
  }

  const feedback = feedbackQuery.data;
  if (!feedback) return null;

  const answerOf = (category: S['Category']): string | number =>
    answers[category.id] !== undefined ? answers[category.id] : (category.answer as string | number);

  const send = () => {
    const categories = feedback.categories.map((c) => ({ ...c, answer: answerOf(c) }));
    if (categories.some((c) => c.answer === -1)) {
      setIncomplete(true);
      return;
    }
    setIncomplete(false);
    void sendMutation.mutate({ filled: !!feedback.filled, categories });
  };

  return (
    <div className="feedback-form">
      <p className="intro">{t('tasks.feedback.intro')}</p>
      {feedback.categories.map((category) => (
        <div key={category.id} className="option">
          <span className="description">{category.text}</span>
          {category.ftype === 'stars' && (
            <div className="answer stars" role="radiogroup" aria-label={category.text}>
              {[1, 2, 3, 4, 5].map((stars) => (
                <button
                  key={stars}
                  type="button"
                  className={`btn btn-link star${(answerOf(category) as number) >= stars ? ' active' : ''}`}
                  onClick={() => setAnswers((a) => ({ ...a, [category.id]: stars }))}
                  aria-label={`${stars}`}
                >
                  ★
                </button>
              ))}
            </div>
          )}
          {category.ftype === 'line' && (
            <div className="line answer">
              <span>{t('tasks.feedback.lime.little')}</span>
              <input
                className="form-control range"
                type="range"
                min={1}
                max={5}
                value={answerOf(category) as number}
                onChange={(e) => setAnswers((a) => ({ ...a, [category.id]: Number(e.target.value) }))}
              />
              <span>{t('tasks.feedback.lime.much')}</span>
            </div>
          )}
          {category.ftype === 'text_large' && (
            <textarea
              className="form-control answer text"
              value={answerOf(category) as string}
              onChange={(e) => setAnswers((a) => ({ ...a, [category.id]: e.target.value }))}
            />
          )}
        </div>
      ))}
      {incomplete && <div className="alert alert-info incomplete">{t('tasks.feedback.incomplete')}</div>}
      <button className="btn btn-ksi w-100" onClick={send} disabled={sendMutation.isPending}>
        {t('tasks.feedback.send')}
      </button>
    </div>
  );
}
