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
};

export const getVideoDataList = (): VideoData[] => {
  const videoDataList = window.localStorage.getItem("videoDataList");
  if (videoDataList) {
    return JSON.parse(videoDataList) as VideoData[];
  }

  return [];
};
