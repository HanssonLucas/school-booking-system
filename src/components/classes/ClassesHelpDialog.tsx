"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useTranslations } from "@/i18n/useTranslations";
import ClassDialogHeader, {
  classButtonSx,
  classDialogPaperSx,
} from "./ClassDialogHeader";

type ClassesHelpDialogProps = { onClose: () => void };

export default function ClassesHelpDialog({ onClose }: ClassesHelpDialogProps) {
  const { t } = useTranslations();
  const text = t.teacherClasses.help;
  const topics = [
    {
      key: "create",
      title: text.createTitle,
      description: text.createDescription,
      icon: <SchoolOutlinedIcon />,
    },
    {
      key: "join",
      title: text.joinTitle,
      description: text.joinDescription,
      icon: <PersonAddAltOutlinedIcon />,
    },
    {
      key: "students",
      title: text.studentsTitle,
      description: text.studentsDescription,
      icon: <GroupsOutlinedIcon />,
    },
    {
      key: "manage",
      title: text.manageTitle,
      description: text.manageDescription,
      icon: <SettingsOutlinedIcon />,
    },
    {
      key: "delete",
      title: text.deleteTitle,
      description: text.deleteDescription,
      icon: <DeleteOutlineOutlinedIcon />,
    },
  ];

  return (
    <Dialog
      open
      fullWidth
      maxWidth="sm"
      scroll="paper"
      onClose={onClose}
      aria-labelledby="classes-help-heading"
      slotProps={{ paper: { sx: classDialogPaperSx } }}
    >
      <ClassDialogHeader
        id="classes-help-heading"
        title={text.title}
        description={text.description}
        icon={<HelpOutlineRoundedIcon />}
      />
      <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack
          component="ul"
          spacing={3}
          sx={{ m: 0, p: 0, listStyle: "none" }}
        >
          {topics.map((topic) => (
            <Stack
              component="li"
              direction="row"
              spacing={2}
              key={topic.key}
              sx={{ alignItems: "flex-start" }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  borderRadius: 2.5,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "action.hover",
                  color: "primary.main",
                }}
              >
                {topic.icon}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  component="h3"
                  variant="subtitle1"
                  sx={{ fontWeight: 800, mb: 0.5 }}
                >
                  {topic.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.7 }}
                >
                  {topic.description}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: { xs: 3, sm: 4 }, pb: { xs: 3, sm: 4 }, pt: 2 }}>
        <Button
          autoFocus
          variant="contained"
          onClick={onClose}
          sx={classButtonSx}
        >
          {t.common.close}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
