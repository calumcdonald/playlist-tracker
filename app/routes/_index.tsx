import { useFetcher, useLoaderData } from "@remix-run/react";
import getVideos from "~/utils/getVideos.server";
import syncPlaylist from "~/utils/syncPlaylist.server";

export async function action() {
  await syncPlaylist();

  return { success: true };
}

export async function loader() {
  const videos = await getVideos();

  return { videos };
}

const Playlist = () => {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  return (
    <div>
      <button onClick={() => fetcher.submit({}, { method: "POST" })}>
        Refresh
      </button>

      {data.videos.map((video) => (
        <div>
          <p key={video.id}>{video.title}</p>
          {video.thumbnailUrl ? <img src={video.thumbnailUrl} /> : <></>}
        </div>
      ))}
    </div>
  );
};

export default Playlist;
