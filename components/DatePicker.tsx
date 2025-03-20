"use client";

import * as React from "react";
import { format, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date: Date | undefined;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
}

const DatePickerShadCN = ({ date, setDate }: DatePickerProps) => {
  // If no date is provided, default to the current date for display.
  const currentDate = new Date();
  const displayDate = date && isValid(date) ? date : currentDate;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "justify-start text-left font-normal border-dark-500 bg-dark-400",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {/* Display the formatted date. If no date was set, show the current date */}
          {isValid(displayDate) ? (
            format(displayDate, "dd MMMM")
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          // Use the displayDate to show the current date if no value exists.
          selected={displayDate}
          onSelect={(selectedDate) => {
            // Update the form value only if a valid date is selected.
            if (selectedDate && isValid(selectedDate)) {
              setDate(selectedDate);
            }
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePickerShadCN;
