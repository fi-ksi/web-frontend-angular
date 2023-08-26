import { Problems } from '../../api/edulint';

export interface EdulintReport {
  problems: Problems,
  editorUrl: string
}
