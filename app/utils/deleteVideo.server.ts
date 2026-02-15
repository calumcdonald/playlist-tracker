import { prisma } from "./db.server";
import fs from "fs";

const deleteVideo = async ({
  id,
  videoId,
  youtubeId,
  removeDownload = true,
}: {
  id?: string;
  videoId?: string;
  youtubeId?: string;
  removeDownload?: boolean;
}) => {
  if (!id && !videoId && !youtubeId) return;

  const video = await prisma.video.findFirst({
    where: { videoId, id, youtubeId },
  });

  if (!video) return;

  await prisma.video.delete({ where: { id: video.id } });

  if (!video.filename || !removeDownload) return;

  const videosPath = `${import.meta.dirname}../../public/videos/${
    video.filename
  }`;

  fs.unlinkSync(videosPath);
};

export default deleteVideo;
