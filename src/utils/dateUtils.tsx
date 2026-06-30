import {translate} from './languageUtils/I18n';

export const MONTHS = [
  translate('January'),
  translate('February'),
  translate('March'),
  translate('April'),
  translate('May'),
  translate('June'),
  translate('July'),
  translate('August'),
  translate('September'),
  translate('October'),
  translate('November'),
  translate('December'),
];

export interface MonthYearItem {
  monthIndex: number;
  monthName: string;
  year: number;
}

/**
 * Returns 12 months starting from current month backwards with correct year
 */
export const getReverseMonthsWithYear = (
  currentMonth: number,
  currentYear: number,
): MonthYearItem[] => {
  const result: MonthYearItem[] = [];

  for (let i = 0; i < 12; i++) {
    const totalMonthsBack = currentMonth - i;
    const monthIndex = ((totalMonthsBack % 12) + 12) % 12;
    const year = currentYear + Math.floor(totalMonthsBack / 12);
    result.push({
      monthIndex,
      monthName: MONTHS[monthIndex],
      year,
    });
  }

  return result;
};
