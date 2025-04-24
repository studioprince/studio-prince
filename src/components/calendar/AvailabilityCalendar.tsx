
import { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { dbService } from '@/services/database';

const AvailabilityCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  useEffect(() => {
    // Get available dates for the selected month and year
    const dates = dbService.getAvailableDates(selectedMonth, selectedYear);
    setAvailableDates(dates);
  }, [selectedMonth, selectedYear]);
  
  const handleMonthChange = (date: Date) => {
    setSelectedMonth(date.getMonth());
    setSelectedYear(date.getFullYear());
  };
  
  // Helper to check if a date is available
  const isDateAvailable = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return availableDates.includes(dateString);
  };
  
  // Custom day rendering function
  const renderDay = (day: Date) => {
    const isAvailable = isDateAvailable(day);
    
    return (
      <div className="relative">
        <span>{day.getDate()}</span>
        {isAvailable && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></div>
        )}
      </div>
    );
  };
  
  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    
    // Here you would typically do something with the selected date
    // like allowing the user to choose a time slot
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      const isAvailable = availableDates.includes(dateString);
      
      if (!isAvailable) {
        alert("Sorry, this date is not available for booking.");
      } else {
        // Show time slots or proceed with booking
        console.log("Date selected:", dateString);
      }
    }
  };
  
  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="font-medium text-lg mb-4">Available Dates</h3>
      
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          onMonthChange={handleMonthChange}
          className="rounded-md border"
          components={{
            DayContent: (props) => renderDay(props.date)
          }}
        />
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-2">
          Dates with green dots are available for booking.
        </p>
        
        {date && isDateAvailable(date) && (
          <button className="btn-primary mt-2">
            Book for {date.toLocaleDateString()}
          </button>
        )}
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
