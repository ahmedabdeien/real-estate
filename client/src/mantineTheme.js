import { createTheme } from "@mantine/core";

/**
 * Core palette (client-provided):
 * Deep Blue #004F9E (primary) · Sky Blue #4DA3E3 · Ice Blue #DCEEFF
 * Off White #F7F9FC · Deep Navy #0B1F33 · Cool Gray #8A98A8
 */
export const mantineTheme = createTheme({
  primaryColor: "brand",
  primaryShade: 6,
  fontFamily: "inherit",
  headings: { fontFamily: "inherit", fontWeight: "800" },
  defaultRadius: "md",
  white: "#F7F9FC",
  black: "#0B1F33",
  colors: {
    brand: [
      "#F7F9FC", // 0 Off White
      "#DCEEFF", // 1 Ice Blue
      "#94C8F1",
      "#4DA3E3", // 3 Sky Blue
      "#2E81C7",
      "#1364AF",
      "#004F9E", // 6 Deep Blue (primary)
      "#043E79",
      "#082D53",
      "#0B1F33", // 9 Deep Navy
    ],
    gray: [
      "#F7F9FC", // 0 Off White
      "#DCE1E7",
      "#C6CDD6",
      "#B0BAC5",
      "#9AA7B5",
      "#8A98A8", // 5 Cool Gray
      "#5E6E7F",
      "#3E4F62",
      "#24374A",
      "#112539",
    ],
    dark: [
      "#B6BCC2",
      "#919AA3",
      "#6D7985",
      "#4F5E6C",
      "#374758",
      "#233547",
      "#172A3D",
      "#0B1F33", // 7 Deep Navy
      "#0B1F33", // 8 Deep Navy (surfaces)
      "#071421", // 9 darkest
    ],
  },
  components: {
    Button: {
      defaultProps: { radius: "md" },
    },
    Card: {
      defaultProps: { radius: "lg" },
    },
  },
});
