import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const DateTimePicker = ({ onDateTimeChange, placeholder = "Select date and time" }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [activeTab, setActiveTab] = useState("date"); // "date" or "time"
    const [dropdownPosition, setDropdownPosition] = useState("bottom");
    const pickerRef = useRef(null);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];

    const shortMonths = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    // Close picker when clicking outside and calculate position
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setShowPicker(false);
            }
        };

        const calculatePosition = () => {
            if (pickerRef.current && showPicker) {
                const rect = pickerRef.current.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;
                
                // If there's more space below or equal space, show below
                // Otherwise show above
                if (spaceBelow >= 300 || spaceBelow >= spaceAbove) {
                    setDropdownPosition("bottom");
                } else {
                    setDropdownPosition("top");
                }
            }
        };

        if (showPicker) {
            document.addEventListener("mousedown", handleClickOutside);
            calculatePosition();
            window.addEventListener("resize", calculatePosition);
            window.addEventListener("scroll", calculatePosition);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("resize", calculatePosition);
            window.removeEventListener("scroll", calculatePosition);
        };
    }, [showPicker]);

    // Notify parent component when date/time changes
    useEffect(() => {
        if (onDateTimeChange) {
            onDateTimeChange({
                date: selectedDate,
                time: selectedTime,
                datetime: selectedDate && selectedTime ?
                    new Date(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth(),
                        selectedDate.getDate(),
                        selectedTime.getHours(),
                        selectedTime.getMinutes()
                    ) : null
            });
        }
    }, [selectedDate, selectedTime, onDateTimeChange]);

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
        setActiveTab("time");
    };

    const handleTimeClick = (hours, minutes) => {
        const newSelectedTime = new Date();
        newSelectedTime.setHours(hours, minutes, 0, 0);
        setSelectedTime(newSelectedTime);
    };

    const formatDate = (date) => {
        if (!date) return "";
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${String(day).padStart(2, "0")}/${String(month).padStart(
            2,
            "0"
        )}/${year}`;
    };

    const formatTime = (time) => {
        if (!time) return "";
        const hours = time.getHours();
        const minutes = time.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${String(minutes).padStart(2, '0')} ${ampm}`;
    };

    const formatDisplayDateTime = () => {
        if (!selectedDate && !selectedTime) return "";
        if (selectedDate && !selectedTime) return formatDate(selectedDate);
        if (!selectedDate && selectedTime) return formatTime(selectedTime);
        return `${formatDate(selectedDate)} ${formatTime(selectedTime)}`;
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

    const isTimeSelected = (hours, minutes) => {
        if (!selectedTime) return false;
        return selectedTime.getHours() === hours && selectedTime.getMinutes() === minutes;
    };

    const handleClear = () => {
        setSelectedDate(null);
        setSelectedTime(null);
        setActiveTab("date");
        if (onDateTimeChange) {
            onDateTimeChange({ date: null, time: null, datetime: null });
        }
    };

    const handleApply = () => {
        setShowPicker(false);
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
                    className="text-center"
                    style={{
                        color: "#d0d0d0",
                        cursor: "default",
                        fontSize: "12px",
                        padding: "2px",
                    }}
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
                    className="text-center"
                    style={{
                        cursor: "pointer",
                        backgroundColor: isSelected ? "var(--primary)" : "transparent",
                        color: isSelected ? "white" : "#333",
                        fontWeight: isSelected ? "600" : "400",
                        borderRadius: "6px",
                        transition: "all 0.2s ease",
                        fontSize: "12px",
                        padding: "2px",
                        position: "relative",
                    }}
                    onMouseEnter={(e) => {
                        if (!isSelected) {
                            e.target.style.backgroundColor = "#f8f8f8";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isSelected) {
                            e.target.style.backgroundColor = "transparent";
                        }
                    }}
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
                    className="text-center"
                    style={{
                        color: "#d0d0d0",
                        cursor: "default",
                        fontSize: "12px",
                        padding: "2px",
                    }}
                >
                    {i}
                </div>
            );
        }
        return (
            <div style={{ padding: "6px", minWidth: "210px" }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <button
                        onClick={handlePrevMonth}
                        className="btn btn-sm border-0 p-0"
                        style={{
                            fontSize: "16px",
                            width: "28px",
                            height: "28px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#f8f8f8",
                            borderRadius: "6px",
                            color: "var(--primary)",
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--primary)";
                            e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#f8f8f8";
                            e.currentTarget.style.color = "var(--primary)";
                        }}
                    >
                        <Icon icon="icon-park-outline:left" />
                    </button>
                    <div
                        className=""
                        style={{
                            fontSize: "13px",
                            color: "var(--primary)",
                            flex: 1,
                            textAlign: "center",
                        }}
                    >
                        {months[displayMonth.getMonth()]} {displayMonth.getFullYear()}
                    </div>
                    <button
                        onClick={handleNextMonth}
                        className="btn btn-sm border-0 p-0"
                        style={{
                            fontSize: "16px",
                            width: "28px",
                            height: "28px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#f8f8f8",
                            borderRadius: "6px",
                            color: "var(--primary)",
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--primary)";
                            e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#f8f8f8";
                            e.currentTarget.style.color = "var(--primary)";
                        }}
                    >
                        <Icon icon="icon-park-outline:right" />
                    </button>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: "0px",
                    }}
                >
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                        <div
                            key={`${day}-${idx}`}
                            className="text-center"
                            style={{
                                fontSize: "12px",
                                fontWeight: "700",
                                padding: "4px 0",
                                color: "#fd0f0fff",
                            }}
                        >
                            {day}
                        </div>
                    ))}
                    {days}
                </div>
            </div>
        );
    };

    const renderTimePicker = () => {
        const timeSlots = [];

        // Generate time slots (every 30 minutes)
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = new Date();
                time.setHours(hour, minute, 0, 0);
                const isSelected = isTimeSelected(hour, minute);
                const displayHour = hour % 12 || 12;
                const ampm = hour >= 12 ? 'PM' : 'AM';

                timeSlots.push(
                    <div
                        key={`${hour}-${minute}`}
                        onClick={() => handleTimeClick(hour, minute)}
                        className="text-center"
                        style={{
                            cursor: "pointer",
                            backgroundColor: isSelected ? "var(--primary)" : "transparent",
                            color: isSelected ? "white" : "#333",
                            fontWeight: isSelected ? "600" : "400",
                            borderRadius: "6px",
                            transition: "all 0.2s ease",
                            fontSize: "12px",
                            padding: "2px",
                            margin: "2px",
                        }}
                        onMouseEnter={(e) => {
                            if (!isSelected) {
                                e.target.style.backgroundColor = "#f8f8f8";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isSelected) {
                                e.target.style.backgroundColor = "transparent";
                            }
                        }}
                    >
                        {`${displayHour}:${String(minute).padStart(2, '0')} ${ampm}`}
                    </div>
                );
            }
        }

        return (
            <div style={{ padding: "16px", minWidth: "210px", maxHeight: "200px", overflowY: "auto" }}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "0px",
                    }}
                >
                    {timeSlots}
                </div>
            </div>
        );
    };

    const getDropdownStyle = () => {
        const baseStyle = {
            position: "absolute",
            right: "0",
            zIndex: 1000,
            minWidth: "210px",
            border: "1.5px solid var(--primary)",
            overflow: "hidden",
        };

        if (dropdownPosition === "top") {
            return {
                ...baseStyle,
                bottom: "calc(100% + 8px)",
                top: "auto",
            };
        } else {
            return {
                ...baseStyle,
                top: "calc(100% + 8px)",
                bottom: "auto",
            };
        }
    };

    return (
        <div className="position-relative" ref={pickerRef}>
            <div
                className="d-flex align-items-center gap-2 px-3 py-2"
                style={{
                    cursor: "pointer",
                    minWidth: "240px",
                    backgroundColor: "white",
                    border: "1.5px solid rgb(224, 224, 224)",
                    borderRadius: "8px",
                    height: "44px",
                    transition: "all 0.2s ease",
                }}
                onClick={() => setShowPicker(!showPicker)}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#fd0f0fff";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary)";
                }}
            >
                <Icon
                    icon="solar:calendar-bold"
                    style={{ fontSize: "18px", color: "var(--primary)" }}
                />
                <div className="flex-grow-1">
                    <span
                        style={{
                            fontSize: "12px",
                            color: (selectedDate || selectedTime) ? "var(--primary)" : "#999",
                            fontWeight: (selectedDate || selectedTime) ? "600" : "400",
                        }}
                    >
                        {(selectedDate || selectedTime) ? formatDisplayDateTime() : placeholder}
                    </span>
                </div>
                <Icon
                    icon={
                        showPicker
                            ? "solar:alt-arrow-up-linear"
                            : "solar:alt-arrow-down-linear"
                    }
                    style={{ fontSize: "16px", color: "var(--primary)" }}
                />
            </div>

            {/* Picker Dropdown */}
            {showPicker && (
                <div
                    className="bg-white rounded shadow-lg"
                    style={getDropdownStyle()}
                >

                    {/* Tabs for Date/Time selection */}
                    <div className="d-flex border-bottom">
                        <button
                            className={`flex-grow-1 py-2 border-0 text-center ${activeTab === "date"
                                ? "bg-white text-var(--primary)"
                                : "bg-light text-#666"
                                }`}
                            style={{
                                fontSize: "12px",
                                fontWeight: "600",
                                transition: "all 0.2s ease",
                                borderBottom: activeTab === "date" ? "2px solid #fd0f0fff" : "none"
                            }}
                            onClick={() => setActiveTab("date")}
                        >
                            Date
                        </button>
                        <button
                            className={`flex-grow-1 py-2 border-0 text-center ${activeTab === "time"
                                ? "bg-white text-var(--primary)"
                                : "bg-light text-#666"
                                }`}
                            style={{
                                fontSize: "12px",
                                fontWeight: "600",
                                transition: "all 0.2s ease",
                                borderBottom: activeTab === "time" ? "2px solid #fd0f0fff" : "none"
                            }}
                            onClick={() => setActiveTab("time")}
                        >
                            Time
                        </button>
                    </div>

                    {/* Date/Time Picker Content */}
                    <div style={{ backgroundColor: "#fafafa" }}>
                        {activeTab === "date" ? renderCalendar() : renderTimePicker()}
                    </div>

                    {/* Footer Actions */}
                    <div
                        className="d-flex justify-content-end align-items-center gap-2 px-3 py-6"
                        style={{
                            borderTop: "1.5px solid #e8e8e8",
                            backgroundColor: "white",
                        }}
                    >
                        <button
                            className="btn btn-sm d-flex align-items-center gap-1"
                            style={{
                                border: "1.5px solid #e8e8e8",
                                padding: "4px 12px",
                                fontSize: "12px",
                                fontWeight: "600",
                                borderRadius: "6px",
                                color: "#666",
                                backgroundColor: "white",
                                transition: "all 0.2s ease",
                            }}
                            onClick={handleClear}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = "#fd0f0fff";
                                e.currentTarget.style.color = "#fd0f0fff";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "#e8e8e8";
                                e.currentTarget.style.color = "#666";
                            }}
                        >
                            <Icon icon="solar:restart-bold" style={{ fontSize: "14px" }} />
                            Clear
                        </button>
                        <button
                            className="btn btn-sm d-flex align-items-center gap-1"
                            style={{
                                padding: "4px 16px",
                                fontSize: "12px",
                                fontWeight: "600",
                                borderRadius: "6px",
                                backgroundColor: "#fd0f0fff",
                                color: "white",
                                border: "none",
                                transition: "all 0.2s ease",
                            }}
                            onClick={handleApply}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "var(--primary)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "#fd0f0fff";
                            }}
                        >
                            <Icon
                                icon="solar:check-circle-bold"
                                style={{ fontSize: "14px" }}
                            />
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateTimePicker;