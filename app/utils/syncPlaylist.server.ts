import getPlaylistData from "./getPlaylistData.server";
import { prisma } from "~/utils/db.server";

type PlaylistData = {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
};

const syncPlaylist = async () => {
  const currentVideos = await getPlaylistData();
  const now = new Date();

  // 1. Update/Insert current videos
  for (const v of currentVideos) {
    await prisma.video.upsert({
      where: { youtubeId: v.id },
      update: { title: v.title, lastSeenAt: now, status: "AVAILABLE" },
      create: {
        youtubeId: v.id,
        title: v.title,
        thumbnailUrl: v.thumbnail,
        status: "AVAILABLE",
      },
    });
  }

  // 2. Mark missing videos as UNAVAILABLE
  await prisma.video.updateMany({
    where: {
      lastSeenAt: { lt: now }, // If not updated in this sync cycle
      status: "AVAILABLE",
    },
    data: { status: "UNAVAILABLE" },
  });
};

export default syncPlaylist;
