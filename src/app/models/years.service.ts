import { Year } from '../../api/backend';

export type IYear = Year & {$newest?: boolean};

export type YearSelect = Pick<IYear, 'year' | 'id' | '$newest'>;
