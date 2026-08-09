export function groupEvents(events: any[]) {

  const grouped: Record<string, any> = {};

  for (const event of events) {

    const key =
      `${event.date}_${event.title}`;

    // ========================================
    // ① 初めて出てきたイベント
    // ========================================

    if (!grouped[key]) {

      grouped[key] = {
        ...event,

        sources: event.sources
          ? [...event.sources]
          : [
              {
                source: event.source,
                url: event.url
              }
            ]
      };

      continue;
    }

    // ========================================
    // ② 既に同じイベントがある場合
    // ========================================

    const existing = grouped[key];

    // ----------------------------------------
    // 配信イベントの場合
    // ----------------------------------------

    if (event.category === "配信") {

      // 「配信あり」をSourceとして追加
      const alreadyExists =
        existing.sources?.some(
          (s: any) => s.source === "配信あり"
        );

      if (!alreadyExists) {

        existing.sources.push({
          source: "配信あり",
          url: event.url
        });

      }

      continue;
    }

    // ----------------------------------------
    // 通常のイベントの場合
    // ----------------------------------------

    const alreadyExists =
      existing.sources?.some(
        (s: any) =>
          s.source === event.source &&
          s.url === event.url
      );

    if (!alreadyExists) {

      existing.sources.push({
        source: event.source,
        url: event.url
      });

    }

  }

  // ========================================
  // ③ 配信単独イベントを除外
  // ========================================

  return Object.values(grouped).filter(
    (event: any) => event.category !== "配信"
  );
}