import { useCallback } from 'react';
import { useSelectedFullYear, useSelectedYear, useYears, setSelectedYear } from './useYears';
import type { IYear } from '../types';

/**
 * Compatibility adapter over the shared year store in useYears.ts.
 * Kept for the components written against the {years, selected, selectedFull,
 * setSelected, isLoading} shape; the selection state itself lives in the
 * module-level store (mirrors the Angular YearsService singleton).
 */
export interface YearSelectSimple {
  id: number;
  newest: boolean;
}

export function useYear() {
  const yearsQuery = useYears();
  const years: IYear[] = yearsQuery.data ?? [];
  const selectedYear = useSelectedYear();
  const selectedFull = useSelectedFullYear();

  const selected: YearSelectSimple | null = selectedYear
    ? { id: selectedYear.id, newest: !!selectedYear.$newest }
    : null;

  const setSelected = useCallback(
    (yearId: number | null) => {
      if (yearId === null) {
        setSelectedYear(years.length > 0 ? { year: years[0].year, id: years[0].id, $newest: years[0].$newest } : null);
      } else {
        const year = years.find((y) => y.id === yearId);
        setSelectedYear(year ? { year: year.year, id: year.id, $newest: year.$newest } : null);
      }
    },
    [years]
  );

  return { years, selected, selectedFull, setSelected, isLoading: yearsQuery.isLoading };
}
