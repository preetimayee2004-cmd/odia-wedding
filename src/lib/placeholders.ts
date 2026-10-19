import { wedding } from "@/config/wedding";

/**
 * Whether to show the layout of unconfirmed content as dashed placeholders
 * ("Venue name", "Names to come", empty photo arches…). Always in
 * development; on the live site while `site.showPlaceholders` is on.
 * Placeholders never stand in for real details: they are labelled, faded,
 * and can't be tapped.
 */
export const showPlaceholders = import.meta.env.DEV || wedding.site.showPlaceholders;

/**
 * The template's example wedding (`site.demo`): the DEMO details are in
 * place, so the closing note says it's an example, the sample wishes fill
 * the wall, and the example phone numbers never dial.
 */
export const demoMode = wedding.site.demo;
