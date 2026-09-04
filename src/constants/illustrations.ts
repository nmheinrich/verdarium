import fernWatercolor from "../assets/illustrations/fern-watercolor.png";
import monsteraWatercolor from "../assets/illustrations/monstera-watercolor.png";
import palmateWatercolor from "../assets/illustrations/palmate-watercolor.png";
import succulentWatercolor from "../assets/illustrations/succulent-watercolor.png";
import vineWatercolor from "../assets/illustrations/vine-watercolor.png";

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