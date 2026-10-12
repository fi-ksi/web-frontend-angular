import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminEmailSend, yearsGetAll } from '../../api/client';
import type { components } from '../../api/schema';
import { Modal } from './shared/Modal';
import { RichTextEditor } from '../shared/RichTextEditor';
import { isRichTextEmpty } from '../../utils/richtext';

type S = components['schemas'];

interface EmailResult {
  success: boolean;
  count: number;
  error?: string;
}

/**
 * Admin page for sending e-mails to solvers of a year.
 * The form is validated first, then a confirmation modal shows a summary
 * before the e-mail is actually sent.
 */
export function PageAdminEmail(): React.ReactElement {
  const { t } = useTranslation();

  const subjectInitial = t('admin.email.subject.initial');
  const replyToInitial = t('admin.email.reply-to.initial');

  const [to, setTo] = useState<number | null>(null);
  const [successful, setSuccessful] = useState(false);
  const [sex, setSex] = useState<'both' | 'male' | 'female'>('both');
  const [school, setSchool] = useState<'both' | 'hs' | 'other'>('both');
  const [subject, setSubject] = useState(subjectInitial);
  const [emailType, setEmailType] = useState<'ksi' | 'event' | ''>('');
  const [body, setBody] = useState('');
  const [advancedUsed, setAdvancedUsed] = useState(false);
  const [replyTo, setReplyTo] = useState(replyToInitial);
  const [bcc, setBcc] = useState('');
  const [checkOpen, setCheckOpen] = useState(false);
  const [result, setResult] = useState<EmailResult | null>(null);

  const { data: years } = useQuery({
    queryKey: ['years'],
    queryFn: () => yearsGetAll().then((r) => r.years)
  });

  // Default the recipient year to the most recent one, like the Angular
  // page did by selecting the current year.
  const effectiveTo = to ?? (years && years.length > 0 ? Math.max(...years.map((y) => y.id)) : null);

  const sendMutation = useMutation({
    mutationFn: () => {
      const request: S['EmailSendRequest'] = {
        'e-mail': {
          Subject: subject,
          Body: body,
          'Reply-To': advancedUsed ? replyTo : undefined,
          To: [effectiveTo as number],
          Bcc: bcc ? bcc.split('\n') : [],
          Gender: sex,
          KarlikSign: true,
          EasterEgg: false,
          Category: school,
          Type: emailType === 'event' ? 'events' : 'ksi',
          Successful: successful
        }
      };
      return adminEmailSend(request);
    },
    onSuccess: (response) => {
      setCheckOpen(false);
      if ('error' in response) {
        setResult({ success: false, count: 0, error: response.error });
      } else {
        setResult({ success: true, count: response.count });
      }
    },
    onError: (e: unknown) => {
      setCheckOpen(false);
      setResult({ success: false, count: 0, error: e instanceof Error ? e.message : String(e) });
    }
  });

  const selectedYearName = years?.find((y) => y.id === effectiveTo)?.year;

  const valid =
    effectiveTo !== null && subject.trim() !== '' && subject !== subjectInitial && emailType !== '' && !isRichTextEmpty(body);

  const summary = t('admin.email.summary', {
    successful: t(successful ? 'admin.email.successful.successful' : 'admin.email.successful.all'),
    sex: t(`admin.email.sex.${sex}`),
    school: t(`admin.email.school.${school}`),
    year: selectedYearName ?? '',
    type: emailType ? t(`admin.email.type.${emailType}`) : '',
    advancedUsed: t(`admin.email.advanced.${advancedUsed}`)
  });

  return (
    <div className="content">
      <h2 className="title">{t('admin.email.title')}</h2>

      <form className="form form-group" onSubmit={(e) => e.preventDefault()}>
        <div className="row">
          <div className="col-md-6 col-xl-3">
            <label className="form-label" htmlFor="email-to">
              {t('admin.email.to.title')}
            </label>
            <select
              id="email-to"
              className="form-control"
              value={effectiveTo ?? ''}
              onChange={(e) => setTo(Number(e.target.value))}
            >
              {(years ?? []).map((year) => (
                <option key={year.id} value={year.id}>
                  {year.year}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6 col-xl-3">
            <label className="form-label" htmlFor="email-successful">
              {t('admin.email.successful.title')}
            </label>
            <select
              id="email-successful"
              className="form-control"
              value={String(successful)}
              onChange={(e) => setSuccessful(e.target.value === 'true')}
            >
              <option value="false">{t('admin.email.successful.all')}</option>
              <option value="true">{t('admin.email.successful.successful')}</option>
            </select>
          </div>
          <div className="col-md-6 col-xl-3">
            <label className="form-label" htmlFor="email-sex">
              {t('admin.email.sex.title')}
            </label>
            <select
              id="email-sex"
              className="form-control"
              value={sex}
              onChange={(e) => setSex(e.target.value as typeof sex)}
            >
              {(['both', 'male', 'female'] as const).map((val) => (
                <option key={val} value={val}>
                  {t(`admin.email.sex.${val}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6 col-xl-3">
            <label className="form-label" htmlFor="email-school">
              {t('admin.email.school.title')}
            </label>
            <select
              id="email-school"
              className="form-control"
              value={school}
              onChange={(e) => setSchool(e.target.value as typeof school)}
            >
              {(['both', 'hs', 'other'] as const).map((val) => (
                <option key={val} value={val}>
                  {t(`admin.email.school.${val}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <label className="form-label" htmlFor="email-subject">
              {t('admin.email.subject.title')}
            </label>
            <input className="form-control" id="email-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="email-type">
              {t('admin.email.type.title')}
            </label>
            <select
              id="email-type"
              className="form-control"
              value={emailType}
              onChange={(e) => setEmailType(e.target.value as typeof emailType)}
            >
              <option hidden value="">
                {''}
              </option>
              {(['ksi', 'event'] as const).map((val) => (
                <option key={val} value={val}>
                  {t(`admin.email.type.${val}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <label className="form-label" htmlFor="email-body">
              {t('admin.email.body')}
            </label>
            <RichTextEditor
              className="body"
              value={body}
              onChange={setBody}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <button type="button" className="btn btn-ksi w-100 btn-send" disabled={!valid} onClick={() => setCheckOpen(true)}>
              {t('admin.email.send.check')}
            </button>
          </div>
          <div className="col-12">
            {result && (
              <>
                {result.error && <div className="alert alert-danger">{result.error}</div>}
                {result.success && <div className="alert alert-success">{t('admin.email.success', { count: result.count })}</div>}
              </>
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <button
              type="button"
              className="btn btn-link"
              onClick={() => {
                const next = !advancedUsed;
                setAdvancedUsed(next);
                if (!next) {
                  setReplyTo(replyToInitial);
                  setBcc('');
                }
              }}
            >
              {t('admin.email.advanced.title')}
            </button>
            {advancedUsed && (
              <div className="row">
                <div className="col-12">
                  <label className="form-label" htmlFor="email-reply-to">
                    {t('admin.email.reply-to.title')}
                  </label>
                  <input
                    className="form-control"
                    id="email-reply-to"
                    value={replyTo}
                    onChange={(e) => setReplyTo(e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="email-bcc">
                    {t('admin.email.bcc.title')}
                  </label>
                  <textarea className="form-control" id="email-bcc" value={bcc} onChange={(e) => setBcc(e.target.value)} />
                </div>
              </div>
            )}
          </div>
        </div>
      </form>

      <Modal
        show={checkOpen}
        title={t('admin.email.check.title')}
        onClose={() => setCheckOpen(false)}
        footer={
          <button
            type="button"
            className="btn btn-ksi w-100 btn-send"
            disabled={sendMutation.isPending}
            onClick={() => sendMutation.mutate()}
          >
            {t('admin.email.send.send')}
          </button>
        }
      >
        <div className="modal-email">
          <div className="summary-container">
            <span>{summary}</span>
          </div>

          <span className="form-label">{t('admin.email.subject.title')}</span>
          <div>
            <pre>{subject}</pre>
          </div>

          {advancedUsed && (
            <>
              <span className="form-label">{t('admin.email.reply-to.title')}</span>
              <div>
                <pre>{replyTo}</pre>
              </div>
              {bcc.split('\n').filter((a) => a.trim() !== '').length > 0 && (
                <>
                  <span className="form-label">{t('admin.email.bcc.title')}</span>
                  <div>
                    <ul>
                      {bcc
                        .split('\n')
                        .filter((a) => a.trim() !== '')
                        .map((addr, i) => (
                          <li key={i}>
                            <pre>{addr}</pre>
                          </li>
                        ))}
                    </ul>
                  </div>
                </>
              )}
            </>
          )}

          <span className="form-label">{t('admin.email.body')}</span>
          <div dangerouslySetInnerHTML={{ __html: body }} />
        </div>
      </Modal>
    </div>
  );
}
