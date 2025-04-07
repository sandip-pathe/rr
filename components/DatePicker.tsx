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
  date?: Date | string;
  setDate: (date: Date | undefined) => void;
}

const DatePickerShadCN = React.memo(({ date, setDate }: DatePickerProps) => {
  const parsedDate = React.useMemo(() => {
    if (!date) return undefined;
    return typeof date === "string" ? parseISO(date) : date;
  }, [date]);

  const formattedDate = React.useMemo(() => {
    return parsedDate && isValid(parsedDate)
      ? format(parsedDate, "dd MMMM")
      : "Pick a date";
  }, [parsedDate]);

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
          {formattedDate}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={parsedDate && isValid(parsedDate) ? parsedDate : undefined}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
});

DatePickerShadCN.displayName = "DatePickerShadCN";

export default DatePickerShadCN;
