import React, {
  useState,
  useRef,
  type ChangeEvent,
  type MouseEvent,
} from "react";
import { Typography, Box, AppBar, Menu, Toolbar, Stack } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import FileUploadRoundedIcon from "@mui/icons-material/FileUploadRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import Player from "./components/Player";
import SaveVideo from "./components/SaveVideo";
import { getVideoDataList, type VideoData } from "./utils/index";

const navItemSx = {
  textTransform: "none",
  color: "rgba(232, 232, 240, 0.75)",
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 0,
  paddingY: 0.5,
  paddingX: 1,
  borderRadius: "12px",
  background: "transparent",
  border: "none",
  boxShadow: "none",
  WebkitTapHighlightColor: "transparent",
  "& .MuiButton-startIcon": {
    margin: 0,
  },
  "&:active": {
    color: "#e8e8f0",
    background: "rgba(255, 255, 255, 0.08)",
  },
};

export default function App() {
  const [videoDataList, setVideoDataList] = useState<VideoData[]>(() =>
    getVideoDataList(),
  );
  const [openPlayer, setOpenPlayer] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [openSaveForm, setOpenSaveForm] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedRemoveVideo, setSelectedRemoveVideo] =
    useState<VideoData | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenPlayer = (video: VideoData) => {
    setSelectedVideo(video);
    setOpenPlayer(true);
  };

  const handleClosePlayer = () => {
    setSelectedVideo(null);
    setOpenPlayer(false);
  };

  const handleOpenSaveForm = () => {
    setOpenSaveForm(true);
  };

  const handleCloseSaveForm = () => {
    setOpenSaveForm(false);
  };

  const handleMenuClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setOpenMenu(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpenMenu(false);
  };

  const removeVideoData = () => {
    if (!selectedRemoveVideo) return;
    const videoId = selectedRemoveVideo.id;
    const list = videoDataList.slice().filter((data) => data.id !== videoId);
    setVideoDataList(list);
    window.localStorage.setItem("videoDataList", JSON.stringify(list));
  };

  const handleExport = () => {
    exportLocalStorageToFile();
  };

  const exportLocalStorageToFile = () => {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key === null) continue;
      const raw = localStorage.getItem(key);
      if (raw === null) continue;
      try {
        data[key] = JSON.parse(raw);
      } catch {
        data[key] = raw;
      }
    }

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "videolist.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);

        if (typeof json !== "object" || json === null) {
          alert("Invalid JSON format.");
          return;
        }

        if (window.confirm(`Do you want to load "${file.name}"?`)) {
          for (const [key, value] of Object.entries(json)) {
            const stringValue =
              typeof value === "string" ? value : JSON.stringify(value);
            localStorage.setItem(key, stringValue);
          }
          setVideoDataList(getVideoDataList());
        }
      } catch (err) {
        alert("Failed to parse JSON: " + (err as Error).message);
      }
    };

    reader.readAsText(file);
  };

  return (
    <React.Fragment>
      <AppBar
        elevation={0}
        position="fixed"
        sx={{
          color: "#e8e8f0",
          background: "rgba(15, 15, 23, 0.9)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 1px 12px rgba(0, 0, 0, 0.4)",
        }}
      >
        <Toolbar variant="dense" sx={{ minHeight: 56 }}>
          <PlayArrowRoundedIcon
            sx={{
              marginRight: 0.25,
              color: "white",
              background: "linear-gradient(135deg, #7864c8 0%, #b873d0 100%)",
              borderRadius: "6px",
              padding: "3px",
              fontSize: 16,
              boxShadow: "0 2px 8px rgba(120, 100, 200, 0.35)",
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              letterSpacing: "0.02em",
              color: "#e8e8f0",
              fontSize: "1.75rem",
              lineHeight: 1,
            }}
          >
            Albireo
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          paddingX: 1,
          paddingTop: 8,
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 64px)",
        }}
      >
        <Stack spacing={1}>
          {videoDataList
            .slice()
            .reverse()
            .map((video, index) => (
              <Box
                key={index}
                onClick={() => handleOpenPlayer(video)}
                sx={{
                  display: "flex",
                  alignItems: "stretch",
                  gap: 1.25,
                  padding: 1,
                  background: "#1a1a26",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "14px",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.35)",
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                  transition:
                    "background 0.15s, transform 0.1s, border-color 0.15s",
                  "&:active": {
                    background: "#23233a",
                    borderColor: "rgba(255, 255, 255, 0.18)",
                    transform: "scale(0.985)",
                  },
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    flex: "0 0 50%",
                    maxWidth: "50%",
                    aspectRatio: "16 / 9",
                    borderRadius: "10px",
                    overflow: "hidden",
                    background: "rgba(0, 0, 0, 0.3)",
                  }}
                >
                  <Box
                    component="img"
                    src={`https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`}
                    alt={video.title}
                    loading="lazy"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
                    }}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      borderRadius: 0,
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 0,
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      paddingY: 0.25,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "#e8e8f0",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        lineHeight: 1.35,
                        marginBottom: 0.5,
                        wordBreak: "break-word",
                      }}
                    >
                      {video.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(232, 232, 240, 0.5)",
                        fontFamily: "ui-monospace, SFMono-Regular, monospace",
                        fontSize: "0.7rem",
                      }}
                    >
                      {video.id}
                    </Typography>
                  </Box>
                  <Box
                    onClick={(event: MouseEvent<HTMLElement>) => {
                      event.stopPropagation();
                      handleMenuClick(event);
                      setSelectedRemoveVideo(video);
                    }}
                    sx={{
                      flexShrink: 0,
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      WebkitTapHighlightColor: "transparent",
                      transition: "background 0.15s",
                      "&:active": {
                        background: "rgba(255, 255, 255, 0.12)",
                      },
                    }}
                  >
                    <MoreVertIcon
                      fontSize="small"
                      sx={{
                        color: "rgba(232, 232, 240, 0.7)",
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            ))}
        </Stack>

        {videoDataList.length === 0 && (
          <Box
            sx={{
              marginTop: 6,
              textAlign: "center",
              color: "rgba(232, 232, 240, 0.55)",
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              保存された動画はまだありません
            </Typography>
            <Typography variant="caption">
              「Save」から動画を追加してください
            </Typography>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          height: "calc(env(safe-area-inset-bottom, 0px) + 56px)",
          boxSizing: "border-box",
          paddingX: 1.5,
          paddingTop: 0.5,
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 4px)",
          background: "rgba(15, 15, 23, 0.7)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 -2px 20px rgba(0, 0, 0, 0.4)",
          zIndex: 1100,
        }}
      >
        <Stack direction="row" spacing={0} sx={{ width: "100%" }}>
          <Box component="button" onClick={() => handleExport()} sx={navItemSx}>
            <FileUploadRoundedIcon sx={{ fontSize: 22 }} />
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.7rem",
                lineHeight: 1,
                marginTop: 0.25,
              }}
            >
              Export
            </Typography>
          </Box>
          <Box
            component="button"
            onClick={() => handleOpenSaveForm()}
            sx={navItemSx}
          >
            <AddRoundedIcon sx={{ fontSize: 22 }} />
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.65rem",
                lineHeight: 1,
                marginTop: 0.25,
              }}
            >
              Save
            </Typography>
          </Box>
          <Box component="button" onClick={handleButtonClick} sx={navItemSx}>
            <FileDownloadRoundedIcon sx={{ fontSize: 22 }} />
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.7rem",
                lineHeight: 1,
                marginTop: 0.25,
              }}
            >
              Import
            </Typography>
          </Box>
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </Stack>
      </Box>

      <Player
        open={openPlayer}
        onClose={handleClosePlayer}
        video={selectedVideo}
      />

      <SaveVideo
        open={openSaveForm}
        onClose={handleCloseSaveForm}
        handleSetVideoDataList={setVideoDataList}
      />

      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              background: "#1a1a26",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
              color: "#e8e8f0",
            },
          },
        }}
      >
        <Box
          sx={{
            paddingX: 2,
            paddingY: 1,
            cursor: "pointer",
            transition: "background 0.15s",
            WebkitTapHighlightColor: "transparent",
            "&:active": {
              background: "rgba(255, 255, 255, 0.12)",
            },
          }}
          onClick={() => {
            if (
              selectedRemoveVideo &&
              window.confirm(
                `Do you want to remove "${selectedRemoveVideo.title}"?`,
              )
            ) {
              removeVideoData();
            }
            setOpenMenu(false);
          }}
        >
          <Typography variant="body2" sx={{ color: "#e8e8f0" }}>
            Remove
          </Typography>
        </Box>
      </Menu>
    </React.Fragment>
  );
}
