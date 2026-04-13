import {
  describeImageWithModel,
  describeImagesWithModel,
  type MediaUnderstandingProvider,
} from "civitas/plugin-sdk/media-understanding";

export const openrouterMediaUnderstandingProvider: MediaUnderstandingProvider = {
  id: "openrouter",
  capabilities: ["image"],
  defaultModels: { image: "auto" },
  describeImage: describeImageWithModel,
  describeImages: describeImagesWithModel,
};
