export const youTubeRegexp = /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})[^ "'<>]*/i;

export interface YouTubeUrlInfo {
  id: string;
  t: number;
  url: string;
}

const parseStartTime = (url: string): number => {
  try {
    const ts = new URL(url).searchParams.get('t');
    return ts && /^[0-9]+/.test(ts) ? parseFloat(ts) : 0;
  } catch (e) {
    return 0;
  }
};

export const parseYouTubeUrl = (src: string): YouTubeUrlInfo | null => {
  const r = youTubeRegexp.exec(src);
  if (!r) {
    return null;
  }

  const id = r[1];
  const t = parseStartTime(r[0]);
  const url = new URL(id, 'https://www.youtube.com/embed/');
  if (t) url.searchParams.set('start', String(t));

  return { id, t, url: url.toString() };
};

export default parseYouTubeUrl;
