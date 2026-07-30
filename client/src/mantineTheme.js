import { createTheme } from "@mantine/core";

/**
 * Only the primary brand blue is custom — every other color (gray, dark,
 * white, black) is Mantine's own default scale, same as ui.mantine.dev
 * templates use. Mixing a custom gray/dark scale in on top of the brand
 * color made borders, dimmed text, and dark sections look muddy/off.
 */
export const mantineTheme = createTheme({
  primaryColor: "brand",
  primaryShade: 6,
  fontFamily: "inherit",
  headings: { fontFamily: "inherit", fontWeight: "800" },
  defaultRadius: "md",
  colors: {
    brand: [
      "#EDF3FC",
      "#DCE8FA",
      "#B7CEF2",
      "#8FB2EA",
      "#6E9AE3",
      "#4886DE",
      "#004F9E", // 6 Deep Blue (primary)
      "#00458A",
      "#003B76",
      "#002E5C",
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
