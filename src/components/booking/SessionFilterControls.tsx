import {
  Box,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { useTranslations } from "@/i18n/useTranslations";

type SortOption = {
  value: string;
  label: string;
};

type FilterSwitch = {
  key: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

type SessionFilterControlsProps = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  sortOption: string;
  onSortOptionChange: (value: string) => void;
  sortOptions: SortOption[];
  switches: FilterSwitch[];
  visibleCount: number;
  totalCount: number;
};

export default function SessionFilterControls({
  searchQuery,
  onSearchQueryChange,
  sortOption,
  onSortOptionChange,
  sortOptions,
  switches,
  visibleCount,
  totalCount,
}: SessionFilterControlsProps) {
  const { t } = useTranslations();

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 4,
        bgcolor: "background.default",
      }}
    >
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            label={t.sessionFilters.searchLabel}
            placeholder={t.sessionFilters.searchPlaceholder}
            fullWidth
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <SearchOutlinedIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
              },
            }}
          />

          <TextField
            select
            label={t.sessionFilters.sortLabel}
            value={sortOption}
            onChange={(event) => onSortOptionChange(event.target.value)}
            sx={{
              minWidth: { xs: "100%", md: 260 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
              },
            }}
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
          }}
        >
          {switches.length > 0 && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              {switches.map((filterSwitch) => (
                <FormControlLabel
                  key={filterSwitch.key}
                  control={
                    <Switch
                      checked={filterSwitch.checked}
                      onChange={(event) =>
                        filterSwitch.onChange(event.target.checked)
                      }
                    />
                  }
                  label={filterSwitch.label}
                />
              ))}
            </Stack>
          )}

          <Typography variant="body2" color="text.secondary">
            {t.sessionFilters.showing}{" "}
            <Box component="span" sx={{ fontWeight: 800 }}>
              {visibleCount}
            </Box>{" "}
            {t.sessionFilters.of}{" "}
            <Box component="span" sx={{ fontWeight: 800 }}>
              {totalCount}
            </Box>
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
