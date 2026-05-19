export function buildApiUrl(baseUrl: string, path: string): string {
  const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (!cleanBaseUrl) return cleanPath;

  if (cleanBaseUrl.endsWith("/api") && cleanPath.startsWith("/api/")) {
    return `${cleanBaseUrl}${cleanPath.slice("/api".length)}`;
  }

  if (cleanBaseUrl.endsWith("/api") && cleanPath === "/api") {
    return cleanBaseUrl;
  }

  return `${cleanBaseUrl}${cleanPath}`;
}
