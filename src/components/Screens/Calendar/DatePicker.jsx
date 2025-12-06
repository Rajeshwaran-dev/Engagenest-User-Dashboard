import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import "./DatePicker.css";

const DatePicker = ({ onDateChange, placeholder = "Select date" }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const shortMonths = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);

  // Notify parent component when date changes
  useEffect(() => {
    if (onDateChange) {
      onDateChange(selectedDate);
    }
  }, [selectedDate, onDateChange]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const handleDateClick = (day) => {
    const newSelectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    setSelectedDate(newSelectedDate);
    setShowCalendar(false);
  };

  const formatDate = (date) => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDisplayDate = (date) => {
    if (!date) return "";
    return `${date.getDate()} ${shortMonths[date.getMonth()]} ${date.getFullYear()}`;
  };

  const isDateSelected = (day) => {
    if (!selectedDate) return false;
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleClear = () => {
    setSelectedDate(null);
    if (onDateChange) {
      onDateChange(null);
    }
  };

  const handleApply = () => {
    setShowCalendar(false);
  };

  const renderCalendar = () => {
    const displayMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth()
    );
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(displayMonth);

    const days = [];
    const prevMonthDays = new Date(
      displayMonth.getFullYear(),
      displayMonth.getMonth(),
      0
    ).getDate();

    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push(
        <div
          key={`prev-${i}`}
          className="date-picker-day other-month"
        >
          {prevMonthDays - i}
        </div>
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = isDateSelected(day);

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`date-picker-day ${isSelected ? "selected" : ""}`}
        >
          {day}
        </div>
      );
    }

    // Next month days to fill the grid
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <div
          key={`next-${i}`}
          className="date-picker-day other-month"
        >
          {i}
        </div>
      );
    }

    return (
      <div className="date-picker-calendar-body">
        <div className="date-picker-nav">
          <button
            onClick={handlePrevMonth}
            className="date-picker-nav-button"
          >
            <Icon icon="icon-park-outline:left" />
          </button>
          <div className="date-picker-month-year">
            {months[displayMonth.getMonth()]} {displayMonth.getFullYear()}
          </div>
          <button
            onClick={handleNextMonth}
            className="date-picker-nav-button"
          >
            <Icon icon="icon-park-outline:right" />
          </button>
        </div>

        <div className="date-picker-grid">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
            <div
              key={`${day}-${idx}`}
              className="date-picker-weekday"
            >
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="date-picker-container" ref={calendarRef}>
      <div
        className="date-picker-trigger"
        onClick={() => setShowCalendar(!showCalendar)}
      >
        <Icon
          icon="solar:calendar-bold"
          className="date-picker-icon"
        />
        <div className="flex-grow-1">
          <span className={selectedDate ? "date-picker-selected-text" : "date-picker-placeholder"}>
            {selectedDate ? formatDate(selectedDate) : placeholder}
          </span>
        </div>
        <Icon
          icon={
            showCalendar
              ? "solar:alt-arrow-up-linear"
              : "solar:alt-arrow-down-linear"
          }
          className="date-picker-arrow-icon"
        />
      </div>

      {/* Calendar Dropdown */}
      {showCalendar && (
        <div className="date-picker-calendar">

          {/* Calendar Grid */}
          <div style={{ backgroundColor: "#fafafa" }}>
            {renderCalendar()}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;