const COOKIE_NAME = "player-name";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function setPlayerCookie(name: string) {
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(name)}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
}

export function getPlayerCookieServer(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
