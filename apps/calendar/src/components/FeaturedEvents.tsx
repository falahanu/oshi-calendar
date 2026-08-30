import {
  getCategoryColor,
  getCategoryLightColor,
} from "../../../../shared/categoryColors";

type FeaturedEvent = {
  id?: string;
  date: string;
  title: string;
  category: string;
  place?: string;
  detail?: string;
  url?: string;
};

type Props = {
  featuredEvents: FeaturedEvent[];
};

function FeaturedEvents({ featuredEvents }: Props) {
  if (featuredEvents.length === 0) {
    return null;
  }

  return (
    <section
      style={{
        marginBottom: 24,
        padding: 20,
        border: "1px solid #e5c4bf",
        borderRadius: 14,
        background: "#fffaf8",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          margin: "0 0 16px",
          fontSize: 22,
          fontWeight: "bold",
          color: "#c24132",
        }}
      >
        ⭐ 注目イベント
      </h2>

      <div
        style={{
          display: "grid",
          gap: 14,
        }}
      >
        {featuredEvents.map((event) => (
          <div
            key={`${event.id}-${event.date}-${event.title}`}
            style={{
              padding: 16,
              border: "1px solid #ead7d2",
              borderRadius: 12,
              background: "white",
              boxShadow:
                "0 2px 6px rgba(0,0,0,.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  borderRadius: 20,
                  background:
                    getCategoryLightColor(
                      event.category
                    ),
                  color: getCategoryColor(
                    event.category
                  ),
                  fontSize: 13,
                  fontWeight: "bold",
                }}
              >
                {event.category}
              </span>

              <span
                style={{
                  fontSize: 14,
                  fontWeight: "bold",
                  color: "#555",
                }}
              >
                {event.date}
              </span>
            </div>

            <div
              style={{
                fontSize: 19,
                fontWeight: "bold",
                marginBottom: 8,
              }}
            >
              {event.title}
            </div>

            {event.detail && (
              <div
                style={{
                  marginBottom: 6,
                  color: "#555",
                  fontSize: 14,
                }}
              >
                🕐 {event.detail}
              </div>
            )}

            {event.place && (
              <div
                style={{
                  marginBottom: 10,
                  color: "#555",
                  fontSize: 14,
                }}
              >
                📍 {event.place}
              </div>
            )}

            {event.url && (
              <a
                href={event.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "#2563eb",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: 14,
                }}
              >
                詳細・チケット情報を見る →
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturedEvents;