function Footer() {
  return (
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
  );
}

export default Footer;