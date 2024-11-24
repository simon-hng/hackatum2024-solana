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
import { type z } from "zod";
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
import { createChallenge, parseTranscript } from "./actions";
import Fuze from "fuse.js";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const deepgram = createClient(env.NEXT_PUBLIC_DEEPGRAM_API_KEY);

export const CameraFeed = ({
  users,
}: {
  users: Pick<User, "id" | "fullName" | "imageUrl">[];
}) => {
  const form = useForm<z.infer<typeof challengeSchema>>({
    resolver: zodResolver(
      challengeSchema.pick({
        challenged: true,
        title: true,
        amount: true,
        dueDate: true,
      }),
    ),
    defaultValues: {
      challenged: "",
      title: "",
      amount: "5",
      dueDate: new Date(),
    },
  });

  const microphoneRef = useRef<MediaRecorder | null>(null);
  const beginAudioRecording = (connection: ListenLiveClient) => {
    if (!microphoneRef.current || microphoneRef.current.state === "recording")
      return;

    microphoneRef.current.start(1000);

    microphoneRef.current.onstart = () => {
      console.log("client: microphone opened");
    };

    microphoneRef.current.onstop = () => {
      console.log("client: microphone closed");
      connection.requestClose();
    };

    microphoneRef.current.ondataavailable = (e) => {
      const data = e.data;
      console.log("client: sent data to websocket");
      connection.send(data);
    };
  };

  const startRecording = () => {
    setFormState("recording");

    const connection = deepgram.listen.live({
      model: "nova-2",
      language: "en-US",
      smart_format: true,
    });

    connection.on(LiveTranscriptionEvents.Open, () => {
      connection.on(
        LiveTranscriptionEvents.Transcript,
        (data: { channel: { alternatives: { transcript: string }[] } }) => {
          const transcript: string =
            data.channel.alternatives.at(0)?.transcript ?? "";

          const currentChallenged = users.find(
            (user) => user.id === form.getValues().challenged,
          );

          parseTranscript(
            `Find out the person by name that addressed. 
          The current value is "${currentChallenged?.fullName}".
          If you find a strictly better value return that, otherwise the previouse one. 

          This is a list of all possible users:
          ${users.map((user) => user.fullName).join(", ")}
          This is the transcript: "${transcript}"`,
          )
            .then((challenged) => {
              const challengedID = new Fuze(users, { keys: ["fullName"] })
                .search(challenged)
                .at(0)?.item.id;
              if (challengedID) {
                form.setValue("challenged", challengedID);
              }
            })
            .catch(console.error);

          parseTranscript(
            `Find out a suitable title for the bet. The current value is "${form.getValues().title}", if you find a strictly better value return that, otherwise the previouse one. This is the transcript: "${transcript}"`,
          )
            .then((title) => {
              form.setValue("title", title);
            })
            .catch(console.error);

          parseTranscript(
            `Find out a suitable amount of money for the bet. The current value is "${form.getValues().amount}", if you find a strictly better value return that, otherwise the previouse one. This is the transcript: "${transcript}"`,
          )
            .then((amount) => {
              form.setValue("amount", amount);
            })
            .catch(console.error);
        },
      );
    });

    beginAudioRecording(connection);
  };

  const router = useRouter();
  const stopRecording = () => {
    microphoneRef.current?.stop();
    setFormState("manual");
  };

  // Video Preview
  const myVideoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream: MediaStream) => {
        microphoneRef.current = new MediaRecorder(stream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error("Error accessing media devices.", error);
      });
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const STATE = ["initial", "recording", "manual", "done"] as const;
  const [formState, setFormState] =
    React.useState<(typeof STATE)[number]>("initial");

  return (
    <Form {...form}>
      <form
        className="animate relative flex h-svh flex-col overflow-hidden p-2"
        onSubmit={form.handleSubmit(async (data) => {
          console.log(data);
          // TODO: add current user
          toast.promise(
            createChallenge({ ...data }).then((data) => {
              router.push("./bets");
              return data;
            }),
            {
              loading: "Loading...",
              success: (data) => {
                return `Bet ${data.title} has been added`;
              },
              error: "Error",
            },
          );
        }, console.error)}
      >
        <motion.video
          exit={{ opacity: 0, height: 0 }}
          className={cn("h-full rounded-2xl object-cover")}
          muted
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
                                      <Image
                                        src={user.imageUrl}
                                        alt={`${user.fullName}'s profile picture`}
                                        className="h-8 w-8 rounded-full"
                                        width={32}
                                        height={32}
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
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormState("initial");
                  }}
                >
                  Cancel
                </Button>
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
                  "flex transform select-none rounded-full border-2 border-border p-1 duration-200",
                  {
                    "border-red-500 bg-background/20 p-4":
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
                  onClick={() => {
                    if (formState === "initial") {
                      startRecording();
                    } else {
                      stopRecording();
                    }
                  }}
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
