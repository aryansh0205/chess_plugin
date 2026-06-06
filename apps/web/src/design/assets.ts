const base = import.meta.env.BASE_URL.replace(/\/$/, "");

function publicFile(path: `/${string}`): string {
  return `${base}${path}`;
}

/** Static files in `public/` — reference paths once and import from here. */
export const assets = {
  images: {
    // example: logo: publicFile("/images/logo.svg"),
  },
  icons: {
    // example: favicon: publicFile("/favicon.ico"),
  },
} as const;

export { publicFile };
