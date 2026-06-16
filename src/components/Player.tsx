import { useEffect, useState, type SyntheticEvent } from "react";
import {
  Dialog,
  IconButton,
  Box,
  Typography,
  SwipeableDrawer,
  Slider,
  ButtonBase,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SpeedIcon from "@mui/icons-material/Speed";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ReactPlayer from "react-player";
import type { VideoData, KotodamaSubtitle } from "../utils";

type PlayerProps = {
  open: boolean;
  onClose: () => void;
  video: VideoData | null;
};

export default function Player({ open, onClose, video }: PlayerProps) {
  const [displaySubtitles, setDisplaySubtitles] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [translation, setTranslation] = useState("");
  // react-player は再レンダリングのたびに playbackRate を prop 値(未指定だと既定の1)へ強制する。
  // ユーザーが選んだ速度を state で保持して prop に渡し直すことで、一時停止などの再レンダリングで1.0倍に戻るのを防ぐ。
  const [playbackRate, setPlaybackRate] = useState(1);
  // YouTube ギアメニューでの速度変更は react-player + youtube-video-element の経路で
  // 安定して取りこぼされる(合成・native イベントどちらも実機で反映されないことを確認)。
  // そのため自前の Select で速度を変更する運用にしている。
  // 念のため native ratechange も購読しておき、ギア経由の変更が来た場合は state を追従させる(動かなくても本線 UI で代替可能)。
  const [playerEl, setPlayerEl] = useState<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (!playerEl) return;
    const onRate = () => setPlaybackRate(playerEl.playbackRate);
    playerEl.addEventListener("ratechange", onRate);
    return () => playerEl.removeEventListener("ratechange", onRate);
  }, [playerEl]);

  const [speedOpen, setSpeedOpen] = useState(false);
  const PLAYBACK_RATE_MIN = 0.5;
  const PLAYBACK_RATE_MAX = 2;
  const PLAYBACK_RATE_STEP = 0.05;
  const playbackRatePresets: {
    value: number;
    label: string;
    sublabel?: string;
  }[] = [
    { value: 0.5, label: "0.5x" },
    { value: 0.75, label: "0.75x" },
    { value: 1, label: "1x", sublabel: "Normal" },
    { value: 1.25, label: "1.25x" },
    { value: 1.5, label: "1.5x" },
  ];
  // 0.05刻みの加減算は浮動小数誤差が出るので、100倍してから丸める。
  const clampRate = (rate: number) =>
    Math.min(
      PLAYBACK_RATE_MAX,
      Math.max(PLAYBACK_RATE_MIN, Math.round(rate * 100) / 100),
    );
  const formatRate = (rate: number) => `${rate.toFixed(2)}x`;

  const formatTime = (seconds: number): string => {
    const hour = Math.floor(seconds / 3600);
    const min = Math.floor((seconds % 3600) / 60);
    const sec = Math.floor(seconds % 60);

    if (hour !== 0) {
      return `${hour}:${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    } else if (min !== 0) {
      return `${min}:${sec.toString().padStart(2, "0")}`;
    } else {
      return `${sec.toString()}s`;
    }
  };

  const handleOnPlay = () => {
    setDisplaySubtitles(true);
  };

  const handleOnPause = () => {
    setDisplaySubtitles(false);
  };

  const handleTimeUpdate = (event: SyntheticEvent<HTMLVideoElement>) => {
    if (!video?.subtitles) return;

    const playedSeconds = event.currentTarget.currentTime;

    if (Array.isArray(video.subtitles)) {
      const currentMs = playedSeconds * 1000;
      // YouTube auto-CCは範囲が重なるイベントを複数含むため、最後に開始した(=最新の)ものを採用する。
      // 配列は startMs 昇順で生成されている前提。find だと最古の一致を返してしまい字幕が遅れて見える。
      let current: KotodamaSubtitle | null = null;
      for (const s of video.subtitles) {
        if (s.startMs > currentMs) break;
        if (currentMs < s.startMs + s.durationMs) current = s;
      }
      if (current) {
        setSubtitle(current.subtitle);
        setTranslation(current.translation);
      } else {
        setSubtitle("");
        setTranslation("");
      }
      return;
    }

    const formattedTime = formatTime(playedSeconds);
    const entry = video.subtitles[formattedTime];
    if (entry) {
      setSubtitle(entry.subtitle);
      setTranslation(entry.translation);
    }
  };

  const clearSubtiles = () => {
    setSubtitle("");
    setTranslation("");
    setDisplaySubtitles(false);
  };

  return (
    <Dialog fullScreen open={open} onClose={onClose} sx={{ height: "101dvh" }}>
      <Box sx={{ position: "relative", height: "100dvh" }}>
        <Box
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            color: "#e8e8f0",
            background: "rgba(20, 22, 32, 0.72)",
            backdropFilter: "blur(16px) saturate(180%)",
            WebkitBackdropFilter: "blur(16px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "50%",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
            zIndex: 999999,
            WebkitTapHighlightColor: "transparent",
            "&:active": {
              background: "rgba(35, 37, 50, 0.85)",
            },
          }}
        >
          <IconButton
            color="inherit"
            size="small"
            onClick={() => {
              clearSubtiles();
              onClose();
            }}
            sx={{ padding: 0.75 }}
          >
            <CloseIcon sx={{ fontSize: "1.2rem" }} />
          </IconButton>
        </Box>
        <ButtonBase
          onClick={() => setSpeedOpen(true)}
          sx={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            color: "#e8e8f0",
            background: "rgba(20, 22, 32, 0.72)",
            backdropFilter: "blur(16px) saturate(180%)",
            WebkitBackdropFilter: "blur(16px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 999,
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
            zIndex: 999999,
            WebkitTapHighlightColor: "transparent",
            paddingX: 1.75,
            paddingY: 0.9,
            display: "flex",
            alignItems: "center",
            gap: 0.6,
            fontSize: "0.95rem",
            fontWeight: 500,
            lineHeight: 1,
            transition: "background 0.15s",
            "&:hover": {
              background: "rgba(35, 37, 50, 0.8)",
            },
            "&:active": {
              background: "rgba(35, 37, 50, 0.85)",
            },
          }}
        >
          <SpeedIcon sx={{ fontSize: "1.2rem" }} />
          {formatRate(playbackRate)}
        </ButtonBase>
        <SwipeableDrawer
          anchor="bottom"
          open={speedOpen}
          onOpen={() => setSpeedOpen(true)}
          onClose={() => setSpeedOpen(false)}
          disableSwipeToOpen
          swipeAreaWidth={0}
          sx={{ zIndex: 10001 }}
          slotProps={{
            paper: {
              sx: {
                background: "rgba(20, 22, 32, 0.72)",
                backdropFilter: "blur(22px) saturate(180%)",
                WebkitBackdropFilter: "blur(22px) saturate(180%)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderBottom: "none",
                borderRadius: "16px 16px 0 0",
                boxShadow: "0 -8px 24px rgba(0, 0, 0, 0.5)",
                color: "#e8e8f0",
                padding: "10px 24px 24px",
                paddingBottom: "max(24px, env(safe-area-inset-bottom))",
              },
            },
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 4,
              borderRadius: 999,
              background: "rgba(232, 232, 240, 0.3)",
              mx: "auto",
              mb: 1.25,
            }}
          />
          <Typography
            sx={{
              textAlign: "center",
              fontSize: "1.5rem",
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "0.02em",
            }}
          >
            {formatRate(playbackRate)}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              size="small"
              disabled={playbackRate <= PLAYBACK_RATE_MIN}
              onClick={() =>
                setPlaybackRate(clampRate(playbackRate - PLAYBACK_RATE_STEP))
              }
              sx={{
                color: "#e8e8f0",
                background: "rgba(255, 255, 255, 0.1)",
                width: 40,
                height: 40,
                flexShrink: 0,
                "&:hover": { background: "rgba(255, 255, 255, 0.18)" },
                "&.Mui-disabled": {
                  color: "rgba(232, 232, 240, 0.25)",
                  background: "rgba(255, 255, 255, 0.04)",
                },
              }}
            >
              <RemoveIcon sx={{ fontSize: "1.1rem" }} />
            </IconButton>
            <Slider
              value={playbackRate}
              onChange={(_, value) =>
                setPlaybackRate(
                  clampRate(Array.isArray(value) ? value[0] : value),
                )
              }
              min={PLAYBACK_RATE_MIN}
              max={PLAYBACK_RATE_MAX}
              step={PLAYBACK_RATE_STEP}
              sx={{
                flex: 1,
                color: "#e8e8f0",
                "& .MuiSlider-thumb": {
                  width: 16,
                  height: 16,
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.4)",
                  "&:hover, &.Mui-focusVisible": {
                    boxShadow: "0 0 0 8px rgba(232, 232, 240, 0.16)",
                  },
                },
                "& .MuiSlider-rail": {
                  opacity: 0.25,
                },
              }}
            />
            <IconButton
              size="small"
              disabled={playbackRate >= PLAYBACK_RATE_MAX}
              onClick={() =>
                setPlaybackRate(clampRate(playbackRate + PLAYBACK_RATE_STEP))
              }
              sx={{
                color: "#e8e8f0",
                background: "rgba(255, 255, 255, 0.1)",
                width: 40,
                height: 40,
                flexShrink: 0,
                "&:hover": { background: "rgba(255, 255, 255, 0.18)" },
                "&.Mui-disabled": {
                  color: "rgba(232, 232, 240, 0.25)",
                  background: "rgba(255, 255, 255, 0.04)",
                },
              }}
            >
              <AddIcon sx={{ fontSize: "1.1rem" }} />
            </IconButton>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              mt: 2.5,
              justifyContent: "space-between",
            }}
          >
            {playbackRatePresets.map((preset) => {
              const active = Math.abs(playbackRate - preset.value) < 0.001;
              return (
                <Box
                  key={preset.value}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <ButtonBase
                    onClick={() => setPlaybackRate(preset.value)}
                    sx={{
                      width: "100%",
                      paddingY: 0.7,
                      borderRadius: 999,
                      fontSize: "0.82rem",
                      fontWeight: 500,
                      fontVariantNumeric: "tabular-nums",
                      color: "#e8e8f0",
                      background: active
                        ? "linear-gradient(135deg, #7864c8 0%, #b873d0 100%)"
                        : "rgba(255, 255, 255, 0.06)",
                      border: active
                        ? "1px solid rgba(184, 115, 208, 0.6)"
                        : "1px solid rgba(255, 255, 255, 0.12)",
                      boxShadow: active
                        ? "0 2px 10px rgba(120, 100, 200, 0.35)"
                        : "none",
                      transition:
                        "background 0.15s, border-color 0.15s, box-shadow 0.15s",
                      "&:hover": {
                        background: active
                          ? "linear-gradient(135deg, #7864c8 0%, #b873d0 100%)"
                          : "rgba(255, 255, 255, 0.14)",
                      },
                    }}
                  >
                    {preset.label}
                  </ButtonBase>
                  <Typography
                    sx={{
                      fontSize: "0.65rem",
                      opacity: 0.6,
                      mt: 0.3,
                      minHeight: "0.85rem",
                      lineHeight: 1,
                    }}
                  >
                    {preset.sublabel ?? ""}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </SwipeableDrawer>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100dvh",
          }}
        >
          <ReactPlayer
            ref={setPlayerEl}
            src={`https://youtu.be/${video?.id}`}
            width={"100%"}
            height={"100dvh"}
            controls={true}
            playbackRate={playbackRate}
            onPlay={handleOnPlay}
            onPause={handleOnPause}
            onTimeUpdate={handleTimeUpdate}
          />
          {displaySubtitles && (subtitle || translation) && (
            <Box
              sx={{
                position: "absolute",
                bottom: "0",
                width: "100%",
                textAlign: "center",
                background: "rgba(0, 0, 0, 0.4)",
                paddingY: 1,
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontSize: "1.4rem",
                  lineHeight: 1.5,
                  color: "white",
                  paddingX: 1,
                }}
              >
                {subtitle || " "}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "0.8rem",
                  lineHeight: 1.5,
                  color: "rgb(255, 255, 255, 0.8)",
                  paddingX: 1,
                }}
              >
                {translation || " "}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Dialog>
  );
}
