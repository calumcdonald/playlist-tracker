import { ActionFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import getRandomVideo from "~/utils/getRandomVideo.server";

export async function loader() {
  const randomVideo = await getRandomVideo();

  return {
    randomVideo,
  };
}

export const action: ActionFunction = async ({ request }) => {
  const { history } = await request.json();
  let randomVideo = await getRandomVideo();

  let attempts = 0;
  while (attempts < 100 && history.includes(randomVideo.videoId)) {
    randomVideo = await getRandomVideo();
    attempts++;
  }

  return {
    randomVideo,
  };
};

const Shuffle = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const [video, setVideo] = useState(data.randomVideo);
  const [history, setHistory] = useState<string[]>([data.randomVideo.videoId]);

  useEffect(() => {
    if (fetcher.data) {
      const newVideo = fetcher.data.randomVideo;
      setVideo(newVideo);
      setHistory((prev) => [...prev, newVideo.videoId]);
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (!videoRef.current) return;

    videoRef.current.addEventListener("fullscreenchange", (e) => {
      const isFullscreenNow = document.fullscreenElement !== null;

      if (isFullscreenNow && videoRef.current && videoRef.current.muted) {
        videoRef.current.muted = false;
        videoRef.current.play();
      }
    });
  }, [videoRef]);

  const getNextVideo = () => {
    fetcher.submit(
      { history: history.join("|") },
      { method: "POST", encType: "application/json" },
    );
  };

  return (
    <>
      <span className="hidden">{video.title}</span>
      <video
        className="shuffle-video"
        ref={videoRef}
        src={`videos/${video.filename}`}
        controls
        autoPlay
        muted
        onEnded={getNextVideo}
      />
    </>
  );
};

export default Shuffle;
