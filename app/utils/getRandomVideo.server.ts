import { Video } from "@prisma/client";
import { prisma } from "./db.server";

const getRandomVideo = async () => {
  const queryResult: any = await prisma.$queryRaw`
        SELECT * FROM "Video" 
        ORDER BY RANDOM() 
        LIMIT 1`;

  return queryResult[0] as Video;
};

export default getRandomVideo;
