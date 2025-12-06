import React, { useState, useEffect, useRef, useCallback } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import "./DateRangePicker.css";

const DateRangePicker = ({
  onDateChange,
  placeholder = "Select date range",
  requireApply = false,
  autoCloseOnSelect = true,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);
  const [dropdownPosition, setDropdownPosition] = useState("bottom");
  const [hoverDate, setHoverDate] = useState(null);
  const containerRef = useRef(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // useCallback-ஐ பயன்படுத்தி onDateChange-ஐ memoize செய்யவும்
  const memoizedOnDateChange = useCallback((dateRange) => {
    if (onDateChange) {
      onDateChange(dateRange);
    }
  }, [onDateChange]);

  // Close when clicking outside the component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showCalendar]);

  // Calculate dropdown position (top or bottom) based on available space
  useEffect(() => {
    const calculatePosition = () => {
      if (containerRef.current && showCalendar) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        if (spaceBelow >= 400 || spaceBelow >= spaceAbove) setDropdownPosition("bottom");
        else setDropdownPosition("top");
      }
    };
    if (showCalendar) {
      calculatePosition();
      window.addEventListener("resize", calculatePosition);
      window.addEventListener("scroll", calculatePosition, true);
    }
    return () => {
      window.removeEventListener("resize", calculatePosition);
      window.removeEventListener("scroll", calculatePosition, true);
    };
  }, [showCalendar]);

  // FIX: Remove the problematic useEffect completely
  // useEffect(() => {
  //   if (!requireApply && startDate && endDate && memoizedOnDateChange) {
  //     memoizedOnDateChange({ startDate, endDate });
  //   }
  // }, [startDate, endDate, memoizedOnDateChange, requireApply]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear(), month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDayOfWeek: firstDay.getDay() };
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day, monthOffset) => {
    const selectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + monthOffset,
      day
    );

    if (selectingStart) {
      setStartDate(selectedDate);
      setEndDate(null);
      setSelectingStart(false);
      setHoverDate(null);
      return;
    }

    // selecting end
    if (!startDate) {
      setStartDate(selectedDate);
      setSelectingStart(false);
      setHoverDate(null);
      return;
    }

    let finalStart = startDate;
    let finalEnd = selectedDate;

    if (selectedDate < startDate) {
      finalStart = selectedDate;
      finalEnd = startDate;
      setStartDate(selectedDate);
      setEndDate(startDate);
    } else {
      setEndDate(selectedDate);
    }

    setSelectingStart(true);
    setHoverDate(null);

    // FIX: Always call onDateChange when both dates are selected
    if (memoizedOnDateChange) {
      memoizedOnDateChange({ 
        startDate: finalStart, 
        endDate: finalEnd 
      });
    }

    if (autoCloseOnSelect) {
      setShowCalendar(false);
    }
  };

  // Handle mouse enter on date cells
  const handleDateHover = (day, monthOffset) => {
    if (!selectingStart && startDate) {
      const hoveredDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + monthOffset,
        day
      );
      setHoverDate(hoveredDate);
    }
  };

  // Handle mouse leave from calendar
  const handleCalendarMouseLeave = () => {
    setHoverDate(null);
  };

  // Check if date is in potential range (during hover)
  const isDateInPotentialRange = (day, monthOffset) => {
    if (!startDate || !hoverDate || selectingStart) return false;
    
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, day);
    
    if (hoverDate >= startDate) {
      return date > startDate && date < hoverDate;
    } else {
      return date < startDate && date > hoverDate;
    }
  };

  // Check if date is in actual selected range
  const isDateInRange = (day, monthOffset) => {
    if (!startDate || !endDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, day);
    return date > startDate && date < endDate;
  };

  const isDateSelected = (day, monthOffset) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, day);
    return (startDate && date.toDateString() === startDate.toDateString()) ||
           (endDate && date.toDateString() === endDate.toDateString());
  };

  const formatDate = (date) => {
    if (!date) return "";
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleClear = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setStartDate(null);
    setEndDate(null);
    setSelectingStart(true);
    setHoverDate(null);
    if (memoizedOnDateChange) memoizedOnDateChange({ startDate: null, endDate: null });
    setShowCalendar(false);
  };

  const handleApply = () => {
    if (memoizedOnDateChange) memoizedOnDateChange({ startDate, endDate });
    setShowCalendar(false);
  };

  const getDropdownClass = () => `date-range-picker-calendar ${dropdownPosition}`;

  const renderCalendar = (monthOffset = 0) => {
    const displayMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset);
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(displayMonth);
    const days = [];
    const prevMonthDays = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 0).getDate();

    // previous month fillers
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push(
        <div key={`prev-${monthOffset}-${i}`} className="date-range-picker-day other-month">
          {prevMonthDays - i}
        </div>
      );
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const selected = isDateSelected(d, monthOffset);
      const inRange = isDateInRange(d, monthOffset);
      const inPotentialRange = isDateInPotentialRange(d, monthOffset);
      
      let cls = "date-range-picker-day";
      if (selected) cls += " selected";
      else if (inRange) cls += " in-range";
      else if (inPotentialRange) cls += " potential-range";

      days.push(
        <div
          key={`${monthOffset}-${d}`}
          onClick={() => handleDateClick(d, monthOffset)}
          onMouseEnter={() => handleDateHover(d, monthOffset)}
          className={cls}
        >
          {d}
        </div>
      );
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(<div key={`next-${monthOffset}-${i}`} className="date-range-picker-day other-month">{i}</div>);
    }

    return (
      <div className="date-range-picker-month" key={`m-${monthOffset}`}>
        <div className="date-range-picker-nav">
          {monthOffset === 0 && (
            <button onClick={handlePrevMonth} className="date-range-picker-nav-button" aria-label="Previous month">
              <Icon icon="icon-park-outline:left" />
            </button>
          )}
          <div className="date-range-picker-month-year">
            {months[displayMonth.getMonth()].slice(0, 3)} {displayMonth.getFullYear()}
          </div>
          {monthOffset === 1 && (
            <button onClick={handleNextMonth} className="date-range-picker-nav-button" aria-label="Next month">
              <Icon icon="icon-park-outline:right" />
            </button>
          )}
        </div>

        <div className="date-range-picker-grid">
          {["S","M","T","W","T","F","S"].map((n, i) => (
            <div key={`${n}-${i}`} className="date-range-picker-weekday">{n}</div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="date-range-picker-container" ref={containerRef}>
      <div
        className="date-range-picker-trigger"
        onClick={() => setShowCalendar((s) => !s)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setShowCalendar(s => !s); }}
        aria-label="Toggle date range picker"
      >
        <Icon icon="solar:calendar-bold" className="date-range-picker-icon" />
        <div className="d-flex align-items-center gap-2 flex-grow-1 date-range-text-wrap">
          <span className={startDate ? "date-range-picker-date-text selected" : "date-range-picker-date-text"}>
            {startDate ? formatDate(startDate) : "Start"}
          </span>

          <Icon icon="solar:arrow-right-linear" className="date-range-picker-arrow-icon" />

          <span className={endDate ? "date-range-picker-date-text selected" : "date-range-picker-date-text"}>
            {endDate ? formatDate(endDate) : "End"}
          </span>
        </div>

        {(startDate || endDate) && (
          <button
            className="date-range-picker-clear"
            onClick={handleClear}
            title="Clear dates"
            aria-label="Clear dates"
          >
            <Icon icon="ic:round-close" />
          </button>
        )}

        <Icon icon={showCalendar ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"} className="date-range-picker-arrow-toggle" />
      </div>

      {showCalendar && (
        <div 
          className={getDropdownClass()}
          onMouseLeave={handleCalendarMouseLeave}
        >
          <div className="date-range-picker-calendar-body">
            {renderCalendar(0)}
            <div className="date-range-picker-divider"></div>
            {renderCalendar(1)}
          </div>

          <div className="date-range-picker-footer">
            {requireApply && (
              <button
                className="date-range-picker-button date-range-picker-button-apply"
                onClick={handleApply}
                disabled={!startDate || !endDate}
              >
                Apply
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;