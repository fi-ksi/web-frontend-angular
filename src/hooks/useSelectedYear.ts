import { useCallback } from 'react';
import { useSelectedFullYear, useYears, setSelectedYear } from './useYears';
import type { components } from '../api/schema';

type S = components['schemas'];

export type Year = S['Year'];

/**
 * Adapter over the shared year store in useYears.ts, preserving the
 * {years, selectedYear, selectYear, isLoading, isError} shape.
 * Mirrors the Angular YearsService year selection: the saved year wins,
 * otherwise the newest year is selected.
 */
export function useSelectedYear() {
  const yearsQuery = useYears();
  const years = (yearsQuery.data ?? []) as Year[];
  const selectedFull = useSelectedFullYear();
  const selectedYear: Year | null = (selectedFull as Year | null | undefined) ?? null;

  const selectYear = useCallback(
    (yearId: number | null) => {
      if (yearId === null) return;
      const year = years.find((y) => y.id === yearId);
      if (year) {
        setSelectedYear({ year: year.year, id: year.id, $newest: (year as { $newest?: boolean }).$newest });
      }
    },
    [years]
  );

  return {
    years,
    selectedYear,
    selectYear,
    isLoading: yearsQuery.isLoading,
    isError: yearsQuery.isError
  };
}
