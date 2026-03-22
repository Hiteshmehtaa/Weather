import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isSameDay, isAfter, startOfDay
} from 'date-fns';

interface CalendarPickerProps {
  value: Date;
  onChange: (date: Date) => void;
  maxDate?: Date;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CalendarPicker: React.FC<CalendarPickerProps> = ({ value, onChange, maxDate }) => {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(startOfMonth(value || new Date()));
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Recalculate dropdown position when opened
  const openCalendar = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right + window.scrollX - 288, // 288 = calendar width
        width: rect.width,
      });
    }
    setOpen(true);
  }, []);

  // Close on outside click — but ONLY on mousedown outside both trigger and dropdown
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      // If click is on the trigger button, let its own onClick toggle
      if (triggerRef.current?.contains(target)) return;
      // If click is inside the portal dropdown, ignore
      const portal = document.getElementById('calendar-portal');
      if (portal?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Build calendar grid
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const allDays: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    allDays.push(day);
    day = addDays(day, 1);
  }

  const today = startOfDay(new Date());
  const effectiveMax = maxDate ? startOfDay(maxDate) : today;

  const isDisabled = (d: Date) => isAfter(startOfDay(d), effectiveMax);

  const handleSelect = (d: Date) => {
    if (isDisabled(d)) return;
    onChange(d);
    setOpen(false);
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = addMonths(viewDate, 1);
    if (isAfter(next, effectiveMax)) return;
    setViewDate(next);
  };

  const canGoNext = !isAfter(addMonths(viewDate, 1), effectiveMax);

  const dropdown = open ? (
    <div
      id="calendar-portal"
      style={{
        position: 'absolute',
        top: dropdownPos.top,
        left: dropdownPos.left,
        width: 288,
        zIndex: 9999,
      }}
      // Prevent mousedown from bubbling to document (which would close the calendar)
      onMouseDown={e => e.stopPropagation()}
    >
      <div
        style={{
          background: 'hsl(240 10% 12%)',
          border: '1px solid hsl(240 5% 26% / 0.3)',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Month Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button
            onClick={handlePrevMonth}
            style={{
              padding: '6px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: 'transparent', color: 'hsl(252 100% 80%)',
              display: 'flex', alignItems: 'center',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_left</span>
          </button>

          <span style={{ fontSize: 14, fontWeight: 700, color: 'hsl(240 5% 96%)' }}>
            {format(viewDate, 'MMMM yyyy')}
          </span>

          <button
            onClick={handleNextMonth}
            disabled={!canGoNext}
            style={{
              padding: '6px', borderRadius: '8px', border: 'none',
              cursor: canGoNext ? 'pointer' : 'not-allowed',
              background: 'transparent',
              color: canGoNext ? 'hsl(252 100% 80%)' : 'hsl(240 5% 40%)',
              display: 'flex', alignItems: 'center',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_right</span>
          </button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
          {DAYS.map(d => (
            <div key={d} style={{
              textAlign: 'center', fontSize: 10, fontWeight: 900,
              textTransform: 'uppercase', letterSpacing: '0.1em',
              color: 'hsl(240 5% 55%)', padding: '4px 0'
            }}>
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px 0' }}>
          {allDays.map((d, i) => {
            const inMonth = isSameMonth(d, viewDate);
            const selected = isSameDay(d, value);
            const isToday = isSameDay(d, today);
            const disabled = isDisabled(d);

            let bg = 'transparent';
            let color = 'hsl(240 5% 55%)';
            let border = 'none';
            let cursor = disabled ? 'not-allowed' : 'pointer';
            let opacity = disabled ? 0.3 : 1;

            if (!inMonth) {
              color = 'hsl(240 5% 35%)';
              opacity = disabled ? 0.2 : 0.5;
            } else if (selected) {
              bg = 'hsl(252 100% 67%)';
              color = '#fff';
              opacity = 1;
            } else if (isToday) {
              border = '1px solid hsl(252 100% 67% / 0.6)';
              color = 'hsl(252 100% 80%)';
            } else {
              color = 'hsl(240 5% 90%)';
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(d)}
                disabled={disabled}
                style={{
                  aspectRatio: '1',
                  width: '100%',
                  background: bg,
                  color,
                  border,
                  borderRadius: '8px',
                  fontSize: 12,
                  fontWeight: selected ? 800 : 500,
                  cursor,
                  opacity,
                  transition: 'all 0.15s ease',
                  outline: 'none',
                  padding: 0,
                  lineHeight: 1,
                }}
                onMouseEnter={e => {
                  if (!disabled && !selected) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'hsl(252 100% 67% / 0.15)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'hsl(252 100% 80%)';
                  }
                }}
                onMouseLeave={e => {
                  if (!disabled && !selected) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = inMonth ? 'hsl(240 5% 90%)' : 'hsl(240 5% 35%)';
                  }
                }}
              >
                {format(d, 'd')}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 12, paddingTop: 12,
          borderTop: '1px solid hsl(240 5% 20%)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <button
            onClick={() => { onChange(today); setOpen(false); }}
            style={{
              fontSize: 10, fontWeight: 900, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'hsl(252 100% 80%)',
              background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            Today
          </button>
          <span style={{ fontSize: 10, color: 'hsl(240 5% 45%)', fontWeight: 500 }}>
            {format(value, 'EEE, dd MMM yyyy')}
          </span>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        onClick={() => open ? setOpen(false) : openCalendar()}
        className="flex items-center gap-3 bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-2 text-sm text-on-surface hover:border-primary/40 transition-all focus:outline-none focus:ring-1 focus:ring-primary w-full"
      >
        <span className="material-symbols-outlined text-primary" style={{ fontSize: 18 }}>calendar_today</span>
        <span style={{ flex: 1, textAlign: 'left', fontWeight: 500 }}>{format(value, 'dd MMM yyyy')}</span>
        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 16 }}>
          {open ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
        </span>
      </button>

      {/* Render dropdown via portal — breaks out of any overflow:hidden parent */}
      {ReactDOM.createPortal(dropdown, document.body)}
    </div>
  );
};
