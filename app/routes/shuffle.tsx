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
  const videoTitleRef = useRef<HTMLDivElement | null>(null);

  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const [video, setVideo] = useState(data.randomVideo);
  const [history, setHistory] = useState<string[]>([data.randomVideo.videoId]);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);

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
      { history },
      { method: "POST", encType: "application/json" },
    );
  };

  const handleVideoHover = () => {
    if (!videoTitleRef.current) return;

    if (hoverTimer) clearTimeout(hoverTimer);

    videoTitleRef.current.style.opacity = "1";

    const newTimer = setTimeout(() => {
      if (!videoTitleRef.current) return;
      videoTitleRef.current.style.opacity = "0";
    }, 2000);

    setHoverTimer(newTimer);
  };

  return (
    <>
      <video
        className="shuffle-video"
        ref={videoRef}
        src={`videos/${video.filename}`}
        controls
        autoPlay
        muted
        onEnded={getNextVideo}
        onMouseMove={handleVideoHover}
      />
      <div ref={videoTitleRef} className="shuffle-video-title">
        {video.title}
      </div>
    </>
  );
};

export default Shuffle;
