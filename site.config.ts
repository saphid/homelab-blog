export const site = {
  title: "Saphid",
  siteTitle: "Saphid / Homelab",
  description: "Verified homelab notes, setup guides, and audit snapshots",
  baseUrl: "/homelab-blog",
  systems: [
    {
      tag: "nursedroid",
      name: "NurseDroid",
      summary: "Main Linux host for containers, sync jobs, and cron-driven glue."
    },
    {
      tag: "kitchen-screen",
      name: "Kitchen Screen",
      summary: "Wall-mounted Raspberry Pi dashboard for family-facing data."
    },
    {
      tag: "orange-pi-rv2",
      name: "Orange Pi RV2",
      summary: "Monitoring node for observability, exporters, and flow capture."
    },
    {
      tag: "pixel-termux",
      name: "Pixel Termux",
      summary: "Android bridge feeding phone sensor data back into Home Assistant."
    },
    {
      tag: "home-assistant",
      name: "Home Assistant",
      summary: "Automation and entity hub tying the rest of the setup together."
    }
  ],
  workflowTags: [
    "audit",
    "build-log",
    "setup-guide",
    "deployment",
    "observability",
    "automation",
    "comparison",
    "networking",
    "cad"
  ]
} as const;

export type SiteConfig = typeof site;
