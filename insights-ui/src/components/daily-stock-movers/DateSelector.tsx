'use client';

import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './datepicker-custom.css';
import { Calendar } from 'lucide-react';

interface DateSelectorProps {
  selectedDate: Date;
  availableDates: Date[];
  minDate: Date;
  maxDate: Date;
  onChange: (date: Date) => void;
}

export default function DateSelector({ selectedDate, availableDates, minDate, maxDate, onChange }: DateSelectorProps) {
  // Create a set of available date strings for quick lookup
  const availableDateStrings = new Set(availableDates.map((d) => d.toISOString().split('T')[0]));

  // Function to check if a date should be disabled
  const isDateDisabled = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    // Disable if not in available dates (this handles weekends and missing data automatically)
    return !availableDateStrings.has(dateStr);
  };

  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-muted-foreground link-color" />
        <label className="text-sm font-medium text-color">Select Date:</label>
      </div>
      <div className="relative">
        <DatePicker
          selected={selectedDate}
          onChange={(date: Date | null) => date && onChange(date)}
          minDate={minDate}
          maxDate={maxDate}
          filterDate={(date) => !isDateDisabled(date)}
          dateFormat="MMM dd, yyyy"
          className="px-4 py-2 border border-color rounded-md background-color text-color focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          calendarClassName="dark:bg-gray-800 dark:border-gray-700"
          showPopperArrow={false}
        />
      </div>
    </div>
  );
}
