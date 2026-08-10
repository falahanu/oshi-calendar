export const categoryColors: Record<string, string> = {
  ライブ: "#ef4444",
  テレビ: "#3b82f6",
  ラジオ: "#22c55e",
  チケット: "#f59e0b",
  その他: "#8b5cf6",
};

export const categoryLightColors: Record<string, string> = {
  ライブ: "#fee2e2",
  テレビ: "#dbeafe",
  ラジオ: "#dcfce7",
  チケット: "#fef3c7",
  その他: "#ede9fe",
};

export function getCategoryColor(category: string): string {
  return categoryColors[category] ?? categoryColors["その他"];
}

export function getCategoryLightColor(category: string): string {
  return categoryLightColors[category] ?? categoryLightColors["その他"];
}