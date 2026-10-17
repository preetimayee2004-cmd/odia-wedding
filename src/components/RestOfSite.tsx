import { SideBands } from "@/components/art/SideBands";
import { FallingPetals } from "@/components/art/FallingPetals";
import { SectionSeparator } from "@/components/ui/SectionSeparator";
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

/**
 * Everything after the main invitation, in the section spec's order (with
 * the wedding events just before the family), with a small separator on
 * each seam (ui/SectionSeparator.tsx). Loaded as its own chunk so
 * the first screen (opening + invitation) stays light.
 */
export default function RestOfSite() {
  return (
    <div className="relative">
      {/* Rose and marigold petals drift down the screen from the couple card to the footer */}
      <FallingPetals />
      <Couple />
      {/* From here to the end, the couple card's looped band runs down both sides,
          over the page cream with faint white flowers (Wedding Events keeps plain cream) */}
      <div className="page-flowers relative">
        <SideBands />
        <Countdown />
        {/* Countdown → Our Story: the countdown's gold thread already runs down to the scroll's nail */}
        <Story />
        <SectionSeparator line="vine" emblem="bud" />
        <Events />
        <SectionSeparator emblem="marigold" />
        <Family />
        <SectionSeparator emblem="pattachitra" />
        <Gallery />
        <SectionSeparator emblem="gold" />
        <Rsvp />
        <SectionSeparator emblem="lotus" />
        <WishingWall />
        <SectionSeparator emblem="chakra" />
        <VenueTravel />
        {/* the route line ends in a pin, in the contact section's top padding */}
        <SectionSeparator line="vine" emblem="pin" pull="down" />
        <Contact />
        {/* petals drifting into a flourish, in the contact section's bottom padding (clear of the thank-you garlands) */}
        <SectionSeparator emblem="gold" petals pull="up" />
        <ThankYou />
        {/* Thank You → Love Note: the closing signature opens the footer (Footer.tsx) */}
        <Footer />
      </div>
    </div>
  );
}
