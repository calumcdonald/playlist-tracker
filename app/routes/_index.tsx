import { useFetcher, useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import { prisma } from "~/utils/db.server";
import getVideos from "~/utils/getVideos.server";
import syncPlaylist from "~/utils/syncPlaylist.server";

export async function action() {
  const metadataKey = "last_refresh";
  const now = new Date().toISOString();

  await prisma.metadata.upsert({
    where: { type: metadataKey },
    create: { type: metadataKey, value: now },
    update: { value: now },
  });

  await syncPlaylist();

  return { success: true };
}

export async function loader() {
  const videos = await getVideos();

  const lastResync = await prisma.metadata.findUnique({
    where: { type: "last_refresh" },
  });

  return {
    videos,
    lastResync: lastResync?.value,
  };
}

const Playlist = () => {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const minuteDifference = Math.round(
    dayjs().diff(data.lastResync) / 1000 / 60,
  );

  return (
    <div>
      <button onClick={() => fetcher.submit({}, { method: "POST" })}>
        Re-Sync{" "}
        {data.lastResync &&
          minuteDifference > 1 &&
          `(${minuteDifference}m ago)`}
      </button>

      <div className="playlist-container">
        {data.videos.map((video) => (
          <div className="video-card">
            <a href={`/videos/${video.videoId}.webm`} target="_blank">
              {/* <div className="video-info">
              <span className="video-title" key={video.id}>
                {video.title}
              </span>
              <br />
              <span className="video-status">{video.status}</span>
            </div> */}
              {video.thumbnailUrl ? (
                <img className="video-thumb" src={video.thumbnailUrl} />
              ) : (
                <></>
              )}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Playlist;
