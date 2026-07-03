const PREFIX = '[pause-reflexe]';

export function debug(event, details = undefined) {
  if (details === undefined) {
    console.debug(PREFIX, event);
    return;
  }

  console.debug(PREFIX, event, details);
}
