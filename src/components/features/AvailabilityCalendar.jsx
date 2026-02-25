import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import "./AvailabilityCalendar.css";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/**
 * AvailabilityCalendar
 *
 * Props:
 *   selectionId  — ID to fetch booked dates for
 *   selectable   — (optional) enable click-to-select date range
 *   selectedStart — controlled start date string "YYYY-MM-DD"
 *   selectedEnd   — controlled end date string "YYYY-MM-DD"
 *   onRangeChange — callback({ start, end }) when range changes (selectable mode)
 */
const AvailabilityCalendar = ({
  selectionId,
  selectable = false,
  selectedStart = "",
  selectedEnd = "",
  onRangeChange,
  extraBookedRanges = [],
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [bookedRanges, setBookedRanges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Internal pick state for selectable mode
  const [pickStep, setPickStep] = useState("start"); // "start" | "end"

  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          `/order/availability?selectionId=${selectionId}`,
        );
        const orders = response.data.data || [];
        const ranges = orders
          .filter((o) => o.deliver_date || o.receive_date)
          .map((o) => ({
            start: o.deliver_date ? new Date(o.deliver_date) : null,
            end: o.receive_date ? new Date(o.receive_date) : null,
          }))
          .filter((r) => r.start || r.end);
        setBookedRanges(ranges);
      } catch {
        setBookedRanges([]);
      } finally {
        setLoading(false);
      }
    };
    if (selectionId) fetchBookedDates();
  }, [selectionId]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  const allBookedRanges = [...bookedRanges, ...extraBookedRanges];

  const isBooked = (date) =>
    allBookedRanges.some(({ start, end }) => {
      if (start && end) return date >= start && date <= end;
      if (start) return date.toDateString() === start.toDateString();
      if (end) return date.toDateString() === end.toDateString();
      return false;
    });

  const isToday = (date) => date.toDateString() === today.toDateString();
  const isPast = (date) => date < today && !isToday(date);

  // Selected range helpers
  const selStart = selectedStart ? new Date(selectedStart) : null;
  const selEnd = selectedEnd ? new Date(selectedEnd) : null;

  const isSelStart = (date) =>
    selStart && date.toDateString() === selStart.toDateString();
  const isSelEnd = (date) =>
    selEnd && date.toDateString() === selEnd.toDateString();
  const isInSelRange = (date) =>
    selStart && selEnd && date > selStart && date < selEnd;

  const handleDayClick = (date) => {
    if (!selectable) return;
    if (isPast(date) || isBooked(date)) return;

    const ds = toDateStr(date);

    if (pickStep === "start") {
      onRangeChange?.({ start: ds, end: "" });
      setPickStep("end");
    } else {
      // Ensure end is after start
      if (selStart && date <= selStart) {
        // treat as new start
        onRangeChange?.({ start: ds, end: "" });
        setPickStep("end");
      } else {
        onRangeChange?.({ start: selectedStart, end: ds });
        setPickStep("start");
      }
    }
  };

  // Build grid
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(currentYear, currentMonth, d);
    dt.setHours(0, 0, 0, 0);
    cells.push(dt);
  }

  return (
    <div className="avail-calendar">
      <div className="avail-cal-header">
        <div className="avail-cal-title">
          <CalendarDays size={18} />
          <span>{selectable ? "Select Dates" : "Availability"}</span>
        </div>
        <div className="avail-cal-nav">
          <button type="button" onClick={prevMonth} className="cal-nav-btn">
            <ChevronLeft size={16} />
          </button>
          <span className="cal-month-label">
            {MONTHS[currentMonth]} {currentYear}
          </span>
          <button type="button" onClick={nextMonth} className="cal-nav-btn">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {selectable &&
        (() => {
          const fmt = (ds) => {
            if (!ds) return "";
            const d = new Date(ds + "T12:00:00"); // noon to avoid tz shift
            return d.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          };
          const msg = !selectedStart
            ? "📅 Click a date to set Delivery Date"
            : !selectedEnd
              ? "📅 Now click Return Date"
              : `✅ ${fmt(selectedStart)}  →  ${fmt(selectedEnd)}`;
          return <div className="avail-cal-pick-hint">{msg}</div>;
        })()}

      {loading ? (
        <div className="cal-loading">Loading calendar…</div>
      ) : (
        <>
          <div className="avail-cal-days-header">
            {DAYS.map((d) => (
              <div key={d} className="cal-day-name">
                {d}
              </div>
            ))}
          </div>
          <div className="avail-cal-grid">
            {cells.map((date, idx) => {
              if (!date)
                return <div key={`empty-${idx}`} className="cal-cell empty" />;
              const booked = isBooked(date);
              const past = isPast(date);
              const todayCell = isToday(date);
              const selStart_ = isSelStart(date);
              const selEnd_ = isSelEnd(date);
              const inRange = isInSelRange(date);
              const clickable = selectable && !past && !booked;

              return (
                <div
                  key={idx}
                  className={[
                    "cal-cell",
                    booked ? "booked" : "available",
                    past ? "past" : "",
                    todayCell ? "today" : "",
                    selStart_ ? "sel-start" : "",
                    selEnd_ ? "sel-end" : "",
                    inRange ? "in-sel-range" : "",
                    clickable ? "clickable" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handleDayClick(date)}
                  title={
                    booked
                      ? "Already booked"
                      : past
                        ? "Past date"
                        : selectable
                          ? pickStep === "start"
                            ? "Set as delivery date"
                            : "Set as return date"
                          : ""
                  }
                >
                  {date.getDate()}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default AvailabilityCalendar;
