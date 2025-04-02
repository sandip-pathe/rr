"use client";

import * as React from "react";
import { format, isValid, parseISO } from "date-fns";
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
  date?: Date | string; // Allow both Date and string (ISO format)
  setDate: (date: Date | undefined) => void; // Ensure correct type
}

const DatePickerShadCN = ({ date, setDate }: DatePickerProps) => {
  const parsedDate =
    typeof date === "string" ? parseISO(date) : date ?? new Date(); // Handle string dates

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal border-dark-500 bg-dark-400",
            !parsedDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {isValid(parsedDate) ? format(parsedDate, "dd MMMM") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={isValid(parsedDate) ? parsedDate : undefined}
          onSelect={(selectedDate) =>
            setDate(isValid(selectedDate) ? selectedDate : undefined)
          }
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePickerShadCN;
