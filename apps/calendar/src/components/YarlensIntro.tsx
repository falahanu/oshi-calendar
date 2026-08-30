import { useState } from "react";

const videos = [
  {
    icon: "🎤",
    title: "まずはネタを見てみる",
    description:
      "ヤーレンズのネタがまとまっている、公式YouTubeの再生リストです。",
    label: "ネタを見る →",
    url: "https://www.youtube.com/watch?v=CKTX8S7wLcU&list=PLE3tSo3OW3DI5EUVlDIupk9ULPlMzSeSx",
    thumbnail:
      "https://img.youtube.com/vi/CKTX8S7wLcU/hqdefault.jpg",
  },
  {
    icon: "👥",
    title: "どんな二人なのか、ちょっと気になる方へ",
    description:
      "こちらは公式YouTubeの自己紹介動画です。",
    label: "自己紹介を見る →",
    url: "https://www.youtube.com/watch?v=IiiuaN8J-pI&t=69s",
    thumbnail:
      "https://img.youtube.com/vi/IiiuaN8J-pI/hqdefault.jpg",
  },
  {
    icon: "🎭",
    title: "初めてライブを見に行く際に！これを見れば安心！",
    description:
      "お笑いライブが初めての方は、こちらもどうぞ。ヤーレンズのお二人が鑑賞マナーを紹介しています。",
    label: "鑑賞マナーを見る →",
    url: "https://www.youtube.com/watch?v=_1kuRfbf3M0",
    thumbnail:
      "https://img.youtube.com/vi/_1kuRfbf3M0/hqdefault.jpg",
  },
];

function YarlensIntro() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section
      style={{
        marginBottom: 24,
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 14,
        background: "rgba(255, 255, 255, 0.78)",
        boxSizing: "border-box",
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        style={{
          position: "relative",
          width: "100%",
          padding: "0 42px 0 0",
          border: "none",
          background: "transparent",
          color: "#333",
          cursor: "pointer",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: "bold",
          }}
        >
          🎭 ヤーレンズってこんな人
        </span>

        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "50%",
            right: 0,
            transform: "translateY(-50%)",
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #bbb",
            borderRadius: 6,
            background: "#fff",
            color: "#555",
            fontSize: 20,
            lineHeight: 1,
            fontWeight: "normal",
          }}
        >
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen && (
        <div>
          <p
            style={{
              margin: "8px 0 18px",
              color: "#666",
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            ヤーレンズを初めて見る方へ。気になったものから、よかったらどうぞ。
          </p>

          <div
            style={{
              display: "grid",
              gap: 14,
            }}
          >
            {videos.map((video) => (
              <div
                key={video.url}
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                  padding: 12,
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  background: "white",
                  boxShadow: "0 2px 6px rgba(0,0,0,.05)",
                  boxSizing: "border-box",
                }}
              >
                <a
                  href={video.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: "0 0 220px",
                    display: "block",
                    lineHeight: 0,
                  }}
                >
                  <img
                    src={video.thumbnail}
                    alt={`${video.title}のYouTubeサムネイル`}
                    style={{
                      display: "block",
                      width: "220px",
                      height: "124px",
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                </a>

                <div
                  style={{
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      marginBottom: 6,
                      lineHeight: 1.4,
                    }}
                  >
                    {video.icon} {video.title}
                  </div>

                  <div
                    style={{
                      marginBottom: 10,
                      color: "#555",
                      fontSize: 14,
                      lineHeight: 1.6,
                    }}
                  >
                    {video.description}
                  </div>

                  <a
                    href={video.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#2563eb",
                      textDecoration: "none",
                      fontWeight: "bold",
                      fontSize: 14,
                    }}
                  >
                    {video.label}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default YarlensIntro;