import getPlaylistData from "./getPlaylistData.server";
import { prisma } from "~/utils/db.server";
import fs from "fs";
import { exec } from "child_process";

const syncPlaylist = async () => {
  const currentVideos = await getPlaylistData();
  const now = new Date();

  const videoFilenames = fs.readdirSync(
    `${import.meta.dirname}../../public/videos/`,
  );

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
      await new Promise((res) => {
        const cmd = exec(
          `yt-dlp -f "bv+ba/b" -o "C:\Users\Calum\Documents\vscode_projects\playlist-backup\public\videos\%(id)s.%(ext)s" https://youtube.com/watch?v=${v.videoId}`,
        );
        cmd.on("exit", res);
      });
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
