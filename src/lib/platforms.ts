/* Capacidades propias de Xclusive.
 *
 * Este archivo describe lo que la plataforma hace, no de dónde se copió:
 * no menciona marcas de terceros ni conteos de plataformas.
 */

export type CapabilityCategory =
  "Membresías" | "Contenido" | "Directo" | "Ingresos" | "Creadoras" | "Confianza";

export type Capability = {
  id: string;
  name: string;
  category: CapabilityCategory;
  summary: string;
  features: string[];
  surfaces: string[];
};

export const CAPABILITY_CATEGORIES: CapabilityCategory[] = [
  "Membresías",
  "Contenido",
  "Directo",
  "Ingresos",
  "Creadoras",
  "Confianza",
];

export const CAPABILITIES: Capability[] = [
  {
    id: "tiers",
    name: "Membresías por niveles",
    category: "Membresías",
    summary:
      "Cada creadora publica sus propios niveles, precios y beneficios. Sin plantillas impuestas.",
    features: [
      "Hasta tres niveles con precio libre por creadora",
      "Prueba gratuita opcional con límite de días",
      "Acceso a publicaciones y salones según el nivel",
      "Cancelación en un paso, sin penalización",
    ],
    surfaces: ["Perfil de creadora", "Membresías", "Mi cuenta"],
  },
  {
    id: "feed",
    name: "Muro editorial",
    category: "Contenido",
    summary: "Publicaciones con texto, imagen y audio, con visibilidad definida pieza por pieza.",
    features: [
      "Visibilidad pública, para miembros o por nivel",
      "Publicaciones bloqueadas que se desbloquean con pago",
      "Programación de estrenos y avisos",
      "Comentarios moderados por la creadora",
    ],
    surfaces: ["Explorar", "Perfil de creadora", "Estudio"],
  },
  {
    id: "ppv",
    name: "Desbloqueo pieza por pieza",
    category: "Ingresos",
    summary: "El contenido premium se compra individualmente, sin obligar a una suscripción.",
    features: [
      "Precio por publicación, clip o galería",
      "Compra única con acceso permanente en la bóveda",
      "Confirmación de precio antes de pagar",
      "Recibo y desglose de comisión visibles",
    ],
    surfaces: ["Perfil de creadora", "Mensajes", "Bóveda"],
  },
  {
    id: "clips",
    name: "Clips a la carta",
    category: "Contenido",
    summary: "Un catálogo de piezas cortas con duración, precio y etiquetas claras.",
    features: [
      "Búsqueda por categoría, duración y precio",
      "Vista previa antes de comprar",
      "Colecciones curadas por la creadora",
      "Descarga protegida y marca de agua opcional",
    ],
    surfaces: ["Clips", "Perfil de creadora", "Bóveda"],
  },
  {
    id: "live",
    name: "Salones en vivo",
    category: "Directo",
    summary: "Sesiones privadas o abiertas, con aforo, horario y acceso controlados.",
    features: [
      "Salas abiertas, para miembros o por boleto",
      "Chat moderado y propinas durante la sesión",
      "Recordatorio previo y repetición opcional",
      "Aforo máximo definido por la creadora",
    ],
    surfaces: ["Salones", "Perfil de creadora", "Estudio"],
  },
  {
    id: "tips",
    name: "Propinas y metas",
    category: "Ingresos",
    summary: "Apoyo directo con monto libre y metas de proyecto visibles para la comunidad.",
    features: [
      "Propina con monto libre y mensaje opcional",
      "Metas con progreso público",
      "Agradecimiento automático configurable",
      "Historial de propinas en el panel de la creadora",
    ],
    surfaces: ["Perfil de creadora", "Salones", "Estudio"],
  },
  {
    id: "messages",
    name: "Mensajes con contexto",
    category: "Directo",
    summary: "Conversaciones que respetan el nivel de acceso y el consentimiento de cada parte.",
    features: [
      "Bandeja con etiquetas de membresía",
      "Envío de contenido bloqueado dentro del chat",
      "Respuestas asistidas que la creadora aprueba",
      "Bloqueo y reporte en un paso",
    ],
    surfaces: ["Mensajes", "Perfil de creadora", "Estudio"],
  },
  {
    id: "custom",
    name: "Encargos personalizados",
    category: "Ingresos",
    summary: "Solicitudes a medida con alcance, plazo y precio acordados antes de empezar.",
    features: [
      "Formulario de encargo con brief y referencias",
      "Contraoferta y calendario de entrega",
      "Pago retenido hasta la aceptación",
      "Límites de contenido declarados por la creadora",
    ],
    surfaces: ["Mensajes", "Perfil de creadora", "Estudio"],
  },
  {
    id: "bundles",
    name: "Paquetes y temporadas",
    category: "Contenido",
    summary: "Conjuntos de piezas con precio conjunto y vigencia definida.",
    features: [
      "Paquetes por tema o temporada",
      "Precio conjunto con ahorro visible",
      "Disponibilidad con fecha de cierre",
      "Contenido del paquete listado antes de comprar",
    ],
    surfaces: ["Clips", "Perfil de creadora", "Bóveda"],
  },
  {
    id: "vault",
    name: "Bóveda personal",
    category: "Contenido",
    summary: "Todo lo comprado y lo guardado, ordenado y disponible sin volver a pagar.",
    features: [
      "Compras, favoritos y descargas en un solo lugar",
      "Acceso permanente mientras la cuenta exista",
      "Filtros por creadora, tipo y fecha",
      "Solicitud de borrado de datos desde la misma vista",
    ],
    surfaces: ["Bóveda", "Mi cuenta"],
  },
  {
    id: "studio",
    name: "Estudio de creadora",
    category: "Creadoras",
    summary: "Panel para publicar, fijar precios y entender qué funciona, sin cajas negras.",
    features: [
      "Ingresos brutos, comisión y neto desglosados",
      "Borradores y programación de publicaciones",
      "Métricas de conversión por pieza",
      "Mensajes y encargos pendientes en una bandeja",
    ],
    surfaces: ["Estudio", "Mi cuenta"],
  },
  {
    id: "trust",
    name: "Confianza y consentimiento",
    category: "Confianza",
    summary: "Reglas explícitas, aceptación registrada y derecho a retirar el consentimiento.",
    features: [
      "Aceptación documento por documento con fecha",
      "Verificación de edad y de identidad para publicar",
      "Reportes con revisión y respuesta",
      "Derechos ARCO operables desde la cuenta",
    ],
    surfaces: ["Centro legal", "Mi cuenta", "Administración"],
  },
];

export const ECOSYSTEM_PRINCIPLES = [
  {
    title: "Una sola cuenta",
    body: "Perfil, membresías, compras y mensajes viven en el mismo lugar. Sin saltar entre herramientas.",
  },
  {
    title: "La creadora fija las reglas",
    body: "Precios, niveles, aforo y límites de contenido los decide ella, no el algoritmo.",
  },
  {
    title: "Comisiones a la vista",
    body: "Cada cobro muestra el desglose completo antes de confirmarse. Nada se descuenta en silencio.",
  },
  {
    title: "Consentimiento trazable",
    body: "Cada aceptación queda registrada con fecha y versión, y puede retirarse cuando la persona quiera.",
  },
  {
    title: "Datos que se pueden borrar",
    body: "Exportar o eliminar la cuenta es una acción disponible, no un trámite por correo.",
  },
  {
    title: "Sin promesas de más",
    body: "Lo que aún no está operativo se declara como tal. El producto no finge funciones que no existen.",
  },
];
