import { useEffect, useState } from "react";

function Countdown() {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    isToday: false,
    isFinished: false,
  });

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

  return (
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
  );
}

export default Countdown;