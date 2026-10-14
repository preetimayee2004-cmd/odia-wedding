import { Couple } from "@/components/sections/Couple";
import { Countdown } from "@/components/sections/Countdown";
import { Story } from "@/components/sections/Story";
import { Family } from "@/components/sections/Family";
import { Events } from "@/components/sections/Events";
import { Venue } from "@/components/sections/Venue";
import { Travel } from "@/components/sections/Travel";
import { WishingWall } from "@/components/sections/WishingWall";
import { Rsvp } from "@/components/sections/Rsvp";
import { Contact } from "@/components/sections/Contact";
import { ThankYou } from "@/components/sections/ThankYou";
import { Footer } from "@/components/sections/Footer";
import { Rajagya } from "@/components/sections/Rajagya";

/**
 * Everything after the main invitation, in PRD order. Loaded as its own
 * chunk so the first screen (opening + invitation) stays light.
 */
export default function RestOfSite() {
  return (
    <>
      <Couple />
      <Countdown />
      <Story />
      <Family />
      <Events />
      <Venue />
      <Travel />
      <WishingWall />
      <Rsvp />
      <Contact />
      <ThankYou />
      <Footer />
      <Rajagya />
    </>
  );
}
