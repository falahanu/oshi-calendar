import {
  getCategoryColor,
  getCategoryLightColor,
} from "../../../shared/categoryColors";
import { useEffect, useRef, useState } from "react";
import { oshi } from "./config/oshi";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import jaLocale from "@fullcalendar/core/locales/ja";

import "./App.css";

function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

function App() {
  const [data, setData] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(
    formatDate(new Date())
  );
  const [selectedEventId, setSelectedEventId] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [visitCount, setVisitCount] = useState<string>("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch(`./events_public.json?t=${Date.now()}`)
      .then((res) => res.json())
      .then((json) => {
        console.log(json);
        setData(json);
      });
  }, []);

  useEffect(() => {
    fetch(
      "https://falahanu.goatcounter.com/counter/TOTAL.json"
    )
      .then((res) => res.json())
      .then((json) => {
        console.log("GoatCounterアクセス数:", json.count);
        setVisitCount(json.count);
      })
      .catch((error) => {
        console.error(
          "GoatCounterアクセス数の取得に失敗:",
          error
        );
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

  const groupedEvents = data?.events ?? [];

  const filteredEvents =
    categoryFilter.length === 0
      ? groupedEvents
      : groupedEvents.filter((event: any) =>
        categoryFilter.includes(event.category)
      );

  const selectedEvents = filteredEvents.filter(
    (event: any) => event.date === selectedDate
  );

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: 20,
      }}
    >
      <h1>
        {oshi.icon} {oshi.name} イベントカレンダー
      </h1>

      <p
        style={{
          marginTop: 0,
          marginBottom: 16,
          color: "#555",
          fontSize: 14,
        }}
      >
        ヤーレンズさんの出演情報・ライブ・テレビ・ラジオなどをまとめたイベントカレンダーです。
      </p>

      {visitCount && (
        <div
          style={{
            display: "inline-block",
            marginBottom: 20,
            padding: "6px 12px",
            border: "1px solid #aaa",
            borderRadius: 4,
            background: "#f5f5f5",
            fontSize: 13,
            color: "#555",
            fontFamily: "monospace",
          }}
        >
          👣 {visitCount} HIT
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        最終更新：{lastUpdate}

        <br />

        公開期間：
        {data?.from ?? ""} ～ {data?.to ?? ""}

        <div style={{ marginBottom: 20 }}>
          イベント件数：{groupedEvents.length}件
        </div>

        <div
          style={{
            marginTop: 16,
            padding: "10px 14px",
            fontSize: 13,
            color: "#666",
            background: "#f9fafb",
            borderRadius: 8,
            lineHeight: 1.6,
          }}
        >
          個人的にスケジュールを確認するためにまとめています。
          情報に抜けや反映までのタイムラグがある場合がありますので、
          あくまで参考程度にご利用ください。
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        {["すべて", "ライブ", "テレビ", "ラジオ", "チケット"].map(
          (category) => (
            <button
              key={category}
              onClick={() => {
                if (category === "すべて") {
                  setCategoryFilter([]);
                  return;
                }

                if (categoryFilter.includes(category)) {
                  setCategoryFilter(
                    categoryFilter.filter(
                      (c) => c !== category
                    )
                  );
                } else {
                  setCategoryFilter([
                    ...categoryFilter,
                    category,
                  ]);
                }
              }}
              style={{
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",

                background:
                  category === "すべて"
                    ? categoryFilter.length === 0
                      ? "#2563eb"
                      : "#e5e7eb"
                    : categoryFilter.includes(category)
                      ? getCategoryColor(category)
                      : getCategoryLightColor(category),

                color:
                  category === "すべて"
                    ? categoryFilter.length === 0
                      ? "white"
                      : "black"
                    : categoryFilter.includes(category)
                      ? "white"
                      : getCategoryColor(category),
              }}
            >
              {category}
            </button>
          )
        )}
      </div>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 30,
          textAlign: "center",
        }}
      >
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={jaLocale}
          height="auto"
          eventDisplay="block"
          fixedWeekCount={false}

          events={filteredEvents.map((event: any) => ({
            id:
              event.id ||
              `${event.date}-${event.title}`,
            title: event.title,
            date: event.date,
            backgroundColor: getCategoryColor(
              event.category
            ),
            borderColor: getCategoryColor(
              event.category
            ),
          }))}

          dateClick={(info) => {
            setSelectedDate(info.dateStr);
          }}

          eventClick={(info) => {
            setSelectedDate(info.event.startStr);
            setSelectedEventId(info.event.id);

            setTimeout(() => {
              listRef.current?.scrollIntoView({
                behavior: "smooth",
              });
            }, 100);
          }}

          dayCellContent={(arg) => {
            const dateStr = formatDate(arg.date);

            return (
              <div
                style={{
                  width: 30,
                  height: 30,
                  margin: "0 auto",
                  borderRadius: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",

                  background:
                    dateStr === selectedDate
                      ? "#2563EB"
                      : arg.isToday
                        ? "#FDE68A"
                        : "transparent",

                  color:
                    dateStr === selectedDate
                      ? "white"
                      : "inherit",

                  fontWeight: "bold",
                }}
              >
                {arg.dayNumberText.replace("日", "")}
              </div>
            );
          }}
        />

        <div
          ref={listRef}
          style={{
            marginTop: 30,
            textAlign: "left",
          }}
        >
          <h2
            style={{
              fontSize: 22,
              fontWeight: "bold",
              marginBottom: 12,
            }}
          >
            イベント一覧（{selectedDate}）
          </h2>

          {selectedEvents.map((event: any) => (
            <div
              key={
                event.id ||
                `${event.date}-${event.title}`
              }
              style={{
                border:
                  (
                    event.id ||
                    `${event.date}-${event.title}`
                  ) === selectedEventId
                    ? `3px solid ${getCategoryColor(
                      event.category
                    )}`
                    : `1px solid ${getCategoryColor(
                      event.category
                    )}`,
                borderRadius: 14,
                padding: 18,
                marginBottom: 16,
                boxShadow:
                  "0 2px 6px rgba(0,0,0,.08)",
                background: "white",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  borderRadius: 20,
                  background:
                    getCategoryLightColor(
                      event.category
                    ),
                  fontWeight: "bold",
                  marginBottom: 10,
                }}
              >
                {event.category}
              </div>

              <div
                style={{
                  fontSize: 22,
                  fontWeight: "bold",
                  marginBottom: 12,
                }}
              >
                {event.title}
              </div>

              <div style={{ marginBottom: 6 }}>
                📅 {event.date}
              </div>

              {event.detail && (
                <div style={{ marginBottom: 6 }}>
                  🕐 {event.detail}
                </div>
              )}

              <div style={{ marginBottom: 6 }}>
                📍 {event.place}
              </div>

              <div style={{ marginBottom: 6 }}>
                👥 {event.performers}
              </div>

              <div style={{ marginBottom: 12 }}>
                🌐{" "}

                {event.sources?.map(
                  (
                    s: {
                      source: string;
                      url?: string;
                    },
                    index: number
                  ) => (
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
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          {s.source}
                        </a>
                      ) : (
                        <span>{s.source}</span>
                      )}
                    </span>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;