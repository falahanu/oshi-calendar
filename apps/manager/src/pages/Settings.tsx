import { useEffect, useState } from "react";
export default function Settings() {

   const [oshiName, setOshiName] = useState("");

  useEffect(() => {
    const savedName = localStorage.getItem("oshiName");

    if (savedName) {
      setOshiName(savedName);
    }
  }, []);

  return (
    <div>
      <h2>⚙️ 設定</h2>

      <p>推し芸人名</p>

      <input
        type="text"
        value={oshiName}
        onChange={(e) => setOshiName(e.target.value)}
        placeholder="ヤーレンズ"
      />

      <br />
      <br />

      <button
        onClick={() => {
          localStorage.setItem("oshiName", oshiName);
          alert("保存しました：" + oshiName);
        }}
      >
        保存
      </button>
      <p>現在の推し：{oshiName}</p>
    </div>
  );
}