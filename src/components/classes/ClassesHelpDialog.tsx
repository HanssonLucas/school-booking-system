"use client";

import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useTranslations } from "@/i18n/useTranslations";
import HowItWorksDialog from "@/components/common/HowItWorksDialog";

type ClassesHelpDialogProps = {
  onClose: () => void;
};

export default function ClassesHelpDialog({ onClose }: ClassesHelpDialogProps) {
  const { t } = useTranslations();
  const text = t.teacherClasses.help;

  return (
    <HowItWorksDialog
      open
      onClose={onClose}
      eyebrow={text.eyebrow}
      title={text.title}
      description={text.description}
      items={[
        {
          id: "create",
          title: text.createTitle,
          description: text.createDescription,
          icon: <SchoolOutlinedIcon />,
        },
        {
          id: "join",
          title: text.joinTitle,
          description: text.joinDescription,
          icon: <PersonAddAltOutlinedIcon />,
        },
        {
          id: "students",
          title: text.studentsTitle,
          description: text.studentsDescription,
          icon: <GroupsOutlinedIcon />,
        },
        {
          id: "manage",
          title: text.manageTitle,
          description: text.manageDescription,
          icon: <SettingsOutlinedIcon />,
        },
        {
          id: "delete",
          title: text.deleteTitle,
          description: text.deleteDescription,
          icon: <DeleteOutlineOutlinedIcon />,
        },
      ]}
    />
  );
}
