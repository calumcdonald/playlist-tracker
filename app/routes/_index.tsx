import { useFetcher, useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import { useState } from "react";
import { prisma } from "~/utils/db.server";
import getVideos from "~/utils/getVideos.server";
import syncPlaylist from "~/utils/syncPlaylist.server";

type Filter = "all" | "available" | "unavailable";

export async function action() {
  await syncPlaylist();

  const metadataKey = "last_refresh";
  const now = new Date().toISOString();

  await prisma.metadata.upsert({
    where: { type: metadataKey },
    create: { type: metadataKey, value: now },
    update: { value: now },
  });

  return { success: true };
}

export async function loader() {
  const [videos, lastResync] = await Promise.all([
    getVideos(),
    prisma.metadata.findUnique({
      where: { type: "last_refresh" },
    }),
  ]);

  return {
    videos,
    lastResync: lastResync?.value,
  };
}

const Playlist = () => {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const [filter, setFilter] = useState<Filter>("all");
  const [showNames, setShowNames] = useState<boolean>(false);
  const [lastResync, setLastResync] = useState(data.lastResync);

  const filters: { label: string; type: Filter }[] = [
    {
      label: `${data.videos.length} total`,
      type: "all",
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
            className={`filter${filter === filterItem.type ? " selected" : ""}`}
            onClick={() => handleFilterClick(filterItem.type)}
          >
            {filterItem.label}
          </div>
        ))}
        <div
          className={`filter${showNames ? " selected" : ""}`}
          onClick={() => setShowNames((prev) => !prev)}
        >
          show names
        </div>
      </div>

      <div className="playlist-container">
        {filterVideos(data.videos).map((video) => (
          <div className="video-card">
            <a
              href={video.filename ? `/videos/${video.filename}` : undefined}
              target="_blank"
            >
              {showNames ? (
                <div className="video-info">
                  <span className="video-title" key={video.id}>
                    {video.title.length > 57
                      ? `${video.title.slice(0, 57)}...`
                      : video.title}
                  </span>
                </div>
              ) : (
                <></>
              )}
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
