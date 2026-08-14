const GAS_URL = "https://script.google.com/macros/s/AKfycbw8N96LIXRrtqoWi0FgDYD4HDAjZluEviiq3dMx5m9npOJ3CnvhxgwUPswddlCt_Kq5Sw/exec";

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) {
    console.error("タブIDが取得できません");
    return;
  }

  console.log("===== background.js 起動 =====");
  console.log("URL:", tab.url);

  try {
    const pageInfo = await chrome.tabs.sendMessage(tab.id, {
      type: "GET_PAGE_INFO"
    });

    console.log("===== ページ情報取得完了 =====");
    console.log(pageInfo);

    const eventData = {
      id: `MANUAL_${Date.now()}`,
      date: pageInfo.date || "",
      title: pageInfo.title || pageInfo.heading || "",
      category: pageInfo.category || "",
      place: pageInfo.place || "",
      performers: pageInfo.performers || "",
      url: pageInfo.url || "",
      status: "開催予定",
      source: "TIGET",
      detail: pageInfo.detail || "",
      management: "手動"
    };

    console.log("===== GAS送信データ =====");
    console.log(eventData);

    const response = await fetch(GAS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(eventData)
    });

    console.log("===== GAS送信完了 =====");
    console.log("HTTPステータス:", response.status);

    const result = await response.text();

    console.log("===== GAS応答 =====");
    console.log(result);

  } catch (error) {
    console.error("===== 手動収集に失敗しました =====");
    console.error(error);
  }
});