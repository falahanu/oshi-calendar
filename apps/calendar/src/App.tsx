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

import Countdown from "./components/Countdown";
import FeaturedEvents from "./components/FeaturedEvents";
import YarlensIntro from "./components/YarlensIntro";
import Footer from "./components/Footer";

import "./App.css";

function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

function isMilestoneVisit(count: number) {
  if (count < 100) {
    return false;
  }

  if (count < 1000) {
    return count % 100 === 0;
  }

  return count % 500 === 0;
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
        setVisitCount(String(json.count));
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

  const featuredEvents = data?.featuredEvents ?? [];

  const filteredEvents =
    categoryFilter.length === 0
      ? groupedEvents
      : groupedEvents.filter((event: any) =>
          categoryFilter.includes(event.category)
        );

  const selectedEvents = filteredEvents.filter(
    (event: any) => event.date === selectedDate
  );

  const numericVisitCount = Number(
    visitCount.replace(/,/g, "")
  );

  const showMilestoneCelebration =
    Number.isFinite(numericVisitCount) &&
    isMilestoneVisit(numericVisitCount);

  const celebrationCount =
    numericVisitCount.toLocaleString("ja-JP");

  const confetti = [
    "🎉",
    "✨",
    "🎊",
    "⭐",
    "✦",
    "🎈",
    "✨",
    "🎉",
    "✦",
    "⭐",
    "🎊",
    "✨",
  ];

  return (
    <div className="page-background">
      <div className="image-background" aria-hidden="true">
        <div className="image-overlay" />
      </div>

      {/* ===== キリ番お祝いエフェクト ===== */}
      {showMilestoneCelebration && (
        <>
          <style>
            {`
              .milestone-celebration {
                position: fixed;
                inset: 0;
                z-index: 2;
                pointer-events: none;
                overflow: hidden;
              }

              .milestone-confetti {
                position: absolute;
                top: -40px;
                font-size: 24px;
                opacity: 0;
                animation-name: milestone-fall;
                animation-duration: 7s;
                animation-timing-function: linear;
                animation-iteration-count: infinite;
              }

              .milestone-confetti:nth-child(1) {
                left: 5%;
                animation-delay: 0s;
              }

              .milestone-confetti:nth-child(2) {
                left: 13%;
                animation-delay: 1.4s;
              }

              .milestone-confetti:nth-child(3) {
                left: 22%;
                animation-delay: 3.1s;
              }

              .milestone-confetti:nth-child(4) {
                left: 31%;
                animation-delay: 0.8s;
              }

              .milestone-confetti:nth-child(5) {
                left: 40%;
                animation-delay: 2.5s;
              }

              .milestone-confetti:nth-child(6) {
                left: 49%;
                animation-delay: 4s;
              }

              .milestone-confetti:nth-child(7) {
                left: 58%;
                animation-delay: 1.8s;
              }

              .milestone-confetti:nth-child(8) {
                left: 67%;
                animation-delay: 3.7s;
              }

              .milestone-confetti:nth-child(9) {
                left: 76%;
                animation-delay: 0.5s;
              }

              .milestone-confetti:nth-child(10) {
                left: 84%;
                animation-delay: 2.2s;
              }

              .milestone-confetti:nth-child(11) {
                left: 91%;
                animation-delay: 4.4s;
              }

              .milestone-confetti:nth-child(12) {
                left: 97%;
                animation-delay: 1.1s;
              }

              @keyframes milestone-fall {
                0% {
                  transform:
                    translateY(-40px)
                    rotate(0deg)
                    scale(0.8);
                  opacity: 0;
                }

                10% {
                  opacity: 0.75;
                }

                70% {
                  opacity: 0.65;
                }

                100% {
                  transform:
                    translateY(110vh)
                    rotate(360deg)
                    scale(1.1);
                  opacity: 0;
                }
              }

              .milestone-sparkle {
                position: absolute;
                font-size: 20px;
                opacity: 0;
                animation: milestone-sparkle 3s ease-in-out infinite;
              }

              .milestone-sparkle-1 {
                top: 18%;
                left: 8%;
                animation-delay: 0s;
              }

              .milestone-sparkle-2 {
                top: 28%;
                right: 10%;
                animation-delay: 1.2s;
              }

              .milestone-sparkle-3 {
                top: 65%;
                left: 12%;
                animation-delay: 2s;
              }

              .milestone-sparkle-4 {
                top: 72%;
                right: 14%;
                animation-delay: 0.7s;
              }

              @keyframes milestone-sparkle {
                0%,
                100% {
                  transform: scale(0.7) rotate(0deg);
                  opacity: 0;
                }

                50% {
                  transform: scale(1.35) rotate(20deg);
                  opacity: 0.8;
                }
              }

              .milestone-message {
                margin-top: 8px;
                font-size: 13px;
                font-weight: bold;
                color: #b45309;
              }
            `}
          </style>

          <div
            className="milestone-celebration"
            aria-hidden="true"
          >
            {confetti.map((item, index) => (
              <span
                key={index}
                className="milestone-confetti"
              >
                {item}
              </span>
            ))}

            <span className="milestone-sparkle milestone-sparkle-1">
              ✨
            </span>

            <span className="milestone-sparkle milestone-sparkle-2">
              ✦
            </span>

            <span className="milestone-sparkle milestone-sparkle-3">
              ✨
            </span>

            <span className="milestone-sparkle milestone-sparkle-4">
              ⭐
            </span>
          </div>
        </>
      )}

      <div className="page-content">

        <h1
          style={{
            color: "#fff",
          }}
        >
          {oshi.icon} {oshi.name}情報室
        </h1>

        <p
          style={{
            marginTop: 0,
            marginBottom: 16,
            color: "#555",
            fontSize: 14,
          }}
        >
          ヤーレンズさんの出演情報・ライブ・テレビ・ラジオなどをまとめた、非公式の応援サイトです。
        </p>

        {/* ===== 日本武道館ライブ カウントダウン ===== */}
        <Countdown />

        {/* ===== 注目イベント ===== */}
        <FeaturedEvents featuredEvents={featuredEvents} />

        <YarlensIntro />

        {/* ===== アクセスカウンター ===== */}
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

            {showMilestoneCelebration && (
              <div className="milestone-message">
                🎉 {celebrationCount} HIT！見に来てくれてありがとう！
              </div>
            )}
          </div>
        )}

        {/* ===== カレンダー情報 ===== */}
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

        {/* ===== カテゴリフィルター ===== */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          {[
            "すべて",
            "ライブ",
            "テレビ",
            "ラジオ",
            "チケット販売",
          ].map((category) => (
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
          ))}
        </div>

        {/* ===== カレンダー本体 ===== */}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: 30,
            textAlign: "center",
          }}
        >
          <FullCalendar
            plugins={[
              dayGridPlugin,
              interactionPlugin,
            ]}
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

          {/* ===== イベント一覧 ===== */}
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

        {/* ===== フッター ===== */}
        <Footer />
      </div>
    </div>
  );
}

export default App;