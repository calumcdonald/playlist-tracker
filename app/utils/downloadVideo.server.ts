import path from "path";
import { prisma } from "./db.server";
import { PlaylistVideoData } from "./getPlaylistData.server";
import { exec } from "child_process";

const downloadVideo = async ({
  v,
  videosPath,
}: {
  v: PlaylistVideoData;
  videosPath: string;
}) => {
  console.time(`${v.title} (${v.videoId}) download`);
  await new Promise<string>((res, rej) =>
    exec(
      `yt-dlp -f "bv+ba/b" -o "${videosPath}%(id)s.%(ext)s" https://youtube.com/watch?v=${v.videoId}`,
      (err, data) => {
        if (err) return rej(err);

        const lineStrings = data.split("\n");
        const destinationString = lineStrings.find((str) =>
          str.includes("Destination:"),
        );
        const outputPath = (destinationString ?? "").split("Destination: ")[1];

        const filename = path.basename(outputPath);

        res(filename);
      },
    ),
  )
    .then(async (filename) => {
      await prisma.video.update({
        where: { youtubeId: v.id },
        data: { status: "AVAILABLE", filename },
      });
    })
    .catch(async (e) => {
      console.error(e);

      await prisma.video.update({
        where: { youtubeId: v.id },
        data: { status: "UNAVAILABLE" },
      });
    });
  console.timeEnd(`${v.title} (${v.videoId}) download`);
};

export default downloadVideo;
