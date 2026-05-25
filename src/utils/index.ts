export type KotodamaSubtitle = {
  startMs: number;
  durationMs: number;
  subtitle: string;
  translation: string;
};

export type LanguageReactorSubtitles = Record<
  string,
  { subtitle: string; translation: string }
>;

export type VideoSubtitles = KotodamaSubtitle[] | LanguageReactorSubtitles;

export type VideoData = {
  id: string;
  title: string;
  subtitles: VideoSubtitles | null;
  order?: number;
  /** 動画の長さ(秒)。kotodama が保存時に取得して持たせる。 */
  duration?: number;
  /** チャンネル名。kotodama が保存時に取得して持たせる。 */
  channel?: string;
  /** 公開日 "YYYY-MM-DD"。kotodama が保存時に取得して持たせる。 */
  publishDate?: string;
};

/** 秒数を "M:SS" / "H:MM:SS" 形式に整形する(サムネイルの尺バッジ用)。 */
export const formatDuration = (seconds: number): string => {
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");

  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

/** "YYYY-MM-DD" を "May 20, 2026" 形式に整形する。解釈できなければそのまま返す。 */
export const formatPublishDate = (iso: string): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  // TZずれを避けるためローカル日付として組み立てる。
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
