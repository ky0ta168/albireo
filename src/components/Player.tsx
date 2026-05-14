import { useState, type SyntheticEvent } from "react";
import { Dialog, IconButton, Box, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
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
      const current = video.subtitles.find(
        (s: KotodamaSubtitle) =>
          currentMs >= s.startMs && currentMs < s.startMs + s.durationMs,
      );
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
      <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            color: "white",
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(16px) saturate(180%)",
            WebkitBackdropFilter: "blur(16px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            borderRadius: "50%",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
            zIndex: 10000,
            WebkitTapHighlightColor: "transparent",
            "&:active": {
              background: "rgba(255, 255, 255, 0.3)",
            },
          }}
        >
          <IconButton
            color="inherit"
            onClick={() => {
              clearSubtiles();
              onClose();
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
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
            src={`https://youtu.be/${video?.id}`}
            width={"100%"}
            height={"100dvh"}
            controls={true}
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
