type Props = {
  title: string;
  date: string;
  artist: string;
  category: string;
  detail: string;
  url: string;
};

export default function EventDetail({
  title,
  date,
  artist,
  category,
  detail,
  url,
}: Props) {
  return (
    <div>
      <h2>{title}</h2>

      <p>📅 {date}</p>

      <p>👤 {artist}</p>

      <p>{category}</p>

      <p>{detail}</p>

      <a href={url} target="_blank" rel="noreferrer">
        公式サイトを見る
      </a>
    </div>
  );
}