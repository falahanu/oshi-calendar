export function groupEvents(events: any[]) {

  const grouped: Record<string, any> = {};

  for (const event of events) {

    const key =
      `${event.date}_${event.title}`;


    // ========================================
    // ① 初めて出てきたイベント
    // ========================================

    if (!grouped[key]) {

      // 配信が最初に来ても、
      // すぐにはグループ本体にしない
      if (event.category === "配信") {
        grouped[key] = {
          ...event,
          sources: [
            {
              source: "配信あり",
              url: event.url
            }
          ],
          _streamingOnly: true
        };

      } else {

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

      }

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

      const alreadyExists =
        existing.sources?.some(
          (s: any) =>
            s.source === "配信あり" &&
            s.url === event.url
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
    // 通常イベントの場合
    // ----------------------------------------

    // 最初に配信だけが来ていた場合、
    // 今来た通常イベントをグループ本体にする
    if (existing._streamingOnly) {

      const streamingSources =
        existing.sources ?? [];

      grouped[key] = {
        ...event,

        sources: [
          {
            source: event.source,
            url: event.url
          },
          ...streamingSources
        ],

        _streamingOnly: false
      };

      continue;
    }

    // ----------------------------------------
    // 通常イベント同士の場合
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
  // ③ 配信だけのイベントを除外
  // ========================================

  return Object.values(grouped)
    .filter(
      (event: any) =>
        event.category !== "配信"
    )
    .map((event: any) => {

      // 内部処理用フラグは公開しない
      delete event._streamingOnly;

      return event;
    });

}

