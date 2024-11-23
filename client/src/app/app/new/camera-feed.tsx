"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import {
  createClient,
  type ListenLiveClient,
  LiveTranscriptionEvents,
} from "@deepgram/sdk";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { env } from "~/env";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Textarea } from "@components/ui/textarea";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { challengeSchema } from "~/lib/schemas/challenge";
import { type User } from "@clerk/nextjs/server";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { EuroInput } from "~/components/euro-input";
import { format } from "date-fns";
import { Calendar } from "~/components/ui/calendar";

const deepgram = createClient(env.NEXT_PUBLIC_DEEPGRAM_API_KEY);

export const CameraFeed = ({
  submit,
  users,
}: {
  submit: (data: z.infer<typeof challengeSchema>) => void;
  users: Pick<User, "id" | "fullName" | "imageUrl">[];
}) => {
  const form = useForm<z.infer<typeof challengeSchema>>({
    resolver: zodResolver(challengeSchema),
    defaultValues: {
      challenged: "",
      title: "",
      amount: "5",
      dueDate: new Date(),
    },
  });

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
    setFormState("recording");

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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
    setFormState("manual");
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

  const STATE = ["initial", "recording", "manual", "done"] as const;
  const [formState, setFormState] =
    React.useState<(typeof STATE)[number]>("initial");

  const [text, setText] = React.useState("");

  return (
    <Form {...form}>
      <form
        className="animate relative flex h-screen flex-col overflow-hidden p-2 pb-20"
        onSubmit={form.handleSubmit((data) => {
          submit({ ...data, challenger: "me" });
        })}
      >
        <motion.video
          exit={{ opacity: 0, height: 0 }}
          className={cn("h-full rounded-2xl object-cover")}
          playsInline
          ref={myVideoRef}
          autoPlay
        />

        <div className="flex flex-col gap-8">
          <AnimatePresence>
            {!(formState === "initial") && (
              <motion.div
                initial={{ height: 0 }}
                animate={{
                  height: "initial",
                  marginBottom: formState === "recording" ? "9rem" : 0,
                }}
                exit={{ height: 0 }}
                className={cn("flex flex-col gap-8 pt-2")}
              >
                <div className="flex flex-col gap-2">
                  <FormField
                    control={form.control}
                    name="challenged"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>I bet</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "justify-between",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value
                                  ? users.find(
                                      (user) => user.id === field.value,
                                    )?.fullName
                                  : "Select friend to challenge"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search user..." />
                              <CommandList>
                                <CommandEmpty>No user found.</CommandEmpty>
                                <CommandGroup>
                                  {users.map((user) => (
                                    <CommandItem
                                      value={user.id}
                                      key={user.id}
                                      onSelect={() => {
                                        form.setValue("challenged", user.id);
                                      }}
                                      keywords={[user.fullName ?? ""]}
                                      className="flex items-center gap-2"
                                    >
                                      <img
                                        src={user.imageUrl}
                                        className="h-8 w-8 rounded-full"
                                      />
                                      {user.fullName}
                                      <Check
                                        className={cn(
                                          "ml-auto",
                                          user.id === field.value
                                            ? "opacity-100"
                                            : "opacity-0",
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>to</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Catch a rocket" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>with</FormLabel>
                        <FormControl>
                          <EuroInput {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>until</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {text}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {formState === "manual" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col-reverse justify-between gap-2"
              >
                <Button variant="outline">Cancel</Button>
                <Button type="submit">Submit</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {["initial", "recording"].includes(formState) && (
            <motion.div
              className="fixed bottom-24 left-1/2 -translate-x-1/2"
              exit={{ opacity: 0 }}
            >
              <div
                className={cn(
                  "border-border transform select-none rounded-full border-2 p-1 duration-200",
                  {
                    "bg-background/20 border-red-500 p-4":
                      formState === "recording",
                  },
                )}
              >
                <Button
                  type="button"
                  className={cn("h-16 w-16 rounded-full", {
                    "border-red-500 bg-red-500 hover:bg-red-500 active:bg-red-500":
                      formState === "recording",
                  })}
                  variant="outline"
                  onTouchStart={() => startRecording()}
                  onTouchEnd={() => stopRecording()}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </Form>
  );
};
