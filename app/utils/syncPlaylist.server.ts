import getPlaylistData from "./getPlaylistData.server";
import { prisma } from "~/utils/db.server";
import fs from "fs";
import downloadVideo from "./downloadVideo.server";

const syncPlaylist = async () => {
  const currentVideos = await getPlaylistData();
  const now = new Date();

  const videosPath = `${import.meta.dirname}../../public/videos/`;

  if (!fs.existsSync(videosPath)) {
    fs.mkdirSync(videosPath, { recursive: true });
  }

  const videoFilenames = fs.readdirSync(videosPath);
  const trimmedNames = videoFilenames.map((filename) => filename.split(".")[0]);

  // 1. Update/Insert current videos
  for (const v of currentVideos) {
    await prisma.video.upsert({
      where: { youtubeId: v.id },
      update: {
        lastSeenAt: now,
      },
      create: {
        youtubeId: v.id,
        videoId: v.videoId,
        title: v.title,
        thumbnailUrl: v.thumbnail,
        status: "AVAILABLE",
      },
    });

    const filename = v.videoId;

    if (!trimmedNames.includes(filename)) {
      await downloadVideo({ v, videosPath });
    }
  }

  // 2. Mark missing videos as UNAVAILABLE
  await prisma.video.updateMany({
    where: {
      lastSeenAt: { lt: now },
      status: "AVAILABLE",
    },
    data: { status: "UNAVAILABLE" },
  });
};

export default syncPlaylist;
