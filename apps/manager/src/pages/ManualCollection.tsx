type ManualCollectionProps = {
  onNavigate: (page: string) => void;
};

const searchSites = [
  {
    name: "e+",
    url: "https://eplus.jp/",
  },
  {
    name: "FANY",
    url: "https://ticket.fany.lol/",
  },
  {
    name: "Tixplus・チケプラ",
    url: "https://tixplus.jp/",
  },
  {
    name: "LIVEPOCKET",
    url: "https://t.livepocket.jp/",
  },
  {
    name: "チケットぴあ",
    url: "https://t.pia.jp/",
  },
  {
    name: "ZAIKO",
    url: "https://www.google.com/search?q=site%3Azaiko.io+%E3%83%A4%E3%83%BC%E3%83%AC%E3%83%B3%E3%82%BA",
  },
];

const spreadsheetUrl =
  "https://docs.google.com/spreadsheets/d/1fwHIox9YnZ1_5jyXONUoBoUYV4DfG5BCsvVpOcxmWE8/edit";

export default function ManualCollection({
  onNavigate: _onNavigate,
}: ManualCollectionProps) {
  return (
    <>
      <h2
        style={{
          fontSize: 28,
          fontWeight: "bold",
          marginBottom: 20,
        }}
      >
        🔎 手動情報収集
      </h2>

      <div
        style={{
          maxWidth: 600,
          padding: 20,
          border: "1px solid #ddd",
          borderRadius: 14,
          background: "white",
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            marginBottom: 8,
          }}
        >
          情報収集先
        </div>

        <select
          id="manual-collection-site"
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
            marginBottom: 16,
            fontSize: 16,
          }}
        >
          {searchSites.map((site) => (
            <option key={site.name} value={site.name}>
              {site.name}
            </option>
          ))}
        </select>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            onClick={(event) => {
              const select = document.querySelector(
                "#manual-collection-site"
              ) as HTMLSelectElement;

              const site = searchSites.find(
                (item) => item.name === select.value
              );

              if (!site) {
                event.preventDefault();
                return;
              }

              event.preventDefault();
              window.open(site.url, "_blank");
            }}
            style={{
              display: "inline-block",
              padding: "10px 18px",
              borderRadius: 8,
              border: "none",
              background: "#2563eb",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            🔗 検索サイトを開く
          </a>

          <button
            onClick={() => {
              window.open(
                spreadsheetUrl,
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
              cursor: "pointer",
            }}
          >
            📊 スプレッドシートを開く
          </button>
        </div>
      </div>
    </>
  );
}