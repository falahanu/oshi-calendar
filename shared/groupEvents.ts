export function getStartTimeMinutes(startTime: unknown): number | null {
  if (typeof startTime !== "string") {
    return null;
  }

  const match = startTime.trim().match(/^(\d+):(\d{2})$/);

  if (!match || Number(match[2]) > 59) {
    return null;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

export function normalizeEventDate(date: string): string {
  const match = String(date ?? "").match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);

  return match
    ? `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`
    : String(date ?? "");
}

export function formatEventDateForDisplay(date: string): string {
  return normalizeEventDate(date).replaceAll("-", "/");
}

export function compareEventsByDateAndStartTime(a: any, b: any) {
  const dateCompare = normalizeEventDate(String(a.date ?? "")).localeCompare(
    normalizeEventDate(String(b.date ?? ""))
  );

  if (dateCompare !== 0) {
    return dateCompare;
  }

  const aMinutes = getStartTimeMinutes(a.startTime);
  const bMinutes = getStartTimeMinutes(b.startTime);

  if (aMinutes === null && bMinutes !== null) return 1;
  if (aMinutes !== null && bMinutes === null) return -1;
  if (aMinutes === null || bMinutes === null) return 0;

  return aMinutes - bMinutes;
}

export function isPodcastEvent(event: any): boolean {
  if (event.category !== "ラジオ") {
    return false;
  }

  const normalize = (value: unknown) =>
    String(value ?? "")
      .normalize("NFKC")
      .replace(/\s+/g, "")
      .toLocaleLowerCase("ja-JP");

  const place = normalize(event.place);
  const detail = normalize(event.detail);
  const title = normalize(event.title);

  return (
    place === "podcast" ||
    ["podcast", "podcast配信", "ポッドキャスト", "ポッドキャスト配信"]
      .includes(detail) ||
    /podcast|ポッドキャスト/i.test(title)
  );
}

export function getEventTimeDisplay(event: any): string {
  const startTime =
    typeof event.startTime === "string" ? event.startTime.trim() : "";
  const startMinutes = getStartTimeMinutes(startTime);
  const openTime =
    typeof event.openTime === "string" ? event.openTime.trim() : "";

  if (startMinutes === null) {
    return event.detail ?? "";
  }

  if (isPodcastEvent(event)) {
    return "";
  }

  if (event.category === "ライブ") {
    return openTime
      ? `開場 ${openTime} / 開演 ${startTime}`
      : `開演 ${startTime}`;
  }

  if (event.category === "テレビ" || event.category === "ラジオ") {
    const endTime =
      typeof event.endTime === "string" ? event.endTime.trim() : "";

    return `${startTime}～${endTime}`;
  }

  return "";
}

function mergeKnownTimes(existing: any, incoming: any) {
  for (const timeField of ["startTime", "endTime", "openTime"]) {
    const existingTime = existing[timeField];
    const incomingTime = incoming[timeField];
    const existingIsKnown =
      typeof existingTime === "string" &&
      existingTime.trim() !== "" &&
      existingTime !== "不明";
    const incomingIsKnown =
      typeof incomingTime === "string" &&
      incomingTime.trim() !== "" &&
      incomingTime !== "不明";

    if (!existingIsKnown && incomingIsKnown) {
      existing[timeField] = incomingTime;
    } else if (
      existingIsKnown &&
      incomingIsKnown &&
      existingTime !== incomingTime
    ) {
      console.warn(
        `イベント時刻の不一致 (${timeField}): ${existing.date} ${existing.title} - ${existingTime} / ${incomingTime}; 先に登録された収集元の値を維持します。`
      );
    }
  }
}

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
        mergeKnownTimes(existing, event);

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
    mergeKnownTimes(existing, event);


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

        startTime: existing.startTime,
        endTime: existing.endTime,
        openTime: existing.openTime,

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
