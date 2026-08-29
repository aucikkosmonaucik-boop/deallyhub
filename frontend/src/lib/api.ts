export function getApiUrl(): string {
  let url = process.env.NEXT_PUBLIC_API_URL || "https://deallyhub-production.up.railway.app";
  url = url.trim();

  // If user provided a domain without protocol (e.g. deallyhub-production.up.railway.app)
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  // Remove trailing slashes
  return url.replace(/\/+$/, "");
}
