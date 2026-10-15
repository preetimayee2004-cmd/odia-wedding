import { Couple } from "@/components/sections/Couple";
import { Countdown } from "@/components/sections/Countdown";
import { Story } from "@/components/sections/Story";
import { Events } from "@/components/sections/Events";
import { Family } from "@/components/sections/Family";
import { Gallery } from "@/components/sections/Gallery";
import { Rsvp } from "@/components/sections/Rsvp";
import { WishingWall } from "@/components/sections/WishingWall";
import { VenueTravel } from "@/components/sections/VenueTravel";
import { Contact } from "@/components/sections/Contact";
import { ThankYou } from "@/components/sections/ThankYou";
import { Footer } from "@/components/sections/Footer";
import { Rajagya } from "@/components/sections/Rajagya";

/**
 * Everything after the main invitation, in the section spec's order (with
 * the wedding events just before the family). Loaded as its own chunk so
 * the first screen (opening + invitation) stays light.
 */
export default function RestOfSite() {
  return (
    <>
      <Couple />
      <Countdown />
      <Story />
      <Events />
      <Family />
      <Gallery />
      <Rsvp />
      <WishingWall />
      <VenueTravel />
      <Contact />
      <ThankYou />
      <Footer />
      <Rajagya />
    </>
  );
}
