import { Prisma, Video } from "@prisma/client";
import { prisma } from "./db.server";

const getRandomVideo = async (params?: { notIds?: string[] }) => {
  const notInClause = params?.notIds?.length
    ? Prisma.sql`WHERE id NOT IN (${Prisma.join(params.notIds)})`
    : Prisma.empty;

  let queryResult: any = await prisma.$queryRaw`
        SELECT * FROM "Video"
        ${notInClause}
        ORDER BY RANDOM() 
        LIMIT 1`;

  if (!queryResult) {
    queryResult = await prisma.$queryRaw`
        SELECT * FROM "Video"
        ORDER BY RANDOM() 
        LIMIT 1`;
  }

  return queryResult[0] as Video;
};

export default getRandomVideo;
