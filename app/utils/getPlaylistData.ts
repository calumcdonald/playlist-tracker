type PlaylistData = {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
};

const getPlaylistData = async (pageToken?: string): Promise<PlaylistData[]> => {
  const playlistId = process.env.PLAYLIST_ID!;
  const apiKey = process.env.YOUTUBE_API_KEY!;

  const url = new URL(
    "/youtube/v3/playlistItems",
    "https://www.googleapis.com",
  );
  const params = new URLSearchParams();
  params.set("part", "snippet,contentDetails");
  params.set("maxResults", "50");
  params.set("playlistId", playlistId);
  params.set("key", apiKey);
  if (pageToken) params.set("pageToken", pageToken);

  url.search = params.toString();

  const res = await fetch(url);
  if (!res.ok) {
    const errorDetails = await res.json();
    console.error("YouTube API Error:", JSON.stringify(errorDetails, null, 2));
    throw new Error(`API Error: ${res.status}`);
  }

  const data = await res.json();
  const items = data.items || [];

  if (data.nextPageToken) {
    const nextItems = await getPlaylistData(data.nextPageToken);
    return [...items, ...nextItems];
  }

  return items;
};

export default getPlaylistData;
