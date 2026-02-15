import getPlaylistData from "./getPlaylistData.server";
import { prisma } from "~/utils/db.server";
import fs from "fs";
import { exec } from "child_process";

const syncPlaylist = async () => {
  const currentVideos = await getPlaylistData();
  const now = new Date();

  const videosPath = `${import.meta.dirname}../../public/videos/`;

  if (!fs.existsSync(videosPath)) {
    fs.mkdirSync(videosPath, { recursive: true });
  }

  const videoFilenames = fs.readdirSync(videosPath);

  // 1. Update/Insert current videos
  for (const v of currentVideos) {
    await prisma.video.upsert({
      where: { youtubeId: v.id },
      update: { title: v.title, lastSeenAt: now, status: "AVAILABLE" },
      create: {
        youtubeId: v.id,
        videoId: v.videoId,
        title: v.title,
        thumbnailUrl: v.thumbnail,
        status: "AVAILABLE",
      },
    });

    const filename = `${v.videoId}.webm`;

    if (!videoFilenames.includes(filename)) {
      console.time(`${v.title} (${v.videoId}) download`);
      await new Promise((res, rej) =>
        exec(
          `yt-dlp -f "bv+ba/b" -o "${videosPath}%(id)s.%(ext)s" https://youtube.com/watch?v=${v.videoId}`,
          (err) => (err ? rej(err) : res(true)),
        ),
      );
      console.timeEnd(`${v.title} (${v.videoId}) download`);
    }
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
