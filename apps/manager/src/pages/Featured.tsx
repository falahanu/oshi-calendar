import { useEffect, useState } from "react";

type FeaturedEvent = {
  id: string | number;
  date: string;
  title: string;
  category: string;
  detail: string;
  url: string;
  featured?: boolean;
};

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbw8N96LIXRrtqoWi0FgDYD4HDAjZluEviiq3dMx5m9npOJ3CnvhxgwUPswddlCt_Kq5Sw/exec";

export default function Featured() {
  const [events, setEvents] = useState<FeaturedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(GAS_URL)
      .then((res) => res.json())
      .then((data: FeaturedEvent[]) => {
        const featuredEvents = data
          .filter((event) => event.featured === true)
          .sort((a, b) => {
            const dateCompare = a.date.localeCompare(b.date);

            if (dateCompare !== 0) {
              return dateCompare;
            }

            return a.title.localeCompare(b.title);
          });

        setEvents(featuredEvents);
      })
      .catch((error) => {
        console.error("注目イベントの取得に失敗しました:", error);
        alert("注目イベントの取得に失敗しました。");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div>
      {isLoading && (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 20,
            background: "white",
          }}
        >
          読み込み中...
        </div>
      )}

      {!isLoading && events.length === 0 && (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 20,
            background: "white",
            marginBottom: 24,
          }}
        >
          現在、注目イベントはありません。
        </div>
      )}

      {!isLoading && events.length > 0 && (
        <section
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            background: "white",
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <div>
            {events.map((event, index) => (
              <div
                key={`${event.id}-${event.date}-${event.title}`}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "100px 80px minmax(180px, 1.2fr) minmax(240px, 2fr) auto",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderBottom:
                    index < events.length - 1
                      ? "1px solid #eee"
                      : "none",
                }}
              >
                <div
                  style={{
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  {event.date}
                </div>

                <div
                  style={{
                    display: "inline-block",
                    width: "fit-content",
                    padding: "4px 10px",
                    borderRadius: 20,
                    background: "#f3f4f6",
                    fontSize: 14,
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  {event.category}
                </div>

                <div
                  style={{
                    fontWeight: "bold",
                  }}
                >
                  {event.title}
                </div>

                <div
                  style={{
                    color: "#555",
                  }}
                >
                  {event.detail || ""}
                </div>

                {event.url ? (
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#2563eb",
                      textDecoration: "none",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {event.category === "配信"
                      ? "配信を見る →"
                      : "チケット情報 →"}
                  </a>
                ) : (
                  <span />
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
