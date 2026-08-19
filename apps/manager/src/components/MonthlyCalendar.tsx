import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type Event = {
  date: string;
  artist: string;
  category: string;
  title: string;
  detail: string;
  url: string;
};

type Props = {
  events: Event[];
};

export default function MonthlyCalendar({ events }: Props) {
  return (
    <Calendar
      tileContent={({ date, view }) => {
        if (view !== "month") return null;

        const event = events.find((e) => {
          const eventDate = new Date(e.date);

          return (
            eventDate.getFullYear() === date.getFullYear() &&
            eventDate.getMonth() === date.getMonth() &&
            eventDate.getDate() === date.getDate()
          );
        });

        return event ? (
          <div style={{ fontSize: "12px" }}>
            {event.category}
          </div>
        ) : null;
      }}
    />
  );
}