import { createMuiTheme } from "@material-ui/core";

interface CarbonColorRange {
  10: string;
  20: string;
  30: string;
  40: string;
  50: string;
  60: string;
  70: string;
  80: string;
  90: string;
  100: string;
}

declare module "@material-ui/core/styles/createPalette" {
  interface Palette {
    blue: CarbonColorRange;
    coolGray: CarbonColorRange;
  }
  interface PaletteOptions {
    blue: CarbonColorRange;
    coolGray: CarbonColorRange;
  }
}

const theme = createMuiTheme({
  typography: {
    fontFamily: [
      "IBM Plex Sans",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
  },
  palette: {
    type: "dark",
    coolGray: {
      10: "#f2f4f8",
      20: "#dde1e6",
      30: "#c1c7cd",
      40: "#a2a9b0",
      50: "#878d96",
      60: "#697077",
      70: "#4d5358",
      80: "#343a3f",
      90: "#21272a",
      100: "#121619",
    },
    blue: {
      10: "#edf5ff",
      20: "#d0e2ff",
      30: "#a6c8ff",
      40: "#78a9ff",
      50: "#4589ff",
      60: "#0f62fe",
      70: "#0043ce",
      80: "#002d9c",
      90: "#001d6c",
      100: "#001141",
    },
  },
  shape: {
    borderRadius: 0,
  },
  props: {
    MuiButtonBase: {
      disableRipple: true,
    },
  },
  shadows: [
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
  ],
});

theme.palette.background = {
  default: theme.palette.coolGray[100],
  paper: theme.palette.coolGray[90],
};

theme.overrides = {
  MuiButton: {
    root: {
      justifyContent: "space-between",
      textTransform: "none",
      backgroundColor: theme.palette.blue[60],
      maxWidth: "20rem",
      minWidth: "13.75rem",
      height: "3rem",
      "&:hover": {
        backgroundColor: theme.palette.blue[70],
      },
    },

    endIcon: {
      marginLeft: ".75rem",
      marginRight: "0",
    },

    text: {
      color: "white",
      padding: "0 1rem",
    },
  },
  MuiTab: {
    root: {
      textTransform: "none",
      "&:hover": {
        color: "white",
      },
    },
    textColorPrimary: {
      "&$selected": {
        color: "white",
      },
    },
  },
  MuiTabs: {
    indicator: {
      backgroundColor: theme.palette.blue[60],
      height: 1,
    },
  },
  MuiAppBar: {
    colorPrimary: {
      backgroundColor: theme.palette.coolGray[100],
    },
  },
  MuiStepLabel: {
    label: {
      "&$alternativeLabel": {
        textAlign: "left",
      },
    },
  },
};

export default theme;
