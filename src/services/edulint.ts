/**
 * Minimal EduLint client used by the programming task module.
 * Talks directly to the public EduLint web API: the analyzed code is posted,
 * the returned hash is then used to fetch the analysis result.
 * Any failure degrades gracefully to `null` (linting is best-effort).
 */

export const EDULINT_URL = 'https://edulint.com';
export const EDULINT_VERSION = 'latest';
export const EDULINT_CONFIG = 'https://ksi.fi.muni.cz/assets/edulint/ksi.toml';

export interface EdulintProblem {
  path?: string;
  source?: string;
  code?: string;
  symbol?: string;
  text?: string;
  line?: number;
  end_line?: number;
  column?: number;
  end_column?: number;
}

export interface EdulintAnalyzeResponse {
  problems?: EdulintProblem[];
  hash?: string;
}

export interface EdulintReport {
  problems: EdulintProblem[];
  editorUrl: string;
}

/**
 * Appends the EduLint config directive expected by the KSI setup.
 */
export function withEdulintConfigComment(code: string): string {
  return `${code}\n# edulint: config=${EDULINT_CONFIG}\n`;
}

/**
 * Maps the raw analyze response to the report shown in the UI.
 */
export function mapEdulintResponse(hash: string, response: EdulintAnalyzeResponse): EdulintReport {
  return {
    problems: response.problems ?? [],
    editorUrl: `${EDULINT_URL}/editor/${hash}`
  };
}

/**
 * Posts the code for analysis and fetches the resulting report.
 * Returns null when the service is unreachable or rejects the code.
 */
export async function analyzeCode(code: string, sourceId?: string): Promise<EdulintReport | null> {
  try {
    const postResp = await fetch(`${EDULINT_URL}/api/code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: withEdulintConfigComment(code), source_id: sourceId })
    });
    if (!postResp.ok) {
      return null;
    }
    const posted = (await postResp.json()) as { hash?: string };
    if (!posted.hash) {
      return null;
    }
    const analyzeResp = await fetch(
      `${EDULINT_URL}/api/${encodeURIComponent(EDULINT_VERSION)}/analyze/${encodeURIComponent(posted.hash)}`
    );
    if (!analyzeResp.ok) {
      return null;
    }
    const analyzed = (await analyzeResp.json()) as EdulintAnalyzeResponse;
    return mapEdulintResponse(posted.hash, analyzed);
  } catch (e) {
    console.error('[EduLint] analysis failed', e);
    return null;
  }
}
