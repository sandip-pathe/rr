"use client";

import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
  const [events, setEvents] = useState([
    {
      title: "Meeting with Team",
      allDay: false,
      start: new Date(2024, 10, 19, 10, 0),
      end: new Date(2024, 10, 19, 11, 0),
    },
    {
      title: "Doctor Appointment",
      allDay: false,
      start: new Date(2024, 10, 14, 14, 30),
      end: new Date(2024, 10, 14, 15, 30),
    },
    {
      title: "Project Deadline",
      allDay: true,
      start: new Date(2024, 10, 25),
      end: new Date(2024, 10, 25),
    },
    {
      title: "Workshop on AI",
      allDay: false,
      start: new Date(2024, 10, 26, 9, 0),
      end: new Date(2024, 10, 26, 12, 0),
    },
  ]);

  // Function to handle new event creation
  const handleSelectSlot = ({ start, end, allDay }: any) => {
    const title = window.prompt("Create New Event");
    if (title) {
      setEvents([
        ...events,
        {
          start,
          end,
          title,
          allDay,
        },
      ]);
    }
  };

  return (
    <div className="h-screen">
      <Calendar
        className="bg-white"
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%", color: "black" }}
        defaultView="week"
        views={["week", "day", "agenda", "work_week"]}
        selectable={true} // Enables selecting time slots for new events
        onSelectSlot={handleSelectSlot} // Event for creating new events
        popup={true} // Shows details of event in popup
        step={30} // Time interval for slots (in minutes)
        timeslots={2} // Number of slots per hour (2 slots per hour means 30 minutes per slot)
      />
    </div>
  );
};

export default MyCalendar;
