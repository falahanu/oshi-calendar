export function groupEvents(events: any[]) {

  const grouped: Record<string, any> = {};

  for (const event of events) {

    // ========================================
    // 配信イベント
    // ========================================

    if (event.category === "配信") {

      // 配信は必ず「ライブ」に紐付ける
      const liveKey =
        `${event.date}_${event.title}_ライブ`;

      // ライブがまだ来ていない場合は
      // 配信だけの仮グループを作る
      if (!grouped[liveKey]) {

        grouped[liveKey] = {
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

        const existing = grouped[liveKey];

        // 注目イベントは、どちらか一方でも true なら true を維持
        existing.featured =
          Boolean(existing.featured || event.featured);

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

      }

      continue;
    }


    // ========================================
    // 通常イベント
    // ========================================

    // 日付・タイトル・カテゴリが同じものだけを
    // 同じイベントとしてまとめる
    const key =
      `${event.date}_${event.title}_${event.category}`;


    // ========================================
    // ① 初めて出てきた通常イベント
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
    // ② 既に同じ通常イベントがある場合
    // ========================================

    const existing = grouped[key];


    // ----------------------------------------
    // ライブ本体が来た場合
    // ----------------------------------------
    // 配信が先に来ていた場合は、
    // 仮グループに保存されている配信情報を引き継ぐ
    // ----------------------------------------

    if (
      event.category === "ライブ" &&
      existing._streamingOnly
    ) {

      const streamingSources =
        existing.sources ?? [];

      grouped[key] = {
        ...event,

        // 配信側・ライブ側のどちらかが注目なら
        // 統合後も注目を維持する
        featured:
          Boolean(existing.featured || event.featured),

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

    // どちらか一方でも注目なら、
    // 統合後も注目イベントとして扱う
    existing.featured =
      Boolean(existing.featured || event.featured);

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
        event.category !== "配信" &&
        !event._streamingOnly
    )
    .map((event: any) => {

      // 内部処理用フラグは公開しない
      delete event._streamingOnly;

      return event;
    });

}