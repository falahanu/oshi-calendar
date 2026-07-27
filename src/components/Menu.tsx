type MenuProps = {
  onSelectPage: (page: string) => void;
};
export default function Menu({ onSelectPage }: MenuProps) {
  return (
    <div>
      <h2>メニュー</h2>

      <p
        className="menu-item"
        onClick={() => onSelectPage("calendar")}
      >
        📅 カレンダー
      </p>

      <p
        className="menu-item"
        onClick={() => onSelectPage("ticket")}
      >
        🎫 チケット
      </p>

      <p className="menu-item">📺 メディア出演</p>

      <p className="menu-item">⭐ お気に入り</p>

      <p className="menu-item">⚙️ 設定</p>
    </div>
  );
}
