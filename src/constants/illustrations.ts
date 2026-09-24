import fernWatercolor from "../assets/illustrations/fern-watercolor.webp";
import monsteraWatercolor from "../assets/illustrations/monstera-watercolor.webp";
import palmateWatercolor from "../assets/illustrations/palmate-watercolor.webp";
import succulentWatercolor from "../assets/illustrations/succulent-watercolor.webp";
import vineWatercolor from "../assets/illustrations/vine-watercolor.webp";

export interface BotanicalIllustrationDefinition {
  key: string;
  label: string;
  src: string;
}

export const BOTANICAL_ILLUSTRATIONS = [
  {
    key: "fern-watercolor",
    label: "Fern",
    src: fernWatercolor,
  },
  {
    key: "monstera-watercolor",
    label: "Monstera",
    src: monsteraWatercolor,
  },
  {
    key: "vine-watercolor",
    label: "Trailing vine",
    src: vineWatercolor,
  },
  {
    key: "succulent-watercolor",
    label: "Succulent",
    src: succulentWatercolor,
  },
  {
    key: "palmate-watercolor",
    label: "Palmate leaf",
    src: palmateWatercolor,
  },
] as const satisfies readonly BotanicalIllustrationDefinition[];

export const DEFAULT_ILLUSTRATION_KEY: string =
  BOTANICAL_ILLUSTRATIONS[0].key;

export type BotanicalIllustrationKey =
  (typeof BOTANICAL_ILLUSTRATIONS)[number]["key"];

export function getBotanicalIllustration(
  illustrationKey?: string,
): BotanicalIllustrationDefinition | undefined {
  if (!illustrationKey) {
    return undefined;
  }

  return BOTANICAL_ILLUSTRATIONS.find(
    (illustration) => illustration.key === illustrationKey,
  );
}