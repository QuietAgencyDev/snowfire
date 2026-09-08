export type AppLocale = "en" | "fr";

export const COMMAND_COPY = {
  en: {
    command: "Winter command center",
    readiness: "Winter readiness",
    ice: "Ice risk",
    storm: "48-hour snow",
    coach: "Smart treatment coach",
    brief: "Crew brief",
    briefCta: "Open printable brief",
    compare: "Proof compare",
    install: "Add SnowFire to your phone",
    bilingual: "EN / FR",
    iceDam: "Ice-dam watch",
    iceDamDetail: "Freeze-thaw plus snow. Salt pucks belong on the eaves.",
  },
  fr: {
    command: "Centre de commandement d’hiver",
    readiness: "Préparation d’hiver",
    ice: "Risque de glace",
    storm: "Neige 48 heures",
    coach: "Coach de traitement",
    brief: "Fiche équipe",
    briefCta: "Ouvrir la fiche imprimable",
    compare: "Comparer les photos",
    install: "Ajouter SnowFire au téléphone",
    bilingual: "EN / FR",
    iceDam: "Alerte barrage de glace",
    iceDamDetail: "Gel-dégel plus neige. Les galets de sel vont aux avant-toits.",
  },
} as const;
