import { useFetcher, useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import { useState } from "react";
import { prisma } from "~/utils/db.server";
import deleteVideo from "~/utils/deleteVideo.server";
import getVideos from "~/utils/getVideos.server";
import syncPlaylist from "~/utils/syncPlaylist.server";

type Filter = "all" | "downloaded" | "available" | "unavailable";

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

  const [filter, setFilter] = useState<Filter>("all");
  const [lastResync, setLastResync] = useState(data.lastResync);

  const filters: { label: string; type: Filter }[] = [
    {
      label: `${data.videos.length} total`,
      type: "all",
    },
    {
      label: `${data.videos.filter((v) => v.filename).length} downloaded`,
      type: "downloaded",
    },
    {
      label: `${
        data.videos.filter((v) => v.status === "AVAILABLE").length
      } available`,
      type: "available",
    },
    {
      label: `${
        data.videos.filter((v) => v.status === "UNAVAILABLE").length
      } unavailable`,
      type: "unavailable",
    },
  ];

  const minuteDifference = Math.round(dayjs().diff(lastResync) / 1000 / 60);

  const handleResyncClick = () => {
    setLastResync(new Date().toISOString());

    fetcher.submit({}, { method: "POST" });
  };

  const filterVideos = (videos: typeof data.videos) => {
    if (filter === "available")
      return videos.filter((video) => video.status === "AVAILABLE");
    if (filter === "unavailable")
      return videos.filter((video) => video.status === "UNAVAILABLE");
    if (filter === "downloaded")
      return videos.filter((video) => video.filename);

    return videos;
  };

  const handleFilterClick = (type: Filter) => {
    setFilter(type);
  };

  return (
    <div>
      <div className="control-panel">
        <button onClick={handleResyncClick}>
          Re-Sync{" "}
          {lastResync && minuteDifference > 1 && `(${minuteDifference}m ago)`}
        </button>
        {filters.map((filterItem) => (
          <div
            className={`filter ${
              filter === filterItem.type ? "selected" : undefined
            }`}
            onClick={() => handleFilterClick(filterItem.type)}
          >
            {filterItem.label}
          </div>
        ))}
      </div>

      <div className="playlist-container">
        {filterVideos(data.videos).map((video) => (
          <div className="video-card">
            <a
              href={video.filename ? `/videos/${video.filename}` : undefined}
              target="_blank"
            >
              {/* <div className="video-info">
              <span className="video-title" key={video.id}>
                {video.title}
              </span>
              <br />
              <span className="video-status">{video.status}</span>
            </div> */}
              <img
                className={`video-thumb${
                  !video.filename ? " unavailable" : ""
                }${!video.thumbnailUrl ? " placeholder" : ""}`}
                src={video.thumbnailUrl ?? "/placeholder.webp"}
              />
            </a>
            {video.status === "UNAVAILABLE" ? (
              <img className="unavailable-icon" src="/yt-unavailable.svg" />
            ) : (
              <></>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Playlist;
