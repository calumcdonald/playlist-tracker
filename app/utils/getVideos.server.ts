import { prisma } from "~/utils/db.server";

const getVideos = async () => {
  const result = await prisma.video.findMany();

  return result;
};

export default getVideos;
