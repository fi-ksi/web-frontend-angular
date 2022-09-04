import { Year } from '../../api';

export type IYear = Year & {$newest?: boolean};

export type YearSelect = Pick<IYear, 'year' | 'id' | '$newest'>;
