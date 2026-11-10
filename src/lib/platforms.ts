/* Matriz de fusión: las 15 plataformas de referencia y cómo viven dentro de XCLUSIVE. */
export type PlatformRef = {
  id: string;
  name: string;
  bestFor: string;
  share: string;
  content: "Adulto" | "No adulto" | "Mixto";
  adopted: string[];
  implementedIn: string[];
};

export const PLATFORMS: PlatformRef[] = [
  {
    id: "fansly",
    name: "Fansly",
    bestFor: "Suscripciones adultas + PPV",
    share: "80%",
    content: "Adulto",
    adopted: [
      "Tiers multinivel de $5 a $499.99 con precio libre por creadora",
      "Pay-per-view en mensajes y publicaciones bloqueadas",
      "Descubrimiento «For You» por etiquetas e intereses",
      "Seguidores gratuitos y pruebas sin tarjeta",
    ],
    implementedIn: ["Explorar", "Perfil de creadora", "Membresías", "Mensajes con PPV"],
  },
  {
    id: "fanvue",
    name: "Fanvue",
    bestFor: "Creadoras de IA + lifestyle",
    share: "80% (85% primer mes)",
    content: "Mixto",
    adopted: [
      "Cuentas asistidas por IA declaradas con transparencia",
      "Bundles, suscripciones, PPV y contenido custom",
      "Herramientas de IA para gestionar interacciones",
      "Enfoque lifestyle y fitness además de contenido adulto",
    ],
    implementedIn: ["Nina Blake (perfil IA)", "Asistente de estudio", "Bundles", "Bandeja con IA"],
  },
  {
    id: "loyalfans",
    name: "LoyalFans",
    bestFor: "Interacción + live",
    share: "80%",
    content: "Adulto",
    adopted: [
      "Suscripciones, propinas, PPV y transmisiones en vivo",
      "Venta de videos individuales y llamadas privadas",
      "Mensajería directa con prioridad",
      "Reputación de buen trato a creadoras",
    ],
    implementedIn: ["Salones en vivo", "Propinas", "Llamadas privadas", "Mensajería"],
  },
  {
    id: "manyvids",
    name: "ManyVids",
    bestFor: "Clips + contenido custom",
    share: "Variable",
    content: "Adulto",
    adopted: [
      "Venta de clips individuales sin suscripción",
      "Contenido custom bajo pedido",
      "Catálogo por categorías y etiquetas",
      "Comisión transparente por transacción",
    ],
    implementedIn: ["Marketplace de clips", "Solicitudes custom", "Categorías", "Comisiones"],
  },
  {
    id: "patreon",
    name: "Patreon",
    bestFor: "Contenido SFW",
    share: "Variable",
    content: "No adulto",
    adopted: [
      "Membresías por niveles con recompensas",
      "Suscripción recurrente mensual",
      "Comunidad integrada y herramientas de engagement",
      "Política estricta de contenido no explícito",
    ],
    implementedIn: ["Tiers", "Comunidad", "Perfiles SFW", "Política de contenido"],
  },
  {
    id: "fanfix",
    name: "Fanfix",
    bestFor: "Lifestyle / SFW",
    share: "80%",
    content: "No adulto",
    adopted: [
      "Creadoras conservan 80% de pagos de fans",
      "Enfoque en influencers lifestyle",
      "Suscripciones y propinas",
      "Integración con redes para captación",
    ],
    implementedIn: ["Perfiles lifestyle", "Enlaces inteligentes", "Propinas", "Afiliados"],
  },
  {
    id: "justforfans",
    name: "JustForFans",
    bestFor: "Audiencia LGBTQ+",
    share: "Verificar",
    content: "Adulto",
    adopted: [
      "Comunidades de nicho con identidad propia",
      "Suscripción + venta de contenido",
      "Mensajería y propinas",
      "Comisión configurable y transparente",
    ],
    implementedIn: ["Etiquetas de nicho", "Perfil Jade K.", "Mensajería", "Comisiones"],
  },
  {
    id: "fancentro",
    name: "FanCentro",
    bestFor: "Social de pago + link-in-bio",
    share: "Verificar",
    content: "Adulto",
    adopted: [
      "Acceso privado desde un link-in-bio",
      "Integración con Instagram/TikTok como embudo",
      "Gestión de suscriptores",
      "Enlaces medibles por campaña",
    ],
    implementedIn: ["Enlace inteligente", "Afiliados", "Analítica de clics", "Cuenta"],
  },
  {
    id: "mymfans",
    name: "MYM.fans",
    bestFor: "Mercado europeo",
    share: "75–80%",
    content: "Adulto",
    adopted: [
      "Modelo híbrido de suscripción y media privada",
      "Presencia europea y precios en EUR",
      "Suscripciones + mensajes",
      "Interfaz orientada a fans europeos",
    ],
    implementedIn: [
      "Selector MXN/USD/EUR",
      "Perfil Maréa (Barcelona)",
      "Media privada",
      "Mensajes",
    ],
  },
  {
    id: "unlockd",
    name: "Unlockd",
    bestFor: "Mayor porcentaje para creadoras",
    share: "85%",
    content: "Adulto",
    adopted: [
      "85% de ingresos para la creadora",
      "Suscripciones + interacciones de pago",
      "Comisión más baja que la mayoría",
      "Monetización de interacciones",
    ],
    implementedIn: ["Revenue share 85%", "Ingresos", "Propinas", "Transacciones"],
  },
  {
    id: "passes",
    name: "Passes",
    bestFor: "Exclusividad premium",
    share: "Variable",
    content: "Mixto",
    adopted: [
      "Acceso premium y curaduría de creadoras",
      "Suscripción + PPV",
      "Herramientas de engagement",
      "Integración con creadoras de alto perfil",
    ],
    implementedIn: ["XTRIME Inner Circle", "Curaduría", "PPV", "Salones privados"],
  },
  {
    id: "stripchat",
    name: "Stripchat",
    bestFor: "Live streaming",
    share: "Tips / tokens",
    content: "Adulto",
    adopted: [
      "Live gratuito para espectadores",
      "Monetización por propinas y tokens",
      "Interacción en tiempo real",
      "Modelo free-to-watch",
    ],
    implementedIn: ["Salones abiertos", "Propinas en vivo", "Chat", "Contador de audiencia"],
  },
  {
    id: "clips4sale",
    name: "Clips4Sale",
    bestFor: "Venta de clips",
    share: "Variable",
    content: "Adulto",
    adopted: [
      "Venta por clip sin suscripción",
      "Marketplace con categorías específicas",
      "Comisiones variables por transacción",
      "Ideal para catálogos de video",
    ],
    implementedIn: ["Marketplace", "Filtros por categoría", "Comisiones", "Biblioteca"],
  },
  {
    id: "luvi",
    name: "Luvi",
    bestFor: "IA + automatización",
    share: "Variable",
    content: "Mixto",
    adopted: [
      "Herramientas de IA para interacciones",
      "Automatización de respuestas",
      "Sugerencias de precio y copy",
      "Enfoque tech",
    ],
    implementedIn: [
      "Asistente IA",
      "Respuestas sugeridas",
      "Precios sugeridos",
      "Automatizaciones",
    ],
  },
  {
    id: "scrile",
    name: "Scrile Connect",
    bestFor: "White-label propio",
    share: "100% (tu plataforma)",
    content: "Mixto",
    adopted: [
      "Plataforma white-label con marca propia",
      "Control de branding y reglas",
      "Propiedad de la relación con el fan",
      "Personalización completa",
    ],
    implementedIn: ["Panel White-label", "Marca y acento", "Dominio", "Comisión global"],
  },
];

export const ECOSYSTEM_PRINCIPLES = [
  {
    title: "Una sola cuenta, quince mecánicas",
    body: "Suscripciones, PPV, clips, propinas, live, custom, bundles, afiliados, IA y white-label conviven en un mismo libro de ingresos y una misma bóveda.",
  },
  {
    title: "La creadora manda",
    body: "Precio, tiers, audiencia, disponibilidad, reglas de acceso y porcentaje de reparto visibles. Sin ranking oculto ni letra pequeña.",
  },
  {
    title: "Confianza verificable",
    body: "Consentimiento, edad, moderación, reportes y aceptación legal con versión, fecha y hash. Todo auditable desde el panel.",
  },
  {
    title: "Cumplimiento antes que cobro",
    body: "Modo DEMO sin cargos reales. Contenido adulto deshabilitado hasta completar verificación especializada, revisión legal y aprobación del PSP.",
  },
];
