"use client";

import { Card } from "~/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/components/ui/carousel";
import { Button } from "~/components/ui/button";
import { Check, CirclePlay } from "lucide-react";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { useState } from "react";

export const ExampleCard = () => {
  const [passed, setPassed] = useState(false);

  return (
    <Card className="overflow-clip">
      <Carousel>
        <CarouselContent>
          <CarouselItem>
            <AspectRatio ratio={16 / 9} className="relative">
              <CirclePlay className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-white" />
              <img src="/fake_thumb.png"></img>
            </AspectRatio>
          </CarouselItem>
          <CarouselItem>
            <AspectRatio ratio={16 / 9}>
              <img src="/bofan_sleep.png"></img>
            </AspectRatio>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
      <div className="flex flex-col gap-2 p-4">
        I Bet You Can&apos;t Fall Asleep Within 2 Minutes
        {passed && (
          <div className="flex justify-end gap-2 text-green-500">
            Passed <Check />
          </div>
        )}
        {!passed && (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="destructive">Failed</Button>
            <Button variant="default" onClick={() => setPassed(true)}>
              Passed
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
