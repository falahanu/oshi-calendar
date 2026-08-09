import { groupEvents } from "../../../shared/groupEvents";
import { useEffect, useState } from "react";
import { oshi } from "./config/oshi";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import jaLocale from "@fullcalendar/core/locales/ja";

import "./App.css";

function App() {

  const [data, setData] = useState<any>(null);

  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {

    fetch(`./events_public.json?t=${Date.now()}`)
      .then(res => res.json())
      .then(json => {

        console.log(json);

        setData(json);

      });

  }, []);

  const lastUpdate = data?.lastUpdate
    ? new Date(data.lastUpdate).toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "";

  const groupedEvents = groupEvents(data?.events ?? []);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>

      <h1>
        {oshi.icon} {oshi.name} イベントカレンダー
      </h1>
      <div style={{ marginBottom: 20 }}>

        最終更新：{lastUpdate}

        <br />

        公開期間：
        {data?.from ?? ""} ～ {data?.to ?? ""}
        <div style={{ marginBottom: 20 }}>

          イベント件数：{groupedEvents.length}件

        </div>

      </div>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 30,
          textAlign: "center"
        }}
      >

        <FullCalendar
          eventClick={(info) => {

            const event = groupedEvents.find(
              (e: any) =>
                (e.id || `${e.date}-${e.title}`) === info.event.id
            );

            setSelectedEvent(event);

          }}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={jaLocale}
          height="auto"
          eventDisplay="block"
          fixedWeekCount={false}

          events={groupedEvents.map((event: any) => ({

            id: event.id || `${event.date}-${event.title}`,

            title: event.title,

            date: event.date,

            backgroundColor:
              event.category === "ライブ"
                ? "#ef4444"
                : event.category === "テレビ"
                  ? "#3b82f6"
                  : event.category === "ラジオ"
                    ? "#22c55e"
                    : event.category === "チケット"
                      ? "#f59e0b"
                      : "#8b5cf6",

            borderColor:
              event.category === "ライブ"
                ? "#ef4444"
                : event.category === "テレビ"
                  ? "#3b82f6"
                  : event.category === "ラジオ"
                    ? "#22c55e"
                    : event.category === "チケット"
                      ? "#f59e0b"
                      : "#8b5cf6",

          }))
          }


        />
        {selectedEvent && (

          <div
            style={{
              marginTop: 30,
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 2px 6px rgba(0,0,0,.08)"
            }}
          >

            <div
              style={{
                display: "inline-block",
                padding: "4px 10px",
                borderRadius: 20,
                background: "#F3F4F6",
                fontWeight: "bold",
                marginBottom: 10
              }}
            >
              {selectedEvent.category}
            </div>

            <h2>{selectedEvent.title}</h2>

            <p>📅 {selectedEvent.date}</p>

            {selectedEvent.detail && (
              <p>🕐 {selectedEvent.detail}</p>
            )}

            <p>📍 {selectedEvent.place}</p>

            <p>👥 {selectedEvent.performers}</p>

            <p>
              🌐{" "}

              {selectedEvent.sources?.map((s: any, index: number) => (

                <span key={index}>

                  {index > 0 && " ・ "}

                  {s.url ? (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: "#2563eb",
                        textDecoration: "none",
                        fontWeight: "bold"
                      }}
                    >
                      {s.source}
                    </a>
                  ) : (
                    <span>
                      {s.source}
                    </span>
                  )}

                </span>

              ))}
            </p>

          </div>

        )}
      </div>

    </div>
  );
}

export default App;