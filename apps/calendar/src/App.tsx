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
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    isToday: false,
    isFinished: false,
  });

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

  // 日本武道館ライブのカウントダウン
  // 2027年3月7日 16:00（日本時間）を終了時刻とする
  useEffect(() => {
    const targetTime = new Date(
      "2027-03-07T16:00:00+09:00"
    ).getTime();

    const updateCountdown = () => {
      const now = Date.now();
      const remaining = targetTime - now;

      if (remaining <= 0) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          isToday: true,
          isFinished: true,
        });
        return;
      }

      const totalMinutes = Math.floor(
        remaining / (1000 * 60)
      );

      const days = Math.floor(
        totalMinutes / (60 * 24)
      );

      const hours = Math.floor(
        (totalMinutes % (60 * 24)) / 60
      );

      const minutes = totalMinutes % 60;

      setCountdown({
        days,
        hours,
        minutes,
        isToday: false,
        isFinished: false,
      });
    };

    updateCountdown();

    const timer = window.setInterval(
      updateCountdown,
      1000
    );

    return () => {
      window.clearInterval(timer);
    };
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
    <div className="page-background">
      {/* YouTube動画ではなく、公式動画のサムネイルを背景として表示 */}
      <div className="image-background" aria-hidden="true">
        <div className="image-overlay" />
      </div>

      <div className="page-content">
        <h1>
          {oshi.icon} {oshi.name} 推し活カレンダー
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

        {/* 日本武道館ライブ カウントダウン */}
        <div
          style={{
            maxWidth: 700,
            margin: "0 auto 20px",
            padding: "22px 24px",
            borderRadius: 14,
            background: "#d94a3a",
            color: "white",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: "bold",
              letterSpacing: "0.08em",
              marginBottom: 5,
              opacity: 0.9,
            }}
          >
            YARLENS SOLO LIVE
          </div>

          <div
            style={{
              fontSize: 20,
              fontWeight: "bold",
              marginBottom: 14,
            }}
          >
            一万人に漫才 in 日本武道館
          </div>

          {/* 見たい人だけ再生する通常のYouTube埋め込み */}
          <div
            style={{
              maxWidth: 900,
              margin: "0 auto 20px",
              background: "white",
              padding: 10,
              borderRadius: 10,
              boxSizing: "border-box",
            }}
          >
            <iframe
              width="100%"
              height="506"
              src="https://www.youtube.com/embed/6y6l6yARzxU"
              title="ヤーレンズ 日本武道館 宣伝動画"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>

          <div
            style={{
              fontSize: 14,
              fontWeight: "bold",
              marginBottom: 4,
            }}
          >
            LIVEまで
          </div>

          {countdown.isFinished ? (
            <div
              style={{
                fontSize: 30,
                fontWeight: "bold",
                marginBottom: 12,
              }}
            >
              🎉 開演しました！
            </div>
          ) : countdown.days === 0 ? (
            <div
              style={{
                fontSize: 30,
                fontWeight: "bold",
                lineHeight: 1.3,
                marginBottom: 12,
              }}
            >
              あと {countdown.hours}時間{" "}
              {countdown.minutes}分
            </div>
          ) : countdown.days === 1 ? (
            <div
              style={{
                fontSize: 30,
                fontWeight: "bold",
                lineHeight: 1.3,
                marginBottom: 12,
              }}
            >
              あと {countdown.hours + 24}時間{" "}
              {countdown.minutes}分
            </div>
          ) : (
            <div
              style={{
                fontSize: 34,
                fontWeight: "bold",
                lineHeight: 1.3,
                marginBottom: 12,
              }}
            >
              あと {countdown.days}日
            </div>
          )}

          <div
            style={{
              fontSize: 14,
              fontWeight: "bold",
            }}
          >
            2027年3月7日（日）
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 13,
            }}
          >
            開場 15:00 ／ 開演 16:00
          </div>
        </div>

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

        {/* ===== フッター ===== */}
        <footer
          style={{
            marginTop: 50,
            padding: "32px 20px 24px",
            borderTop: "1px solid #ddd",
            color: "#555",
            textAlign: "center",
            background: "rgba(255, 255, 255, 0.82)",
            borderRadius: "14px 14px 0 0",
          }}
        >
          <div
            style={{
              maxWidth: 760,
              margin: "0 auto",
            }}
          >
            <div
              style={{
                fontSize: 17,
                fontWeight: "bold",
                color: "#333",
                marginBottom: 14,
              }}
            >
              ヤーレンズ公式情報
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px 18px",
                marginBottom: 28,
                fontSize: 14,
              }}
            >
              <a
                href="https://www.kdashstage.jp/profile/archives/4"
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "#2563eb",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                ケイダッシュステージ公式プロフィール
              </a>

              <a
                href="https://x.com/yasashi_yoasobi"
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "#2563eb",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                𝕏 ヤーレンズ情報【公式】
              </a>
            </div>

            <div
              style={{
                fontSize: 17,
                fontWeight: "bold",
                color: "#333",
                marginBottom: 14,
              }}
            >
              ヤーレンズSNS
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
                maxWidth: 560,
                margin: "0 auto 28px",
              }}
            >
              <div
                style={{
                  padding: "12px 14px",
                  background: "#f7f7f7",
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    fontWeight: "bold",
                    color: "#333",
                    marginBottom: 7,
                  }}
                >
                  楢原真樹
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 14,
                    fontSize: 14,
                  }}
                >
                  <a
                    href="https://x.com/narahara_j"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#2563eb",
                      textDecoration: "none",
                    }}
                  >
                    𝕏 X
                  </a>

                  <a
                    href="https://www.instagram.com/narahara_j/"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#2563eb",
                      textDecoration: "none",
                    }}
                  >
                    Instagram
                  </a>
                </div>
              </div>

              <div
                style={{
                  padding: "12px 14px",
                  background: "#f7f7f7",
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    fontWeight: "bold",
                    color: "#333",
                    marginBottom: 7,
                  }}
                >
                  出井隼之介
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 14,
                    fontSize: 14,
                  }}
                >
                  <a
                    href="https://x.com/Yarlens_Dei"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#2563eb",
                      textDecoration: "none",
                    }}
                  >
                    𝕏 X
                  </a>

                  <a
                    href="https://www.instagram.com/Dei_junnosuke/"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#2563eb",
                      textDecoration: "none",
                    }}
                  >
                    Instagram
                  </a>
                </div>
              </div>
            </div>

            <div
              style={{
                maxWidth: 620,
                margin: "0 auto 18px",
                padding: "12px 14px",
                fontSize: 12,
                lineHeight: 1.7,
                color: "#777",
                background: "#f9fafb",
                borderRadius: 8,
              }}
            >
              このサイトはヤーレンズのファンによる非公式の応援サイトです。
              <br />
              掲載情報については、各公式サイト・公式SNSもあわせてご確認ください。
            </div>

            <div
              style={{
                fontSize: 12,
                color: "#888",
              }}
            >
              © 2026 推し活カレンダー
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;