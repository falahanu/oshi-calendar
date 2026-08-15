import { groupEvents } from "../../shared/groupEvents";
import {
  getCategoryColor,
  getCategoryLightColor,
} from "../../shared/categoryColors";
import { useEffect, useMemo, useRef, useState } from "react";
import jaLocale from "@fullcalendar/core/locales/ja";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

type Event = {
  id: string;
  date: string;
  time: string;
  title: string;
  category: string;
  place: string;
  performers: string;
  url: string;
  status: string;
  source: string;
  detail: string;
  management: string;

  sources?: {
    source: string;
    url?: string;
  }[];
  streamingUrl?: string;
};

function normalizeDate(date: string) {
  return date.replaceAll("/", "-");
}
function getEventId(event: Event) {
  return event.id || `${event.date}-${event.title}`;
}
function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [selectedEventId, setSelectedEventId] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  const loadEvents = () => {

    fetch(
      "https://script.google.com/macros/s/AKfycbw8N96LIXRrtqoWi0FgDYD4HDAjZluEviiq3dMx5m9npOJ3CnvhxgwUPswddlCt_Kq5Sw/exec"
    )
      .then((res) => res.json())
      .then((data: Event[]) => {

        const normalized = data.map((event) => ({
          ...event,
          date: normalizeDate(event.date),
        }));

        const sorted = [...normalized].sort((a, b) =>
          a.date.localeCompare(b.date)
        );

        setEvents(sorted);
      })
      .catch((error) => {
        console.error(error);
        alert("最新情報の取得に失敗しました。");
      });

  };

  useEffect(() => {
    loadEvents();
  }, []);

  const groupedEvents = useMemo(
    () =>
      groupEvents(events).filter(
        (event: any) => event.category !== "配信"
      ),
    [events]
  );

  const filteredEvents = useMemo(() => {

    if (categoryFilter.length === 0) {
      return groupedEvents;
    }

    return groupedEvents.filter((event: any) =>
      categoryFilter.includes(event.category)
    );

  }, [events, categoryFilter]);

  const selectedEvents = useMemo(() => {

    let result = filteredEvents;

    if (selectedDate) {
      result = result.filter(
        (event: any) => event.date === selectedDate
      );
    }

    return result;

  }, [filteredEvents, selectedDate]);

  return (
    <div>

      <h2
        style={{
          fontSize: 28,
          fontWeight: "bold",
          marginBottom: 16
        }}
      >
        カレンダー
      </h2>

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
                    category
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

      <FullCalendar

        plugins={[
          dayGridPlugin,
          interactionPlugin
        ]}

        initialView="dayGridMonth"

        locale={jaLocale}

        height="auto"

        eventDisplay="block"

        fixedWeekCount={false}

        events={filteredEvents.map((event: any) => ({

          id: getEventId(event),

          title: event.title,

          date: event.date,

          backgroundColor: getCategoryColor(event.category),

          borderColor: getCategoryColor(event.category),

        }))}

        dateClick={(info) => {

          setSelectedDate(info.dateStr);

          setSelectedEventId("");

        }}

        eventClick={(info) => {

          setSelectedDate(info.event.startStr);

          setSelectedEventId(info.event.id);

          setTimeout(() => {

            listRef.current?.scrollIntoView({
              behavior: "smooth"
            });

          }, 100);

        }}

        dayCellContent={(arg) => {

          const dateStr =
            formatDate(arg.date);

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

                fontWeight: "bold"
              }}
            >
              {arg.dayNumberText.replace("日", "")}
            </div>
          );

        }}

      />

      <div
        style={{
          marginTop: 16,
          marginBottom: 20
        }}
      >

        <button
          disabled={isLoading}
          onClick={async () => {

            if (isLoading) return;

            setIsLoading(true);

            try {

              const res =
                await fetch(
                  "http://localhost:3001/crawl",
                  {
                    method: "POST",
                  }
                );

              const result =
                await res.json();

              if (result.success) {

                await loadEvents();

              } else {

                alert(
                  "情報取得に失敗しました。"
                );

              }

            } catch (e) {

              console.error(e);

              alert(
                "サーバーに接続できません。"
              );

            } finally {

              setIsLoading(false);

            }

          }}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            background: "#2563eb",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          {isLoading
            ? "🔄 取得中..."
            : "🔄 最新情報を取得"}
        </button>

        <button
          onClick={async () => {

            try {

              const response = await fetch(
                "http://localhost:3001/createPublicJson",
                {
                  method: "POST"
                }
              );

              const result: {
                success?: boolean;
                message?: string;
              } | null = await response.json().catch((error) => {
                console.error(
                  "公開データ更新のレスポンス解析に失敗しました:",
                  error
                );
                return null;
              });

              if (!response.ok) {
                console.error(
                  "公開データの更新に失敗しました:",
                  result?.message ?? result
                );
                alert("公開データの更新に失敗しました");
                return;
              }

              alert("公開データを更新しました");

            } catch (error) {

              console.error(
                "公開データの更新リクエストに失敗しました:",
                error
              );
              alert("公開データの更新に失敗しました");

            }

          }}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            background: "#2563eb",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          公開ページ更新
        </button>

        <button
          onClick={() => {

            window.open(
              "https://docs.google.com/spreadsheets/d/1fwHIox9YnZ1_5jyXONUoBoUYV4DfG5BCsvVpOcxmWE8/edit",
              "_blank"
            );

          }}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            background: "#16a34a",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          📊 スプレッドシートを開く
        </button>

      </div>

      <div
        ref={listRef}
        style={{
          marginTop: 24
        }}
      >

        <h3
          style={{
            fontSize: 22,
            fontWeight: "bold",
            marginBottom: 12
          }}
        >
          イベント一覧{" "}
          {selectedDate
            ? `（${selectedDate}）`
            : ""}
        </h3>

        <div
          style={{
            marginBottom: 16
          }}
        >
        </div>

        {selectedDate && (

          <button
            onClick={() => {

              setSelectedDate("");

              setSelectedEventId("");

            }}
            style={{
              marginBottom: 12,
              padding: "6px 10px",
              border: "1px solid #ccc",
              borderRadius: 8,
              background: "white",
            }}
          >
            すべてのイベントを表示
          </button>

        )}

        {selectedEvents.length === 0 && (

          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 20,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            この日のイベントはありません
          </div>

        )}

        {selectedEvents.map((event: any) => (

          <div
            key={getEventId(event)}
            style={{

              border: getEventId(event) === selectedEventId
                ? `3px solid ${getCategoryColor(event.category)}`
                : `1px solid ${getCategoryColor(event.category)}`,

              background: event.id === selectedEventId
                ? getCategoryLightColor(event.category)
                : "white",

              borderRadius: 14,

              padding: 18,

              marginBottom: 16,

              boxShadow:
                "0 2px 6px rgba(0,0,0,.08)"

            }}
          >

            <div
              style={{
                display: "inline-block",
                padding: "4px 10px",
                borderRadius: 20,

                background: getCategoryLightColor(event.category),

                fontWeight: "bold",

                marginBottom: 10
              }}
            >
              {event.category}
            </div>

            <div
              style={{
                fontSize: 22,
                fontWeight: "bold",
                marginBottom: 12
              }}
            >
              {event.title}
            </div>

            <div
              style={{
                marginBottom: 6
              }}
            >
              📅 {event.date}
            </div>

            {event.detail && (

              <div
                style={{
                  marginBottom: 6
                }}
              >
                🕐{" "}

                {event.detail === "配信あり" && event.streamingUrl ? (

                  <a
                    href={event.streamingUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#2563eb",
                      textDecoration: "none",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    配信あり
                  </a>

                ) : (

                  event.detail

                )}

              </div>

            )}

            <div
              style={{
                marginBottom: 6
              }}
            >
              📍{" "}

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  event.place
                )}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "#2563eb",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                {event.place}
              </a>

            </div>

            <div
              style={{
                marginBottom: 6
              }}
            >
              👥 {event.performers}
            </div>

            <div
              style={{
                marginBottom: 12
              }}
            >

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

                      <span>
                        {s.source}
                      </span>

                    )}

                  </span>

                )
              )}

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}
