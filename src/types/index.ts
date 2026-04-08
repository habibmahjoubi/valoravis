import type { Niche, Channel } from "@/generated/prisma/enums";

export type NicheVocabulary = {
  client: string;
  clients: string;
  establishment: string;
  visit: string;
};

export type TemplatePreset = {
  name: string;
  subject?: string;
  body: string;
};

export type NicheConfig = {
  label: string;
  defaultDelay: number; // hours
  vocabulary: NicheVocabulary;
  templates: {
    [K in Channel]: {
      subject?: string;
      body: string;
    };
  };
  presets: {
    [K in Channel]: TemplatePreset[];
  };
};

export type NicheConfigs = {
  [K in Niche]: NicheConfig;
};
