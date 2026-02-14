import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import getPlaylistData from "../utils/getPlaylistData";

export async function loader() {
  const videos = await getPlaylistData();

  return json(
    { videos },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=3600",
      },
    },
  );
}

const Playlist = () => {
  const data = useLoaderData<typeof loader>();

  console.log(data.videos);

  return <p>Hello</p>;
};

export default Playlist;
