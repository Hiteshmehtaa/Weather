import React from 'react';
import { format, isAfter, startOfDay } from 'date-fns';
import { CalendarPicker } from './CalendarPicker';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  maxDate?: Date;
  error?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange, maxDate, error }) => {

  const handleStartChange = (date: Date) => {
    const newEnd = isAfter(startOfDay(date), startOfDay(value.endDate)) ? date : value.endDate;
    onChange({ startDate: date, endDate: newEnd });
  };

  const handleEndChange = (date: Date) => {
    if (isAfter(startOfDay(value.startDate), startOfDay(date))) {
      onChange({ startDate: date, endDate: date });
    } else {
      onChange({ startDate: value.startDate, endDate: date });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {/* Start date */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant px-1">From</span>
          <CalendarPicker
            value={value.startDate}
            onChange={handleStartChange}
            maxDate={maxDate}
          />
        </div>

        {/* Separator */}
        <span
          className="material-symbols-outlined text-on-surface-variant/40 mt-5"
          style={{ fontSize: 18 }}
        >
          arrow_forward
        </span>

        {/* End date */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant px-1">To</span>
          <CalendarPicker
            value={value.endDate}
            onChange={handleEndChange}
            maxDate={maxDate}
          />
        </div>
      </div>

      {error && (
        <span className="text-[10px] text-error font-bold uppercase tracking-widest px-1">
          {error}
        </span>
      )}

      {/* Summary */}
      <span className="text-[10px] text-on-surface-variant/50 font-medium px-1">
        {format(value.startDate, 'dd MMM yyyy')} → {format(value.endDate, 'dd MMM yyyy')}
        {' '}
        ({Math.round((value.endDate.getTime() - value.startDate.getTime()) / (1000 * 3600 * 24))} days)
      </span>
    </div>
  );
};
