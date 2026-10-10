export const JOIN_OPENS_MIN_BEFORE = 15;
export const LATE_AFTER_MIN = 5;
export const MEET_URL_PATTERN = /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/;

/** All "Join lesson" buttons must use this so joins are logged and permission-checked. */
export const joinHref = (sessionId: string) => `/join/${sessionId}`;
