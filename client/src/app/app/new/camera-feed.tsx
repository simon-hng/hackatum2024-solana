"use client";

import React from "react";
import { useRef, useEffect } from "react";

export const CameraFeed = () => {
  const myVideoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream: MediaStream) => {
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error("Error accessing media devices.", error);
      });
  }, []);

  return (
    <div className="relative">
      <video
        className="mx-auto h-screen"
        playsInline
        ref={myVideoRef}
        autoPlay
      />
    </div>
  );
};
