import { useState, type ChangeEvent } from "react";
import {
  Dialog,
  IconButton,
  Box,
  Stack,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import * as XLSX from "xlsx";
import {
  getVideoDataList,
  type VideoData,
  type VideoSubtitles,
  type KotodamaSubtitle,
  type LanguageReactorSubtitles,
} from "../utils";

type SaveVideoProps = {
  open: boolean;
  onClose: () => void;
  handleSetVideoDataList: (list: VideoData[]) => void;
};

const glassInputSx = {
  "& .MuiOutlinedInput-root": {
    background: "rgba(255, 255, 255, 0.04)",
    borderRadius: "12px",
    "& fieldset": {
      border: "1px solid rgba(255, 255, 255, 0.12)",
    },
    "&:hover fieldset": {
      border: "1px solid rgba(255, 255, 255, 0.22)",
    },
    "&.Mui-focused fieldset": {
      border: "1.5px solid rgba(184, 115, 208, 0.8)",
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(232, 232, 240, 0.6)",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "rgba(184, 115, 208, 0.9)",
  },
  "& .MuiOutlinedInput-input": {
    color: "#e8e8f0",
  },
};

function SaveVideo({ open, onClose, handleSetVideoDataList }: SaveVideoProps) {
  const [videoId, setVideoId] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [subtitles, setSubtitles] = useState<VideoSubtitles | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const ext = file.name.toLowerCase().split(".").pop();

    if (ext === "json") {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string) as {
            id?: string;
            title?: string;
            subtitles?: KotodamaSubtitle[];
          };
          if (!Array.isArray(data.subtitles)) {
            alert("Invalid JSON: subtitles array is missing");
            return;
          }
          setSubtitles(data.subtitles);
          if (data.id) setVideoId(data.id);
          if (data.title) setVideoTitle(data.title);
        } catch (err) {
          alert("Failed to parse JSON: " + (err as Error).message);
        }
      };
      return;
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
      }) as unknown[][];

      const parsed: LanguageReactorSubtitles = {};
      json.slice(1).forEach((row) => {
        const time = row[0]?.toString().trim();
        const subtitle = row[1]?.toString().trim() ?? "";
        const translation = row[2]?.toString().trim() ?? "";

        if (time) {
          parsed[time] = { subtitle, translation };
        }
      });

      setSubtitles(parsed);
    };
  };

  const handleSave = () => {
    const subtitlesData: VideoData = {
      id: videoId,
      title: videoTitle,
      subtitles: subtitles,
    };

    const videoDataList = getVideoDataList();
    videoDataList.push(subtitlesData);

    window.localStorage.setItem("videoDataList", JSON.stringify(videoDataList));

    handleSetVideoDataList(videoDataList);

    clearInput();
    onClose();
  };

  const clearInput = () => {
    setVideoId("");
    setVideoTitle("");
    setFileName("");
    setSubtitles(null);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        backdrop: {
          sx: {
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          },
        },
        paper: {
          sx: {
            background: "#1a1a26",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)",
          },
        },
      }}
    >
      <Box
        sx={{
          paddingX: 2,
          paddingY: 1.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <Typography
          sx={{
            fontWeight: 600,
            color: "#e8e8f0",
            letterSpacing: "0.02em",
          }}
        >
          Save
        </Typography>
        <IconButton
          size="small"
          onClick={() => {
            clearInput();
            onClose();
          }}
          aria-label="close"
          sx={{
            color: "rgba(232, 232, 240, 0.7)",
            WebkitTapHighlightColor: "transparent",
            "&:active": {
              background: "rgba(255, 255, 255, 0.12)",
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ paddingX: 2, paddingY: 2 }}>
        <Stack spacing={1.5}>
          <Box>
            <input
              type="file"
              id="file-input"
              accept=".xlsx, .xls, .json"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <label htmlFor="file-input">
              <Button
                component="span"
                fullWidth
                startIcon={<CloudUploadRoundedIcon />}
                sx={{
                  textTransform: "none",
                  color: "#e8e8f0",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1.5px dashed rgba(184, 115, 208, 0.5)",
                  borderRadius: "12px",
                  paddingY: 1.4,
                  minHeight: 44,
                  "&:active": {
                    background: "rgba(184, 115, 208, 0.15)",
                  },
                }}
              >
                {fileName || "Select JSON / Excel"}
              </Button>
            </label>
          </Box>
          <TextField
            label="ID"
            variant="outlined"
            fullWidth
            value={videoId}
            size="small"
            onChange={(e) => setVideoId(e.target.value)}
            sx={glassInputSx}
          />
          <TextField
            label="Title"
            variant="outlined"
            fullWidth
            value={videoTitle}
            size="small"
            onChange={(e) => setVideoTitle(e.target.value)}
            sx={glassInputSx}
          />

          <Button
            fullWidth
            onClick={handleSave}
            sx={{
              textTransform: "none",
              color: "white",
              background: "linear-gradient(135deg, #7864c8 0%, #b873d0 100%)",
              borderRadius: "12px",
              paddingY: 1.4,
              minHeight: 44,
              fontWeight: 600,
              letterSpacing: "0.02em",
              boxShadow: "0 6px 20px rgba(120, 100, 200, 0.35)",
              "&:active": {
                background: "linear-gradient(135deg, #6854b8 0%, #a863c0 100%)",
              },
            }}
          >
            Save
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
}

export default SaveVideo;
