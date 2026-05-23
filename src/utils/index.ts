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
};
