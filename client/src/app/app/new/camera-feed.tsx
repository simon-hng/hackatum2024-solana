"use client";

import {
  createClient,
  type ListenLiveClient,
  LiveTranscriptionEvents,
} from "@deepgram/sdk";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { env } from "~/env";
import { cn } from "~/lib/utils";

const deepgram = createClient(env.NEXT_PUBLIC_DEEPGRAM_API_KEY);

export const CameraFeed = () => {
  let microphone: MediaRecorder;
  const beginAudioRecording = async (connection: ListenLiveClient) => {
    microphone = await navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then((stream) => new MediaRecorder(stream));

    microphone.start(500);

    microphone.onstart = () => {
      console.log("client: microphone opened");
    };

    microphone.onstop = () => {
      console.log("client: microphone closed");
      connection.requestClose();
    };

    microphone.ondataavailable = (e) => {
      const data = e.data;
      console.log("client: sent data to websocket");
      connection.send(data);
    };
  };

  const startRecording = async () => {
    setIsRecording(true);

    // saving tokens like the broke boy i am
    return;

    const connection = deepgram.listen.live({
      model: "nova-2",
      language: "en-US",
      smart_format: true,
    });

    connection.on(LiveTranscriptionEvents.Open, () => {
      connection.on(LiveTranscriptionEvents.Close, () => {
        console.log("Connection closed.");
      });

      connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        console.log(data.channel.alternatives[0].transcript);
        setText((text) => text + data.channel.alternatives[0].transcript);
      });

      connection.on(LiveTranscriptionEvents.Metadata, (data) => {
        console.log(data);
      });

      connection.on(LiveTranscriptionEvents.Error, (err) => {
        console.error(err);
      });
    });

    await beginAudioRecording(connection);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    microphone?.stop();
  };

  // Video Preview
  const myVideoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
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

  const [isRecording, setIsRecording] = React.useState(false);
  const [text, setText] = React.useState("");

  return (
    <div className="animate relative flex h-screen flex-col overflow-hidden p-2 pb-20">
      <video
        className={cn("h-full rounded-lg object-cover")}
        playsInline
        ref={myVideoRef}
        autoPlay
      />

      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "32rem" }}
            exit={{ height: 0 }}
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-24 left-1/2 -translate-x-1/2">
        <div
          className={cn(
            "border-border transform rounded-full border-2 p-1 duration-200",
            {
              "bg-background/20 border-red-500 p-4": isRecording,
            },
          )}
        >
          <Button
            className={cn("h-16 w-16 rounded-full", {
              "border-red-500 bg-red-500 active:bg-red-500": isRecording,
            })}
            variant="outline"
            onTouchStart={() => startRecording()}
            onTouchEnd={() => stopRecording()}
          />
        </div>
      </div>
    </div>
  );
};
