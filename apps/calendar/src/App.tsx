import {
  getCategoryColor,
  getCategoryLightColor,
} from "../../../shared/categoryColors";
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
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [visitCount, setVisitCount] = useState<string>("");

  useEffect(() => {
    fetch(`./events_public.json?t=${Date.now()}`)
      .then(res => res.json())
      .then(json => {
        console.log(json);
        setData(json);
      });
  }, []);

  useEffect(() => {
    fetch(
      "https://falahanu.goatcounter.com/counter/TOTAL.json"
    )
      .then(res => res.json())
      .then(json => {
        console.log("GoatCounterアクセス数:", json.count);
        setVisitCount(json.count);
      })
      .catch(error => {
        console.error("GoatCounterアクセス数の取得に失敗:", error);
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

  const today = new Date();

  const todayDate =
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const todayEvents = filteredEvents.filter(
    (event: any) => event.date === todayDate
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>

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
          👣 アクセス数：{visitCount}
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
                    categoryFilter.filter((c) => c !== category)
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
          eventClick={(info) => {
            const event = groupedEvents.find(
              (e: any) =>
                (e.id || `${e.date}-${e.title}`) === info.event.id
            );

            console.log("クリックしたイベント:", event);

            setSelectedEvent(event);
          }}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={jaLocale}
          height="auto"
          eventDisplay="block"
          fixedWeekCount={false}
          events={filteredEvents.map((event: any) => ({
            id: event.id || `${event.date}-${event.title}`,
            title: event.title,
            date: event.date,
            backgroundColor: getCategoryColor(event.category),
            borderColor: getCategoryColor(event.category),
          }))}
        />

        <div
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
            イベント一覧（今日）
          </h2>

          {todayEvents.length === 0 && (
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 20,
                textAlign: "center",
              }}
            >
              本日のイベントはありません
            </div>
          )}

          {todayEvents.map((event: any) => (
            <div
              key={
                event.id ||
                `${event.date}-${event.title}`
              }
              onClick={() => setSelectedEvent(event)}
              style={{
                border: `2px solid ${getCategoryColor(event.category)}`,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                cursor: "pointer",
                background: "white",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  borderRadius: 20,
                  background: getCategoryLightColor(event.category),
                  color: getCategoryColor(event.category),
                  fontWeight: "bold",
                  marginBottom: 8,
                }}
              >
                {event.category}
              </div>

              <div
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                {event.title}
              </div>

              <div style={{ marginTop: 6 }}>
                📅 {event.date}
              </div>
            </div>
          ))}
        </div>

        {selectedEvent && (
          <div
            style={{
              marginTop: 30,
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 2px 6px rgba(0,0,0,.08)",
            }}
          >

            <div
              style={{
                display: "inline-block",
                padding: "4px 10px",
                borderRadius: 20,
                background: "#F3F4F6",
                fontWeight: "bold",
                marginBottom: 10,
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

              {selectedEvent.sources?.map(
                (s: any, index: number) => (
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
                )
              )}

            </p>

          </div>
        )}

      </div>

    </div>
  );
}

export default App;