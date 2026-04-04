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
      `yt-dlp -f "bv+ba/b" --js-runtimes node --cookies-from-browser firefox -o "${videosPath}/%(id)s.%(ext)s" https://youtube.com/watch?v=${v.videoId}`,
      (err, data) => {
        if (err) return rej(err);

        const lineStrings = data.split("\n");

        const destinationString = lineStrings
          .filter((str) => str.includes("Destination:"))
          .reverse()[0];

        let outputPath = (destinationString ?? "").split("Destination: ")[1];

        const mergerSplit = "[Merger] Merging formats into ";
        const mergerLine = lineStrings.find((line) =>
          line.startsWith(mergerSplit),
        );

        if (mergerLine) {
          outputPath = mergerLine.split(mergerSplit)[1].slice(0, -1);
        }

        const filename = path.basename(outputPath);

        res(filename);
      },
    ),
  )
    .then(async (filename) => {
      console.log(`Downloaded '${v.title}' to filename '${filename}'`);
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
