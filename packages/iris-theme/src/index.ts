import { createMuiTheme } from "@material-ui/core";

// const palette = {
//   coolGrey: {
//     10: "#f2f4f8",
//     20: "#dde1e6",
//     30: "#c1c7cd",
//     40: "#a2a9b0",
//     50: "#878d96",
//     60: "#697077",
//     70: "#4d5358",
//     80: "#343a3f",
//     90: "#1b1f21",
//     // 90: "#21272a",
//     // 100: "#1b1f21",
//     100: "#121619",
//   },
//   blue: {
//     10: "#edf5ff",
//     20: "#d0e2ff",
//     30: "#a6c8ff",
//     40: "#78a9ff",
//     50: "#4589ff",
//     60: "#0f62fe",
//     70: "#0043ce",
//     80: "#002d9c",
//     90: "#001d6c",
//     100: "#001141",
//   },
// };

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
    grey: {
      50: "#f2f4f8",
      100: "#dde1e6",
      200: "#c1c7cd",
      300: "#a2a9b0",
      400: "#878d96",
      500: "#697077",
      600: "#4d5358",
      700: "#343a3f",
      800: "#1b1f21",
      900: "#121619",
    },
    primary: {
      main: "#0f62fe",
      dark: "#0043ce",
    },
    text: {
      primary: "rgba(255, 255, 255, 1)",
      secondary: "rgba(255, 255, 255, 0.87)",
      disabled: "rgba(255, 255, 255, 0.2)",
      hint: "rgba(255, 255, 255, 0.53)",
    },
    action: {
      hover: "rgba(255, 255, 255, 0.06)",
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
  default: theme.palette.grey[900],
  paper: theme.palette.grey[800],
};

theme.overrides = {
  MuiCssBaseline: {
    "@global": {
      body: {
        lineHeight: 1,
      },
    },
  },
  MuiButton: {
    root: {
      justifyContent: "space-between",
      textTransform: "none",
      backgroundColor: theme.palette.primary.main,
      maxWidth: "20rem",
      minWidth: "13.75rem",
      height: "3rem",
      "&:hover": {
        backgroundColor: theme.palette.primary.dark,
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
      backgroundColor: theme.palette.primary.main,
      height: 1,
    },
  },
  MuiAppBar: {
    colorPrimary: {
      backgroundColor: theme.palette.grey[900],
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
