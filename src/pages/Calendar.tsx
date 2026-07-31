import MonthlyCalendar from "../components/MonthlyCalendar"; import { useEffect, useState } from "react";

type Event = {
  date: string;
  artist: string;
  category: string;
  title: string;
  detail: string;
  url: string;
};

export default function Calendar() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetch("https://script.google.com/macros/s/AKfycbw8N96LIXRrtqoWi0FgDYD4HDAjZluEviiq3dMx5m9npOJ3CnvhxgwUPswddlCt_Kq5Sw/exec")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setEvents(data);
      });
  }, []);

  return (
    <div>
      <h2>📅 カレンダー</h2>
      <MonthlyCalendar events={events} />
      {events.map((event, index) => (
        <div className="event-card" key={index}>
          <div>{event.date}</div>

          <div>{event.artist}</div>

          <div>{event.category}</div>

          <h3>{event.title}</h3>

          <p>{event.detail}</p>

          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            公式サイトを見る
          </a>
        </div>
      ))}
    </div>
  );
}