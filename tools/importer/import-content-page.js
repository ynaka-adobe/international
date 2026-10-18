/* eslint-disable */
/* global WebImporter */

import heroBannerParser from './parsers/hero-banner.js';
import columnsCtaBandParser from './parsers/columns-cta-band.js';
import columnsHeadlineParser from './parsers/columns-headline.js';
import carouselHeroParser from './parsers/carousel-hero.js';
import carouselThumbnailsParser from './parsers/carousel-thumbnails.js';
import cardsPromoParser from './parsers/cards-promo.js';
import carouselCardsParser from './parsers/carousel-cards.js';
import cardsOverlayParser from './parsers/cards-overlay.js';
import columnsMediaParser from './parsers/columns-media.js';
import carouselHotspotParser from './parsers/carousel-hotspot.js';
import cardsCategoryParser from './parsers/cards-category.js';
import accordionSpecsParser from './parsers/accordion-specs.js';
import videoPosterParser from './parsers/video-poster.js';
import quoteLargeCapsParser from './parsers/quote-large-caps.js';
import cardsNewsParser from './parsers/cards-news.js';
import accordionParser from './parsers/accordion.js';
import cleanupTransformer from './transformers/international-cleanup.js';
import contentSectionsTransformer from './transformers/international-content-sections.js';
// international-sections.js is intentionally not used: content pages are sectioned
// generically by international-content-sections.js; running both duplicates breaks.

const PAGE_TEMPLATE = {
  "name": "content-page",
  "urls": [
    "https://www.international.com/products/trucks/series/lt",
    "https://www.international.com/configurator",
    "https://www.international.com/dealer-network",
    "https://www.international.com/dealer-network/prestige-certified",
    "https://www.international.com/dealer-network/recruitment",
    "https://www.international.com/dealer-network/recruitment/apply-to-dealership-jobs",
    "https://www.international.com/dealer-network/recruitment/become-a-tech",
    "https://www.international.com/dealer-network/recruitment/influence-winners",
    "https://www.international.com/dealer-network/recruitment/influence-winners/2024-technician-of-the-year/rookies",
    "https://www.international.com/dealer-network/recruitment/influence-winners/2024-technician-of-the-year/veterans",
    "https://www.international.com/dealer-network/recruitment/internships",
    "https://www.international.com/dealer-network/recruitment/service-advisors",
    "https://www.international.com/dealer-network/recruitment/top-team-competition",
    "https://www.international.com/fr/our-company",
    "https://www.international.com/fr/products/trucks/classes/heavy",
    "https://www.international.com/fr/products/trucks/classes/medium",
    "https://www.international.com/fr/products/trucks/classes/severe",
    "https://www.international.com/fr/products/trucks/series/cv",
    "https://www.international.com/fr/products/trucks/series/electric-mv",
    "https://www.international.com/fr/products/trucks/series/hv",
    "https://www.international.com/fr/products/trucks/series/hx",
    "https://www.international.com/fr/products/trucks/series/lt",
    "https://www.international.com/fr/products/trucks/series/mv",
    "https://www.international.com/fr/products/trucks/series/rh",
    "https://www.international.com/fr/services/fleet-electrification",
    "https://www.international.com/fr/services/fleet-electrification/charging",
    "https://www.international.com/fr/services/fleet-electrification/consulting",
    "https://www.international.com/fr/services/fleet-electrification/customer-onboarding",
    "https://www.international.com/industries",
    "https://www.international.com/industries/construction",
    "https://www.international.com/industries/construction/concrete-mixers",
    "https://www.international.com/industries/construction/crane-trucks",
    "https://www.international.com/industries/construction/dump-trucks",
    "https://www.international.com/industries/government-and-municipal",
    "https://www.international.com/industries/government-and-municipal/fire-and-rescue",
    "https://www.international.com/industries/government-and-municipal/snow-plows",
    "https://www.international.com/industries/private-and-general-freight",
    "https://www.international.com/industries/private-and-general-freight/local-and-regional-delivery",
    "https://www.international.com/industries/private-and-general-freight/long-haul",
    "https://www.international.com/industries/private-and-general-freight/tankers",
    "https://www.international.com/industries/refuse/waste-and-recycling",
    "https://www.international.com/industries/specialized-hauling",
    "https://www.international.com/industries/specialized-hauling/heavy-haul",
    "https://www.international.com/industries/specialized-hauling/towing-and-recovery",
    "https://www.international.com/industries/utility",
    "https://www.international.com/legal/shy-settlement",
    "https://www.international.com/legal/shy-settlement/important-case-documents",
    "https://www.international.com/legal/shy-settlement/shy-settlement-important-dates",
    "https://www.international.com/our-company",
    "https://www.international.com/our-company/contact",
    "https://www.international.com/our-company/governance",
    "https://www.international.com/our-company/investors",
    "https://www.international.com/our-company/locations",
    "https://www.international.com/our-company/locations/parts-distribution-centers",
    "https://www.international.com/our-company/locations/production-plants",
    "https://www.international.com/our-company/locations/proving-grounds",
    "https://www.international.com/our-company/partnerships",
    "https://www.international.com/our-company/partnerships/loves",
    "https://www.international.com/our-company/partnerships/supplier-diversity",
    "https://www.international.com/our-company/people/dei",
    "https://www.international.com/our-company/people/employee-resource-groups",
    "https://www.international.com/our-company/people/leadership",
    "https://www.international.com/our-company/people/retirees",
    "https://www.international.com/our-company/stories",
    "https://www.international.com/our-company/stories/2022/2022-carb-emissions-regulations",
    "https://www.international.com/our-company/stories/2022/2022-truck-trends",
    "https://www.international.com/our-company/stories/2022/benefits-of-electric",
    "https://www.international.com/our-company/stories/2022/charging-ahead",
    "https://www.international.com/our-company/stories/2022/driver-retention",
    "https://www.international.com/our-company/stories/2022/emv-walkaround",
    "https://www.international.com/our-company/stories/2022/lt-series-enhancements",
    "https://www.international.com/our-company/stories/2022/paving-the-way-for-others",
    "https://www.international.com/our-company/stories/2022/rose-colored-glasses-breast-cancer-survivor-story",
    "https://www.international.com/our-company/stories/2022/s13integrated-dual-stage-aftertreatment",
    "https://www.international.com/our-company/stories/2022/school-busses-will-lead-the-charge-on-electrification",
    "https://www.international.com/our-company/stories/2022/the-circle-of-giving-back",
    "https://www.international.com/our-company/stories/2022/truck-maintenance-tips",
    "https://www.international.com/our-company/stories/2023/2023-truck-trends",
    "https://www.international.com/our-company/stories/2023/charging-whitepaper",
    "https://www.international.com/our-company/stories/2023/deploying-electric-truck",
    "https://www.international.com/our-company/stories/2023/diamond-logic",
    "https://www.international.com/our-company/stories/2023/electric-vehicle-one-million-miles-driven",
    "https://www.international.com/our-company/stories/2023/electric-vehicle-two-million-miles-driven",
    "https://www.international.com/our-company/stories/2023/emv-us-air-conditioning-testimonial",
    "https://www.international.com/our-company/stories/2023/hx-features",
    "https://www.international.com/our-company/stories/2023/mv-series-safety",
    "https://www.international.com/our-company/stories/2023/s13-connected-technologies",
    "https://www.international.com/our-company/stories/2023/supertruck-ii",
    "https://www.international.com/our-company/stories/2023/tackaberry-and-sons",
    "https://www.international.com/our-company/stories/2023/uptime-academy-graduates",
    "https://www.international.com/our-company/stories/2023/warm-weather-maintenance-tips",
    "https://www.international.com/our-company/stories/2024/2024-truck-trends",
    "https://www.international.com/our-company/stories/2024/accelerated-service",
    "https://www.international.com/our-company/stories/2024/an-oems-perspective-on-charging-infrastructure",
    "https://www.international.com/our-company/stories/2024/autonomous-driving-technology",
    "https://www.international.com/our-company/stories/2024/customers-experience-s13-integrated-powertrain",
    "https://www.international.com/our-company/stories/2024/driver-safety",
    "https://www.international.com/our-company/stories/2024/edmonton-parts-distribution-center-success",
    "https://www.international.com/our-company/stories/2024/electric-vehicle-funding",
    "https://www.international.com/our-company/stories/2024/electric-vehicle-onboarding",
    "https://www.international.com/our-company/stories/2024/electric-vehicle-onboarding-part-2",
    "https://www.international.com/our-company/stories/2024/enhancing-customer-uptime",
    "https://www.international.com/our-company/stories/2024/ev-misconceptions",
    "https://www.international.com/our-company/stories/2024/landscape-trucks",
    "https://www.international.com/our-company/stories/2024/leveraging-history-to-support-customer-needs",
    "https://www.international.com/our-company/stories/2024/national-school-bus-safety-week",
    "https://www.international.com/our-company/stories/2024/real-world-testing-the-international-s13-integrated-powertrain",
    "https://www.international.com/our-company/stories/2024/s13-interview",
    "https://www.international.com/our-company/stories/2024/sustainable-solutions-report",
    "https://www.international.com/our-company/stories/2024/the-diesel-to-electric-transition",
    "https://www.international.com/our-company/stories/2024/tmc-annual-meeting",
    "https://www.international.com/our-company/stories/2024/understanding-fleet-electrification-needs",
    "https://www.international.com/our-company/stories/2024/world-of-concrete",
    "https://www.international.com/our-company/stories/2024/year-round-maintenance-plan",
    "https://www.international.com/our-company/stories/2025/a-finance-partner-that-understands-the-truck-business",
    "https://www.international.com/our-company/stories/2025/act-expo-main-stage-panel",
    "https://www.international.com/our-company/stories/2025/building-sustainable-mobility-through-digitalization",
    "https://www.international.com/our-company/stories/2025/docuseries",
    "https://www.international.com/our-company/stories/2025/everything-you-need-to-know-about-adding-bev-trucks-to-your-fleet",
    "https://www.international.com/our-company/stories/2025/fleet-financial-strategies-for-a-volatile-market",
    "https://www.international.com/our-company/stories/2025/hv-series-puts-in-the-work",
    "https://www.international.com/our-company/stories/2025/modernizing-an-american-legacy",
    "https://www.international.com/our-company/stories/2025/mv-series-ready-for-any-job",
    "https://www.international.com/our-company/stories/2025/prairie-farms-fleet",
    "https://www.international.com/our-company/stories/2025/q4-financing-a-new-truck",
    "https://www.international.com/our-company/stories/2025/s13-integrated-powertrain-for-concrete-mixers",
    "https://www.international.com/our-company/stories/2025/s13-solutions-deliver-for-menzel-enterprises",
    "https://www.international.com/our-company/stories/2025/scott-miller-testimonial",
    "https://www.international.com/our-company/stories/2025/the-s13-integrated-powertrain-powers-ready-mix-success",
    "https://www.international.com/our-company/stories/2025/tulsa-bus-plant-250000-unit-milestone",
    "https://www.international.com/our-company/stories/2025/us-air-conditioning",
    "https://www.international.com/our-company/stories/2026/250-years-of-america",
    "https://www.international.com/our-company/stories/2026/a-new-approach-to-service-contracts",
    "https://www.international.com/our-company/stories/2026/buying-your-first-international-truck",
    "https://www.international.com/our-company/stories/2026/director-of-powertrain-engineering-named-2025-sae-international-fellow",
    "https://www.international.com/our-company/stories/2026/how-international-financial-delivers-financing-solutions",
    "https://www.international.com/our-company/stories/2026/how-my-international-redefines-the-customer-ownership-experience",
    "https://www.international.com/our-company/stories/2026/how-proactive-maintenance-can-boost-your-uptime",
    "https://www.international.com/our-company/stories/2026/international-celebrates-5-years-of-social-impact",
    "https://www.international.com/our-company/stories/2026/international-financial-practical-guide",
    "https://www.international.com/our-company/stories/2026/international-named-one-of-the-most-trustworthy-companies",
    "https://www.international.com/our-company/stories/2026/plan-smarter-save-more-with-financing-built-for-your-fleet",
    "https://www.international.com/our-company/stories/2026/pods-moving-and-storage",
    "https://www.international.com/our-company/stories/2026/support-that-goes-beyond-the-sale",
    "https://www.international.com/our-company/stories/2026/t14-transmission-built-for-the-jobsite",
    "https://www.international.com/our-company/stories/2026/testing-for-improved-truck-fuel-efficiency",
    "https://www.international.com/our-company/stories/2026/truck-driver-appreciation",
    "https://www.international.com/our-company/stories/2026/why-international-vocational-trucks-rule-the-jobsite",
    "https://www.international.com/our-company/vision-and-strategy/culture-and-leadership/shared-values",
    "https://www.international.com/our-company/vision-and-strategy/foundations-for-future/digitalization",
    "https://www.international.com/our-company/vision-and-strategy/foundations-for-future/electrification",
    "https://www.international.com/our-company/vision-and-strategy/sustainability/environmental-impact",
    "https://www.international.com/our-company/vision-and-strategy/sustainability/social-impact",
    "https://www.international.com/our-company/whistleblower-reporting",
    "https://www.international.com/parts",
    "https://www.international.com/parts/global-parts-support",
    "https://www.international.com/parts/ih-gascap",
    "https://www.international.com/parts/online-ordering",
    "https://www.international.com/power-take-off-calculator",
    "https://www.international.com/privacy-notice",
    "https://www.international.com/products/resources",
    "https://www.international.com/products/resources/literature",
    "https://www.international.com/products/resources/operator-guides-and-training/bev-training-material",
    "https://www.international.com/products/resources/tem-body-builder",
    "https://www.international.com/products/resources/tem-body-builder/body-resources",
    "https://www.international.com/products/resources/tem-body-builder/cad-data",
    "https://www.international.com/products/resources/tem-body-builder/engine-resources",
    "https://www.international.com/products/resources/tem-body-builder/t14-transmission-resources",
    "https://www.international.com/products/resources/tem-body-builder/tips-and-training",
    "https://www.international.com/products/resources/tem-body-builder/tools-and-software",
    "https://www.international.com/products/trucks",
    "https://www.international.com/products/trucks/all-electric-refrigerated-truck",
    "https://www.international.com/products/trucks/classes/heavy",
    "https://www.international.com/products/trucks/classes/medium",
    "https://www.international.com/products/trucks/classes/severe",
    "https://www.international.com/products/trucks/features",
    "https://www.international.com/products/trucks/features/diamond-logic",
    "https://www.international.com/products/trucks/features/engines-and-powertrains",
    "https://www.international.com/products/trucks/features/engines-and-powertrains/battery-electric-powertrains",
    "https://www.international.com/products/trucks/features/engines-and-powertrains/cummins-b6-7",
    "https://www.international.com/products/trucks/features/engines-and-powertrains/cummins-l9",
    "https://www.international.com/products/trucks/features/engines-and-powertrains/cummins-x15",
    "https://www.international.com/products/trucks/inventory",
    "https://www.international.com/products/trucks/legacy-trucks",
    "https://www.international.com/products/trucks/legacy-trucks/proven-trucks",
    "https://www.international.com/products/trucks/series/cv",
    "https://www.international.com/products/trucks/series/electric-mv",
    "https://www.international.com/products/trucks/series/hv",
    "https://www.international.com/products/trucks/series/hx",
    "https://www.international.com/products/trucks/series/mv",
    "https://www.international.com/products/trucks/series/rh",
    "https://www.international.com/services",
    "https://www.international.com/services/financing",
    "https://www.international.com/services/financing/ev-fleet",
    "https://www.international.com/services/financing/financing-canada",
    "https://www.international.com/services/financing/leasing",
    "https://www.international.com/services/financing/loans",
    "https://www.international.com/services/financing/municipal-financing",
    "https://www.international.com/services/financing/used-vehicles",
    "https://www.international.com/services/financing/year-end-cash-in-hand",
    "https://www.international.com/services/fleet-electrification",
    "https://www.international.com/services/fleet-electrification/charging",
    "https://www.international.com/services/fleet-electrification/consulting",
    "https://www.international.com/services/fleet-electrification/customer-onboarding",
    "https://www.international.com/services/fleet-electrification/ev-podcast",
    "https://www.international.com/services/fleet-electrification/faq",
    "https://www.international.com/services/fleet-resources",
    "https://www.international.com/services/fleet-resources/emergency-breakdown",
    "https://www.international.com/services/fleet-resources/parts-information",
    "https://www.international.com/services/fleet-resources/parts-return-program",
    "https://www.international.com/services/fleet-resources/service-information",
    "https://www.international.com/services/fleet-resources/technician-education",
    "https://www.international.com/services/global-service-support",
    "https://www.international.com/services/maintenance-services",
    "https://www.international.com/services/maintenance-services/accelerated-service",
    "https://www.international.com/services/my-international",
    "https://www.international.com/services/my-international/advanced-remote-diagnostics",
    "https://www.international.com/services/my-international/fuel-analytics",
    "https://www.international.com/services/my-international/integrations",
    "https://www.international.com/services/my-international/over-the-air-programming",
    "https://www.international.com/services/my-international/qrcode",
    "https://www.international.com/services/my-international/remote-lock-unlock",
    "https://www.international.com/services/my-international/service-communications",
    "https://www.international.com/services/my-international/telematics-opt-out",
    "https://www.international.com/services/my-international/terms-of-use-and-privacy-policy",
    "https://www.international.com/services/promotions",
    "https://www.international.com/services/promotions/ready-to-roll",
    "https://www.international.com/services/sourcewell",
    "https://www.international.com/services/sourcewell/sourcewell-parts",
    "https://www.international.com/services/sourcewell/sourcewell-truck",
    "https://www.international.com/services/uptime-advocate",
    "https://www.international.com/services/warranties",
    "https://www.international.com/terms-of-use"
  ],
  "coverageGaps": [],
  "description": "Standard component page: hero banner, mixed text/media sections, promo card lists and CTA bands",
  "blocks": [
    {
      "name": "hero-banner",
      "instances": [
        "div.main-hero"
      ]
    },
    {
      "name": "columns-cta-band",
      "instances": [
        "div.component.container:has(> .component-content > .row > .button-link)"
      ]
    },
    {
      "name": "columns-headline",
      "instances": [
        "div.page-preview"
      ]
    },
    {
      "name": "carousel-hero",
      "instances": [
        "div.hero-slider:has(.hero-swiper-arrows)"
      ]
    },
    {
      "name": "carousel-thumbnails",
      "instances": [
        "div.hero-slider:has(.hero-swiper-thumbnails)"
      ]
    },
    {
      "name": "cards-promo",
      "instances": [
        "div.promo-list:has(.promo-list-items.vertical-card:not(.row-slider))"
      ]
    },
    {
      "name": "carousel-cards",
      "instances": [
        "div.progress-slider",
        "div.promo-list:has(.promo-list-items.row-slider)",
        "div.related-article-carousel"
      ]
    },
    {
      "name": "cards-overlay",
      "instances": [
        "div.promo-list:has(.promo-list-items.row-two-across)"
      ]
    },
    {
      "name": "columns-media",
      "instances": [
        "div.individual-promo",
        "div.promo-links"
      ]
    },
    {
      "name": "carousel-hotspot",
      "instances": [
        "div.swiper-hotspot"
      ]
    },
    {
      "name": "cards-category",
      "instances": [
        "div.promo-icon-list"
      ]
    },
    {
      "name": "accordion-specs",
      "instances": [
        "div.spec-list"
      ]
    },
    {
      "name": "video-poster",
      "instances": [
        "div.video"
      ]
    },
    {
      "name": "quote-large-caps",
      "instances": [
        "div.promo.quote-promo"
      ]
    },
    {
      "name": "cards-news",
      "instances": [
        "div.news-promo"
      ]
    },
    {
      "name": "accordion",
      "instances": [
        "div.title-accordion"
      ]
    }
  ],
  "representativeUrl": "https://www.international.com/products/trucks/series/lt",
  "sections": [
    {
      "id": "rc2",
      "name": "Hero - LT Series",
      "selector": [
        "#content > div.row > div.main-hero:nth-of-type(1)"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "rc3",
      "name": "Fuel Economy Claim + Quote CTA",
      "selector": [
        "#content > div.row > section.section-container:has(div.button-link)"
      ],
      "style": null,
      "blocks": [
        "columns-cta-band"
      ],
      "defaultContent": []
    },
    {
      "id": "rc4",
      "name": "Intro - Long Haul",
      "selector": [
        "#content > div.row > section.section-container:has(div.page-preview)"
      ],
      "style": null,
      "blocks": [
        "columns-headline"
      ],
      "defaultContent": []
    },
    {
      "id": "rc5",
      "name": "In-page Navigation",
      "selector": [
        "#content > div.row > div.react-component:has(.in-page-navigation)",
        "div.in-page-navigation"
      ],
      "style": "in-page-nav",
      "blocks": [],
      "defaultContent": [
        "div.in-page-navigation"
      ]
    },
    {
      "id": "rc6",
      "name": "The Cabs",
      "selector": [
        "#the-cabs"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "div.section-title",
        "div.advanced-image"
      ]
    },
    {
      "id": "rc7",
      "name": "Powertrain Slider",
      "selector": [
        "#content > div.row > div.hero-slider"
      ],
      "style": null,
      "blocks": [
        "carousel-hero"
      ],
      "defaultContent": []
    },
    {
      "id": "rc8",
      "name": "The Trim",
      "selector": [
        "#the-trim"
      ],
      "style": null,
      "blocks": [
        "cards-promo"
      ],
      "defaultContent": [
        "div.section-title"
      ]
    },
    {
      "id": "rc9",
      "name": "Features - A Vision for Safety",
      "selector": [
        "#features"
      ],
      "style": null,
      "blocks": [
        "columns-media",
        "carousel-cards"
      ],
      "defaultContent": [
        "div.section-title",
        "div.title-block"
      ]
    },
    {
      "id": "rc10",
      "name": "Interior Hotspots",
      "selector": [
        "#content > div.row > div.swiper-hotspot"
      ],
      "style": null,
      "blocks": [
        "carousel-hotspot"
      ],
      "defaultContent": []
    },
    {
      "id": "rc11",
      "name": "Room to Roam",
      "selector": [
        "#content > div.row > section.section-container:not([id]):has(> .bg-effect div.individual-promo)"
      ],
      "style": null,
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "rc12",
      "name": "Build Your Own",
      "selector": [
        "#build-your-own"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "rc13",
      "name": "Quick Links Tiles",
      "selector": [
        "#content > div.row > section.section-container:has(div.promo-icon-list)"
      ],
      "style": null,
      "blocks": [
        "cards-category"
      ],
      "defaultContent": []
    },
    {
      "id": "rc14",
      "name": "Resources",
      "selector": [
        "#resources",
        "#content > div.row > section.section-container:has(div.file-list)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "div.file-list"
      ]
    },
    {
      "id": "rc15",
      "name": "Specifications",
      "selector": [
        "#specifications",
        "#content > div.row > section.section-container:has(div.spec-list)"
      ],
      "style": null,
      "blocks": [
        "accordion-specs"
      ],
      "defaultContent": [
        "div.section-title"
      ]
    },
    {
      "id": "rc16",
      "name": "Financing & Services",
      "selector": [
        "#financing-\\&-services"
      ],
      "style": null,
      "blocks": [
        "carousel-cards"
      ],
      "defaultContent": [
        "div.section-title"
      ]
    },
    {
      "id": "rc17",
      "name": "Explore More Trucks",
      "selector": [
        "#DOCUMENTATION",
        "#content > div.row > section.section-container:has(div.promo-list .row-two-across)"
      ],
      "style": "centered",
      "blocks": [
        "cards-overlay"
      ],
      "defaultContent": [
        "div.title-block"
      ]
    },
    {
      "id": "rc18",
      "name": "Dealer Network CTA",
      "selector": [
        "#content > div.row > div.main-hero:last-of-type"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    }
  ]
};

const parsers = {
  'hero-banner': heroBannerParser,
  'columns-cta-band': columnsCtaBandParser,
  'columns-headline': columnsHeadlineParser,
  'carousel-hero': carouselHeroParser,
  'carousel-thumbnails': carouselThumbnailsParser,
  'cards-promo': cardsPromoParser,
  'carousel-cards': carouselCardsParser,
  'cards-overlay': cardsOverlayParser,
  'columns-media': columnsMediaParser,
  'carousel-hotspot': carouselHotspotParser,
  'cards-category': cardsCategoryParser,
  'accordion-specs': accordionSpecsParser,
  'video-poster': videoPosterParser,
  'quote-large-caps': quoteLargeCapsParser,
  'cards-news': cardsNewsParser,
  'accordion': accordionParser,
};
const transformers = [cleanupTransformer, contentSectionsTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      // skip elements already consumed or replaced by an earlier parser
      if (!block.element.parentNode || !block.element.isConnected) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
