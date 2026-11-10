/* Documentos legales de XCLUSIVE — versión consolidada del prototipo.
 * Estatus: BORRADOR. Requiere revisión legal, fiscal, de protección de datos y
 * de cumplimiento antes de su publicación o de habilitar cobros reales.
 */

export const LEGAL_VERSION = "2026.11-demo";
export const LEGAL_UPDATED = "9 de noviembre de 2026";
export const LEGAL_STATUS = "Borrador para revisión legal, fiscal y de cumplimiento";
export const LEGAL_ENTITY = "TAMV ONLINE NETWORK";
export const LEGAL_CONTACT = {
  legal: "legal@tamvonline.network",
  privacy: "privacidad@tamvonline.network",
  support: "soporte@tamvonline.network",
  address: "[Domicilio por definir]",
  phone: "[Teléfono por definir]",
};

export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  table?: { headers: string[]; rows: string[][] };
};

export type LegalDoc = {
  id: string;
  title: string;
  short: string;
  icon: string;
  version: string;
  updated: string;
  status: string;
  readingMin: number;
  preamble: string;
  sections: LegalSection[];
};

const D = LEGAL_VERSION;
const U = LEGAL_UPDATED;
const S = LEGAL_STATUS;

export const LEGAL_DOCS: LegalDoc[] = [
  {
    id: "terminos",
    title: "Términos y Condiciones",
    short: "Reglas de uso, membresías, Modo DEMO, cancelación y responsabilidad.",
    icon: "scroll",
    version: D,
    updated: U,
    status: S,
    readingMin: 12,
    preamble:
      "Estos Términos y Condiciones regulan el uso de XCLUSIVE, la contratación de membresías, el acceso a contenido protegido, las transacciones en Modo DEMO y la relación entre XCLUSIVE, las personas usuarias y las creadoras. Al registrarte, contratar una membresía, adquirir acceso a contenido, enviar mensajes, publicar material o utilizar cualquier función, aceptas estos Términos, el Aviso de Privacidad, la Política de Cookies, la Política de Contenido y las reglas de moderación vigentes.",
    sections: [
      {
        id: "identificacion",
        title: "1. Identificación del servicio",
        paragraphs: [
          "XCLUSIVE es una plataforma digital operada por TAMV ONLINE NETWORK que permite a personas creadoras publicar, organizar, distribuir y monetizar contenido, así como interactuar con sus comunidades.",
          "XCLUSIVE no es propietaria del contenido publicado por las creadoras, salvo los contenidos propios de la plataforma, su software, marca, interfaz, documentación y materiales operativos. La disponibilidad, precio, duración, beneficios y condiciones de una membresía dependen de la configuración de cada creadora, de las funciones efectivamente habilitadas y de las restricciones legales, técnicas o comerciales aplicables.",
        ],
      },
      {
        id: "elegibilidad",
        title: "2. Aceptación y elegibilidad",
        paragraphs: [
          "Al utilizar XCLUSIVE declaras que tienes la edad legal requerida para contratar en tu jurisdicción, que eres titular de la cuenta o cuentas con autorización válida, que proporcionas información veraz y actualizada y que no utilizarás la plataforma para fines ilícitos, fraudulentos, abusivos o que vulneren derechos de terceros.",
          "XCLUSIVE puede solicitar verificaciones adicionales para prevenir fraude, proteger a menores, cumplir obligaciones legales o verificar la identidad de una creadora. La autodeclaración de mayoría de edad del prototipo no sustituye una verificación robusta en producción.",
        ],
      },
      {
        id: "demo",
        title: "3. Modo DEMO",
        paragraphs: [
          "Durante la fase de demostración, las suscripciones, propinas, compras de acceso individual, tickets, retiros y demás operaciones económicas son simulaciones. En Modo DEMO no se realizan cargos reales, no se generan saldos retirables, no se transfieren fondos, no se crean deudas ni obligaciones de pago y no se realizan promesas de rentabilidad, reembolso o retorno económico.",
          "Los importes mostrados son referenciales y no constituyen instrumentos financieros. Toda operación DEMO se identifica mediante etiquetas como DEMO, SIMULACIÓN o SIN CARGO REAL.",
        ],
      },
      {
        id: "membresias",
        title: "4. Membresías disponibles",
        paragraphs: [
          "Las membresías pueden organizarse en tres niveles: Insider (acceso básico), VIP Club (contenido y experiencias reservadas) y XTRIME Inner Circle (nivel premium de mayor exclusividad, sujeto a disponibilidad, curaduría y lanzamiento). La existencia de un nivel no implica que todos los beneficios estén disponibles desde el primer día; XCLUSIVE solo comunica como activas las funciones implementadas, probadas y autorizadas.",
        ],
      },
      {
        id: "pago",
        title: "5. Contratación y pago",
        paragraphs: [
          "Cuando los pagos reales se habiliten, antes de confirmar una compra se informará de forma clara el nombre de la membresía o producto, el precio total, la moneda, la periodicidad del cobro, la fecha estimada del siguiente cargo, la duración del acceso, las condiciones de renovación y cancelación, y los impuestos, comisiones o cargos aplicables.",
          "El pago se procesará a través de proveedores autorizados. XCLUSIVE no almacenará números completos de tarjeta, códigos CVC, contraseñas de banca ni datos biométricos.",
        ],
      },
      {
        id: "renovacion",
        title: "6. Renovación automática",
        paragraphs: [
          "Si una membresía incluye renovación automática, se informará el importe, la periodicidad y la fecha estimada del siguiente cargo. Cuando aplique la ley mexicana, se notificará cualquier renovación automática con al menos cinco días naturales de anticipación y se permitirá cancelar sin penalización. La renovación requerirá consentimiento expreso e informado al momento de contratar.",
        ],
      },
      {
        id: "cancelacion",
        title: "7. Cancelación inmediata",
        paragraphs: [
          "Puedes cancelar tu membresía desde tu cuenta en cualquier momento, mediante un mecanismo igual o más sencillo que el utilizado para contratar. La cancelación impide renovaciones futuras, no genera penalización y conserva el acceso hasta el cierre del periodo ya pagado, conforme a la política de reembolsos.",
        ],
      },
      {
        id: "reembolsos",
        title: "8. Reembolsos",
        paragraphs: [
          "Los reembolsos se rigen por la política vigente, la ley aplicable y las reglas del proveedor de pagos. En general no se garantiza reembolso por contenido ya accesible o consumido, por cancelación voluntaria después de acceder al servicio, por falta de uso ni por expectativas no incluidas en la descripción del producto.",
          "XCLUSIVE podrá considerar reembolsos excepcionales ante errores de cobro, duplicidad, fraude, indisponibilidad grave o incumplimiento atribuible a la plataforma.",
        ],
      },
      {
        id: "acceso",
        title: "9. Acceso personal e intransferible",
        paragraphs: [
          "El acceso a una membresía es personal, intransferible y está vinculado a tu cuenta. No puedes compartir credenciales, permitir que otra persona use tu cuenta, vender o sublicenciar la membresía, crear cuentas múltiples para evadir límites, acceder mediante métodos automatizados no autorizados ni eludir controles de seguridad, cifrado, DRM o restricciones de reproducción.",
        ],
      },
      {
        id: "protegido",
        title: "10. Contenido protegido",
        paragraphs: [
          "El contenido protegido puede incluir URLs temporales, tokens efímeros, límites de reproducción, marcas de agua visibles o forenses, cifrado, gestión de derechos digitales y registro de eventos de seguridad. El acceso no implica propiedad intelectual, derecho de descarga, derecho de redistribución ni autorización para publicar el material fuera de XCLUSIVE.",
        ],
      },
      {
        id: "contenido",
        title: "11. Políticas de contenido y restricciones",
        paragraphs: [
          "Está prohibido publicar, distribuir, almacenar, solicitar o promover contenido sexual o explotación de menores, material íntimo sin consentimiento informado, específico, libre y vigente, contenido que incite violencia, odio, discriminación, acoso o persecución, suplantación de identidad, fraude, phishing, infracción de derechos de autor, marca, privacidad o imagen, actividades ilegales, trata, explotación, coacción o abuso, contenido que incite autolesión o actividades peligrosas, spam, malware o esquemas engañosos.",
          "XCLUSIVE puede revisar, limitar, ocultar, eliminar o reportar contenido que incumpla estas reglas.",
        ],
      },
      {
        id: "moderacion",
        title: "12. Moderación y sanciones",
        paragraphs: [
          "XCLUSIVE puede revisar contenido, investigar reportes y restringir cuentas, publicaciones, archivos, mensajes o funciones cuando exista riesgo legal, de seguridad, de fraude o de incumplimiento. Las medidas pueden incluir advertencia, eliminación de contenido, suspensión temporal, revocación de acceso, suspensión o terminación de cuenta.",
          "Las decisiones relevantes se documentan y, cuando corresponda, podrás solicitar revisión mediante el proceso de apelación descrito en la Política de Contenido.",
        ],
      },
      {
        id: "propiedad",
        title: "13. Propiedad intelectual",
        paragraphs: [
          "La creadora conserva, en la medida permitida por la ley, los derechos sobre el contenido que publica, salvo las licencias limitadas necesarias para operar, almacenar, distribuir, moderar y proteger el servicio. XCLUSIVE conserva los derechos sobre la plataforma, software, marca, diseño, interfaz, documentación y contenidos propios.",
        ],
      },
      {
        id: "responsabilidad",
        title: "14. Limitación de responsabilidad",
        paragraphs: [
          "XCLUSIVE se proporciona «tal cual» y «según disponibilidad». No se garantiza acceso ininterrumpido, ausencia de errores, compatibilidad total con todos los dispositivos o imposibilidad absoluta de capturas, grabaciones o redistribuciones no autorizadas.",
          "Ninguna cláusula libera a XCLUSIVE de su responsabilidad civil ni obliga a la persona consumidora a renunciar a la protección de la ley aplicable. Los contratos de adhesión no pueden permitir modificaciones unilaterales abusivas ni trasladar responsabilidad al consumidor.",
        ],
      },
      {
        id: "cambios",
        title: "15. Cambios y ley aplicable",
        paragraphs: [
          "Podemos actualizar estos Términos. Los cambios materiales se comunicarán por medios razonables antes o al momento de su entrada en vigor. Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier controversia se someterá a los tribunales competentes de la República Mexicana, sin perjuicio de los derechos de las personas consumidoras.",
        ],
      },
      {
        id: "contacto",
        title: "16. Contacto",
        paragraphs: [
          `Responsable: ${LEGAL_ENTITY}. Domicilio: ${LEGAL_CONTACT.address}. Correo legal: ${LEGAL_CONTACT.legal}. Correo de privacidad: ${LEGAL_CONTACT.privacy}. Teléfono: ${LEGAL_CONTACT.phone}.`,
          "Antes de operar públicamente en México, este documento debe incluir la identidad legal completa del responsable, domicilio, correo de contacto, mecanismos ARCO, plazos de respuesta y canal de atención.",
        ],
      },
    ],
  },
  {
    id: "privacidad",
    title: "Aviso de Privacidad",
    short: "Datos tratados, finalidades, derechos ARCO, transferencias y seguridad.",
    icon: "shield",
    version: D,
    updated: U,
    status: S,
    readingMin: 11,
    preamble:
      "Este Aviso de Privacidad explica cómo TAMV ONLINE NETWORK recaba, utiliza, almacena, protege, comparte y elimina tus datos personales cuando utilizas XCLUSIVE. Debe incluir identidad y domicilio del responsable, datos tratados, finalidades, fundamentos, mecanismos ARCO, opciones para limitar el uso y divulgación, cookies, cambios y medios de contacto.",
    sections: [
      {
        id: "responsable",
        title: "1. Responsable del tratamiento",
        paragraphs: [
          `Responsable: ${LEGAL_ENTITY}. Domicilio: ${LEGAL_CONTACT.address}. Correo de contacto: ${LEGAL_CONTACT.privacy}. Teléfono: ${LEGAL_CONTACT.phone}. Sitio web: [Por definir]. Encargado de protección de datos: [Por definir].`,
          "XCLUSIVE es operado por TAMV ONLINE NETWORK. El responsable determina las finalidades y medios del tratamiento de tus datos personales.",
        ],
      },
      {
        id: "datos",
        title: "2. Datos personales que recabamos",
        paragraphs: ["XCLUSIVE puede tratar las siguientes categorías de datos:"],
        bullets: [
          "Datos de cuenta: nombre, alias o nombre público, correo electrónico, contraseña cifrada, fecha de nacimiento o edad cuando aplique, país, estado o ciudad, imagen de perfil, biografía, preferencias de contenido, idioma y configuración.",
          "Datos de uso: publicaciones, comentarios, mensajes y archivos; historial de suscripciones, compras, propinas y accesos; interacciones con creadoras, publicaciones y salas en vivo; reportes, bloqueos y solicitudes de moderación; datos técnicos de dispositivo, navegador, sistema operativo y sesiones; dirección IP y huella técnica cuando sea necesario para seguridad o prevención de fraude.",
          "Datos de pago (cuando se habiliten): nombre del titular, últimos cuatro dígitos de la tarjeta, marca, fecha de expiración aproximada, token del proveedor, historial de transacciones, reembolsos y disputas. XCLUSIVE no almacenará números completos de tarjeta, códigos CVC, contraseñas de banca ni datos biométricos.",
        ],
      },
      {
        id: "finalidades",
        title: "3. Finalidades del tratamiento",
        paragraphs: [
          "Finalidades necesarias: crear y administrar tu cuenta; verificar identidad cuando aplique; permitir el acceso a contenido y membresías; procesar transacciones cuando estén habilitadas; enviar notificaciones de cuenta; prevenir fraude, abuso y actividad maliciosa; moderar contenido y atender reportes; mejorar la experiencia y la seguridad; cumplir obligaciones legales, fiscales o regulatorias.",
          "Finalidades adicionales: personalizar recomendaciones y experiencias; enviar comunicaciones comerciales previa autorización; realizar análisis agregados y estadísticos; mejorar productos, funciones y servicios; prevenir fraudes y detectar patrones de riesgo. Puedes revocar el consentimiento para finalidades adicionales en cualquier momento, sin que ello afecte la legalidad del tratamiento previo.",
        ],
      },
      {
        id: "sensibles",
        title: "4. Datos sensibles",
        paragraphs: [
          "XCLUSIVE puede tratar datos sensibles únicamente cuando exista una base legal clara, consentimiento informado y finalidad específica. No se utilizarán datos sensibles para publicidad, perfiles publicitarios o fines no relacionados con la operación segura de la plataforma.",
        ],
      },
      {
        id: "fundamento",
        title: "5. Fundamento legal",
        paragraphs: [
          "El tratamiento se realiza conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, su Reglamento, las disposiciones administrativas aplicables y las políticas internas de XCLUSIVE. El aviso debe identificar el fundamento legal que faculta al responsable para tratar datos personales.",
        ],
      },
      {
        id: "arco",
        title: "6. Derechos ARCO",
        paragraphs: [
          "Puedes ejercer los derechos de Acceso (conocer qué datos tratamos), Rectificación (corregir datos inexactos o incompletos), Cancelación (solicitar la eliminación cuando aplique) y Oposición (oponerte al tratamiento en ciertos supuestos).",
          `Para ejercerlos, envía una solicitud a ${LEGAL_CONTACT.privacy} con nombre completo, correo registrado, descripción clara y precisa de los datos, derecho que deseas ejercer y documento que acredite tu identidad o la personalidad de tu representante cuando aplique.`,
        ],
      },
      {
        id: "procedimiento-arco",
        title: "7. Procedimiento ARCO",
        paragraphs: [
          "El plazo máximo para informar si procede el ejercicio del derecho es de 20 días hábiles contados desde el día siguiente a la recepción de la solicitud. Si procede, las acciones se harán efectivas en 15 días hábiles contados desde la notificación de la respuesta.",
          "Si la solicitud carece de información necesaria, XCLUSIVE podrá emitir una prevención en un plazo máximo de 5 días hábiles. La negativa parcial o total será fundada y motivada cuando no se acredite identidad, no sea posible identificar los datos, exista obligación legal de conservarlos, se afecten derechos de terceros o la solicitud sea frívola o improcedente.",
          "Si no estás conforme con la respuesta, puedes presentar una solicitud de protección de derechos ante el INAI dentro de los 15 días hábiles siguientes a la respuesta. Si no hay respuesta, puedes acudir una vez concluido el plazo de 20 días hábiles.",
        ],
      },
      {
        id: "limitacion",
        title: "8. Limitación de uso y divulgación",
        paragraphs: [
          "Puedes solicitar limitar el uso o divulgación de tus datos mediante el mismo canal de contacto. XCLUSIVE podrá conservar ciertos datos cuando exista obligación legal, necesidad de seguridad, prevención de fraude o defensa de derechos.",
        ],
      },
      {
        id: "transferencias",
        title: "9. Transferencias de datos",
        paragraphs: [
          "XCLUSIVE podrá compartir datos con proveedores de almacenamiento, pagos, verificación de identidad, moderación o seguridad, y con autoridades competentes cuando exista obligación legal. XCLUSIVE no venderá tus datos personales.",
        ],
      },
      {
        id: "cookies",
        title: "10. Cookies y tecnologías de rastreo",
        paragraphs: [
          "XCLUSIVE utiliza cookies y tecnologías similares para mantener tu sesión, recordar preferencias, mejorar la seguridad, analizar el uso, prevenir fraude y personalizar la experiencia. Puedes administrar ciertas cookies desde tu navegador y desde el centro de preferencias de la plataforma, aunque algunas funciones pueden dejar de funcionar.",
        ],
      },
      {
        id: "seguridad",
        title: "11. Seguridad y conservación",
        paragraphs: [
          "XCLUSIVE implementa medidas técnicas, administrativas y organizativas: cifrado en tránsito, almacenamiento privado, control de acceso basado en roles, auditoría de acciones sensibles, prevención de fraude y respuesta ante incidentes. Ningún sistema es absolutamente infalible; por ello se mantienen procesos de detección, respuesta y mitigación.",
          "Los datos se conservan durante la vigencia de la relación y por los plazos legales aplicables. Posteriormente se eliminan o anonimizan conforme a la ley.",
        ],
      },
      {
        id: "cambios",
        title: "12. Cambios y contacto",
        paragraphs: [
          "Cualquier cambio al Aviso se comunicará por medios razonables antes o al momento de su entrada en vigor. Contacto: " +
            `${LEGAL_CONTACT.privacy}. Domicilio: ${LEGAL_CONTACT.address}. Teléfono: ${LEGAL_CONTACT.phone}.`,
        ],
      },
    ],
  },
  {
    id: "cookies",
    title: "Política de Cookies",
    short: "Tipos de cookies, finalidades, control y preferencias.",
    icon: "cookie",
    version: D,
    updated: U,
    status: S,
    readingMin: 5,
    preamble:
      "Esta Política explica cómo XCLUSIVE utiliza cookies y tecnologías similares para operar, proteger y mejorar la plataforma, y cómo puedes administrar tus preferencias.",
    sections: [
      {
        id: "objeto",
        title: "1. Objeto",
        paragraphs: [
          "Esta Política de Cookies forma parte del Aviso de Privacidad y de los Términos y Condiciones. Aplica a todas las personas que utilizan XCLUSIVE.",
        ],
      },
      {
        id: "tipos",
        title: "2. Tipos de cookies",
        paragraphs: ["XCLUSIVE puede utilizar las siguientes categorías:"],
        bullets: [
          "Esenciales: necesarias para mantener la sesión, proteger contra fraude, prevenir ataques y permitir funciones básicas.",
          "De preferencias: recuerdan idioma, tema visual, configuración de accesibilidad, preferencias de contenido y privacidad.",
          "Analíticas: miden uso, rendimiento de páginas, interacciones, errores técnicos y patrones de navegación.",
          "De seguridad: detectan actividad sospechosa, previenen fraude, protegen cuentas y registran eventos.",
          "De personalización: adaptan recomendaciones y experiencia, previa autorización.",
        ],
      },
      {
        id: "finalidades",
        title: "3. Finalidades",
        paragraphs: [
          "Mantener la sesión iniciada, recordar preferencias, mejorar la seguridad, analizar el uso, prevenir fraude y abuso, y personalizar la experiencia.",
        ],
      },
      {
        id: "esenciales",
        title: "4. Cookies esenciales",
        paragraphs: [
          "Son necesarias para mantener la sesión, proteger contra fraude, prevenir ataques, garantizar la seguridad y permitir funciones básicas. No requieren consentimiento cuando son estrictamente necesarias para prestar el servicio solicitado.",
        ],
      },
      {
        id: "control",
        title: "5. Control y preferencias",
        paragraphs: [
          "Puedes aceptar todas las cookies, limitarte a las esenciales o configurar categorías desde el centro de preferencias. También puedes administrarlas desde tu navegador; algunas funciones pueden dejar de funcionar correctamente si desactivas las esenciales.",
          "En este prototipo, las preferencias se guardan localmente en tu dispositivo y las cookies analíticas son simuladas: no se envía información a un proveedor externo.",
        ],
      },
      {
        id: "base",
        title: "6. Base legal y cambios",
        paragraphs: [
          "El tratamiento se realiza conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares y su Reglamento. Cualquier cambio a esta Política se comunicará por medios razonables. Contacto: " +
            LEGAL_CONTACT.privacy +
            ".",
        ],
      },
    ],
  },
  {
    id: "contrato-creadoras",
    title: "Contrato de Servicios para Creadoras",
    short: "Relación, obligaciones, licencia, comisiones, retiros y terminación.",
    icon: "pen",
    version: D,
    updated: U,
    status: S,
    readingMin: 13,
    preamble:
      "Este contrato regula la relación entre TAMV ONLINE NETWORK («XCLUSIVE») y la persona creadora que utiliza la plataforma para publicar, organizar, distribuir y monetizar contenido. La aceptación debe ser expresa, informada y registrada con versión, fecha, hora e identificador de cuenta.",
    sections: [
      {
        id: "objeto",
        title: "1. Objeto",
        paragraphs: [
          "XCLUSIVE proporciona una plataforma tecnológica para crear y administrar el perfil, publicar contenido, organizar la bóveda multimedia, configurar membresías, interactuar con la comunidad, acceder a herramientas de monetización cuando estén habilitadas y recibir reportes, métricas y controles de seguridad.",
          "XCLUSIVE no es propietaria del contenido publicado por las creadoras, salvo los contenidos propios de la plataforma.",
        ],
      },
      {
        id: "aceptacion",
        title: "2. Aceptación del contrato",
        paragraphs: [
          "La creadora acepta este contrato al crear una cuenta, solicitar un perfil de creadora, publicar contenido, subir archivos a la bóveda, configurar membresías, utilizar funciones de monetización o aceptar los Términos y Condiciones. La aceptación se registra con versión, fecha, hora e identificador de cuenta.",
        ],
      },
      {
        id: "naturaleza",
        title: "3. Naturaleza de la relación",
        paragraphs: [
          "La relación es de prestación de servicios tecnológicos. XCLUSIVE no actúa como empleadora, representante, apoderada, socia, asociada, intermediaria financiera, institución de crédito, entidad de fondos de pago, procesadora de pagos ni custodia de fondos de la creadora.",
        ],
      },
      {
        id: "obligaciones-xclusive",
        title: "4. Obligaciones de XCLUSIVE",
        paragraphs: ["XCLUSIVE se obliga a:"],
        bullets: [
          "Proporcionar acceso a la plataforma conforme a las funciones disponibles.",
          "Mantener controles de seguridad razonables.",
          "Proteger la información personal conforme a la ley aplicable.",
          "Informar sobre cambios relevantes en Términos, precios o políticas.",
          "Atender reportes y solicitudes de moderación.",
          "Conservar registros de auditoría cuando corresponda.",
          "Facilitar el ejercicio de derechos ARCO.",
          "Permitir la cancelación de membresías cuando aplique.",
          "No utilizar el contenido de la creadora fuera de las finalidades autorizadas.",
        ],
      },
      {
        id: "obligaciones-creadora",
        title: "5. Obligaciones de la creadora",
        paragraphs: ["La creadora se obliga a:"],
        bullets: [
          "Proporcionar información veraz, completa y actualizada.",
          "Cumplir las políticas de contenido y las leyes aplicables.",
          "Contar con los derechos necesarios sobre el contenido que publica.",
          "Obtener los consentimientos necesarios de terceros.",
          "No publicar contenido ilegal, abusivo, engañoso o que vulnere derechos de terceros.",
          "No suplantar identidades ni infringir derechos de autor, marca, privacidad o imagen.",
          "No utilizar la plataforma para actividades ilícitas, fraudulentas o de explotación.",
          "Mantener la seguridad de sus credenciales y notificar incidentes relevantes.",
        ],
      },
      {
        id: "licencia",
        title: "6. Contenido y licencia limitada",
        paragraphs: [
          "La creadora conserva, en la medida permitida por la ley, los derechos sobre el contenido. Otorga a XCLUSIVE una licencia limitada, no exclusiva, mundial, revocable y gratuita para almacenar, procesar técnicamente, distribuir dentro de la plataforma, moderar, proteger, cumplir obligaciones legales y prevenir fraude o abuso. La licencia no implica cesión de derechos de autor, marca, imagen, privacidad ni derechos de terceros.",
        ],
      },
      {
        id: "comisiones",
        title: "7. Monetización y comisiones",
        paragraphs: [
          "Cuando los pagos reales se habiliten, XCLUSIVE podrá aplicar una comisión sobre las transacciones, siempre que esté claramente informada antes de confirmar la compra. La comisión puede incluir la comisión de XCLUSIVE, la del proveedor de pagos, impuestos aplicables, costos de conversión y costos de disputa, reembolso o contracargo.",
          "Antes de confirmar una compra se mostrará precio bruto, comisión de XCLUSIVE, comisión del proveedor de pagos, impuestos aplicables, total a pagar y neto estimado para la creadora.",
        ],
      },
      {
        id: "retiros",
        title: "8. Pagos, retiros y liquidaciones",
        paragraphs: [
          "Los pagos, retiros y liquidaciones solo se habilitarán cuando exista un proveedor autorizado y compatible con el modelo de negocio. XCLUSIVE no custodiará fondos salvo mediante un proveedor autorizado y conforme a la ley. Las creadoras podrán solicitar retiros conforme a saldos disponibles, límites mínimos y máximos, plazos de liquidación, políticas antifraude, retenciones legales o fiscales y reglas del proveedor.",
        ],
      },
      {
        id: "demo",
        title: "9. Modo DEMO",
        paragraphs: [
          "Durante la demostración, suscripciones, propinas, compras, tickets y retiros son simulaciones. No se realizan cargos, no se generan saldos retirables, no se transfieren fondos, no se crean deudas y no se promete rentabilidad. Los importes son referenciales y no constituyen instrumentos financieros.",
        ],
      },
      {
        id: "propiedad",
        title: "10. Propiedad intelectual y confidencialidad",
        paragraphs: [
          "XCLUSIVE conserva los derechos sobre la plataforma, software, marca, diseño, interfaz, documentación y contenidos propios. XCLUSIVE mantiene la confidencialidad de la información no pública de la creadora, salvo consentimiento expreso, obligación legal, prevención de fraude o daño, protección de derechos de terceros u orden judicial o administrativa.",
        ],
      },
      {
        id: "terminacion",
        title: "11. Terminación",
        paragraphs: [
          "XCLUSIVE puede terminar o suspender el acceso cuando exista incumplimiento de Términos o políticas de contenido, riesgo legal, de seguridad o fraude, orden judicial o administrativa, o incumplimiento grave o reiterado. La terminación no afecta derechos adquiridos conforme a la ley, salvo causa legal que lo justifique.",
        ],
      },
      {
        id: "ley",
        title: "12. Ley aplicable, notificaciones y contacto",
        paragraphs: [
          `Este contrato se rige por las leyes de los Estados Unidos Mexicanos. Notificaciones: correo registrado, avisos dentro de la plataforma, publicación en el sitio o medios electrónicos equivalentes. Contacto legal: ${LEGAL_CONTACT.legal}. Domicilio: ${LEGAL_CONTACT.address}.`,
        ],
      },
    ],
  },
  {
    id: "contenido",
    title: "Política de Contenido y Moderación",
    short: "Contenido prohibido, verificación, moderación, sanciones y apelación.",
    icon: "flag",
    version: D,
    updated: U,
    status: S,
    readingMin: 8,
    preamble:
      "Esta Política define qué contenido está prohibido, cómo se modera, qué sanciones existen y cómo apelar. Aplica a publicaciones, mensajes, archivos, salas en vivo, perfiles y cualquier interacción dentro de XCLUSIVE.",
    sections: [
      {
        id: "prohibido",
        title: "1. Contenido absolutamente prohibido",
        paragraphs: ["Está prohibido publicar, distribuir, almacenar, solicitar o promover:"],
        bullets: [
          "Contenido sexual o explotación de menores de edad.",
          "Material íntimo sin consentimiento informado, específico, libre y vigente.",
          "Contenido que incite violencia, odio, discriminación, acoso o persecución.",
          "Suplantación de identidad, fraude, phishing o engaño.",
          "Infracción de derechos de autor, marca, privacidad, imagen o derechos de terceros.",
          "Actividades ilegales, tráfico de personas, explotación, coacción o abuso.",
          "Contenido que incite autolesión, violencia extrema o actividades peligrosas.",
          "Spam, phishing, malware, estafas o esquemas engañosos.",
          "Cualquier contenido que viole leyes, reglamentos o políticas de XCLUSIVE.",
        ],
      },
      {
        id: "adulto",
        title: "2. Contenido adulto",
        paragraphs: [
          "El contenido adulto permanece deshabilitado hasta completar: verificación de edad mediante proveedor especializado; consentimiento documentado; políticas de contenido y denuncia; proceso de apelación; revisión legal; y aprobación contractual del PSP.",
          "La normativa mexicana reciente exige mecanismos confiables de verificación de edad que no se limiten a autodeclaración, además de obligaciones de moderación, remoción, conservación de evidencia y punto de contacto. En este prototipo, la verificación es declarativa y el contenido adulto está apagado por defecto.",
        ],
      },
      {
        id: "verificacion",
        title: "3. Verificación de edad y consentimiento",
        paragraphs: [
          "Toda creadora debe acreditar mayoría de edad y consentimiento documentado antes de publicar. Todo contenido que involucre a terceras personas requiere su consentimiento informado, específico, libre y vigente, con evidencia conservada de forma segura y accesible solo para moderación y cumplimiento.",
        ],
      },
      {
        id: "moderacion",
        title: "4. Moderación",
        paragraphs: [
          "XCLUSIVE puede revisar contenido, investigar reportes y restringir cuentas, publicaciones, archivos, mensajes o funciones cuando exista riesgo legal, de seguridad, de fraude o de incumplimiento. La moderación combina revisión humana y señales automatizadas; ninguna decisión automatizada sustituye el derecho de apelación.",
        ],
      },
      {
        id: "sanciones",
        title: "5. Sanciones",
        paragraphs: ["Las medidas pueden incluir:"],
        bullets: [
          "Advertencia y solicitud de corrección.",
          "Eliminación o limitación de contenido.",
          "Suspensión temporal de funciones o de la cuenta.",
          "Revocación de acceso.",
          "Terminación de la cuenta.",
          "Reporte a autoridades cuando exista obligación legal.",
        ],
      },
      {
        id: "apelacion",
        title: "6. Apelación",
        paragraphs: [
          `La persona afectada puede solicitar revisión enviando un correo a ${LEGAL_CONTACT.legal} con el identificador de la decisión, los argumentos y la evidencia disponible. XCLUSIVE documentará la decisión y responderá en un plazo razonable. Durante la revisión se podrá mantener la medida cautelar cuando exista riesgo para menores, terceros o la seguridad de la plataforma.`,
        ],
      },
      {
        id: "reportes",
        title: "7. Reportes y conservación de evidencia",
        paragraphs: [
          "Cualquier persona puede reportar contenido desde la plataforma o por correo. Los reportes reciben un identificador y estado. XCLUSIVE conserva evidencia de contenido prohibido, decisiones y apelaciones durante los plazos legales aplicables, con acceso restringido y medidas de seguridad proporcionales.",
        ],
      },
      {
        id: "contacto",
        title: "8. Contacto",
        paragraphs: [`Punto de contacto de confianza y seguridad: ${LEGAL_CONTACT.legal}.`],
      },
    ],
  },
  {
    id: "comisiones",
    title: "Política de Comisiones y Transparencia",
    short: "Comisiones, ejemplo de liquidación, reglas y derechos de la creadora.",
    icon: "percent",
    version: D,
    updated: U,
    status: S,
    readingMin: 6,
    preamble:
      "XCLUSIVE informa de forma clara las comisiones aplicables antes de confirmar cualquier compra. Esta Política complementa los Términos y el Contrato de Servicios para Creadoras.",
    sections: [
      {
        id: "estructura",
        title: "1. Estructura de costos",
        paragraphs: [
          "XCLUSIVE podrá aplicar una comisión sobre las transacciones realizada a través de la plataforma, siempre que esté claramente informada antes de confirmar la compra. La comisión puede incluir la comisión de XCLUSIVE, la del proveedor de pagos, impuestos aplicables, costos de conversión de moneda y costos de disputa, reembolso o contracargo.",
        ],
      },
      {
        id: "transparencia",
        title: "2. Transparencia antes de comprar",
        paragraphs: ["Antes de confirmar una compra se mostrará:"],
        bullets: [
          "Precio bruto.",
          "Comisión de XCLUSIVE.",
          "Comisión del proveedor de pagos.",
          "Impuestos aplicables.",
          "Total a pagar.",
          "Neto estimado para la creadora.",
        ],
      },
      {
        id: "ejemplo",
        title: "3. Ejemplo ilustrativo",
        paragraphs: [
          "El siguiente ejemplo es referencial y no constituye una promesa de ingresos ni una tarifa contractual definitiva.",
        ],
        table: {
          headers: ["Concepto", "Porcentaje", "Monto"],
          rows: [
            ["Precio bruto", "100%", "$100.00 MXN"],
            ["Comisión XCLUSIVE", "10%", "$10.00 MXN"],
            ["Comisión PSP", "3.5%", "$3.50 MXN"],
            ["Impuestos aplicables", "Variable", "$0.00 MXN"],
            ["Neto estimado para creadora", "86.5%", "$86.50 MXN"],
          ],
        },
      },
      {
        id: "reglas",
        title: "4. Reglas de comisión",
        paragraphs: [
          "La comisión será informada antes de confirmar la compra y no se aplicarán cargos ocultos. Las comisiones podrán variar según método de pago, moneda, país o tipo de transacción. No podrán imponerse como servicios adicionales sin opción de aceptarlos o rechazarlos.",
        ],
      },
      {
        id: "reparto",
        title: "5. Reparto para creadoras",
        paragraphs: [
          "Cada creadora tiene un porcentaje de reparto visible en su panel de ingresos. El prototipo permite configurar 80% (estándar) y 85% (línea Unlockd) y muestra la comisión de plataforma correspondiente. En producción, el reparto definitivo debe constar en el contrato y reflejarse en el libro mayor de doble entrada.",
        ],
      },
      {
        id: "disputas",
        title: "6. Disputas, reembolsos y cambios",
        paragraphs: [
          "Las disputas, reembolsos y contracargos se gestionan conforme al proveedor de pagos y la ley aplicable. Cualquier cambio de comisión se comunicará antes de su entrada en vigor. Contacto: " +
            LEGAL_CONTACT.legal +
            ".",
        ],
      },
    ],
  },
  {
    id: "cancelacion",
    title: "Política de Cancelación y Reembolsos",
    short: "Cancelación inmediata, efectos, PROFECO y reembolsos.",
    icon: "undo",
    version: D,
    updated: U,
    status: S,
    readingMin: 7,
    preamble:
      "Esta Política explica cómo cancelar una membresía, qué efectos tiene y cómo acudir a PROFECO si consideras que tus derechos fueron vulnerados.",
    sections: [
      {
        id: "directa",
        title: "1. Cancelación directa en XCLUSIVE",
        paragraphs: [
          "Puedes cancelar tu membresía desde tu cuenta en cualquier momento, salvo que una restricción legal o contractual aplicable lo impida. La cancelación puede realizarse desde el mismo medio utilizado para contratar o mediante un mecanismo igual o más sencillo.",
        ],
      },
      {
        id: "efectos",
        title: "2. Efectos de la cancelación",
        paragraphs: ["La cancelación:"],
        bullets: [
          "Impide renovaciones futuras.",
          "No implica necesariamente la eliminación inmediata del contenido ya adquirido, salvo que la creadora o XCLUSIVE lo determinen por razones legítimas.",
          "No genera penalización.",
          "Puede conservar el acceso hasta el cierre del periodo ya pagado, conforme a la política de reembolsos.",
        ],
      },
      {
        id: "profeco",
        title: "3. Cancelación ante PROFECO",
        paragraphs: [
          "Si no puedes cancelar directamente o consideras que tus derechos fueron vulnerados, puedes presentar una queja ante la Procuraduría Federal del Consumidor (PROFECO).",
        ],
        bullets: [
          "Acudir a una Oficina de Defensa del Consumidor (ODECO).",
          "Utilizar Concilianet en línea.",
          "Utilizar Conciliaexprés con empresas registradas.",
          "Documentos: identificación oficial vigente, comprobante de compra, contrato, recibo o factura, descripción del servicio, narración de hechos, nombre y domicilio del proveedor y evidencia adicional.",
          "Procedimiento: PROFECO revisa si procede, inicia conciliación y, en servicios, permite preconciliación por hasta 15 días hábiles. Si no hay acuerdo, PROFECO da respuesta en los siguientes 10 días hábiles.",
        ],
      },
      {
        id: "reembolsos",
        title: "4. Reembolsos",
        paragraphs: [
          "Los reembolsos se rigen por la política vigente, la ley aplicable y las reglas del proveedor de pagos. En general no se garantiza reembolso por contenido ya accesible o consumido, incumplimiento de reglas, cancelación voluntaria después de acceder, falta de uso o expectativas no incluidas en la descripción.",
          "XCLUSIVE podrá considerar reembolsos excepcionales ante errores de cobro, duplicidad, fraude, indisponibilidad grave o incumplimiento atribuible a la plataforma.",
        ],
      },
      {
        id: "renovacion",
        title: "5. Renovación y avisos",
        paragraphs: [
          "Cuando aplique la ley mexicana, se notificará cualquier renovación automática con al menos cinco días naturales de anticipación y se permitirá cancelar sin penalización. La renovación requerirá consentimiento expreso e informado al contratar.",
        ],
      },
      {
        id: "contacto",
        title: "6. Contacto",
        paragraphs: [`Soporte: ${LEGAL_CONTACT.support}. Legal: ${LEGAL_CONTACT.legal}.`],
      },
    ],
  },
  {
    id: "aceptacion",
    title: "Flujo de Aceptación y Registro de Consentimiento",
    short: "Cómo se registra la aceptación: versión, fecha, cuenta y hash.",
    icon: "check",
    version: D,
    updated: U,
    status: S,
    readingMin: 5,
    preamble:
      "XCLUSIVE registra la aceptación expresa e informada de sus documentos legales. Este documento describe el flujo, los datos registrados y cómo consultarlos.",
    sections: [
      {
        id: "registro",
        title: "1. Registro de persona usuaria",
        paragraphs: ["Al registrarte debes leer y aceptar de forma expresa:"],
        bullets: [
          "Términos y Condiciones.",
          "Aviso de Privacidad.",
          "Política de Cookies.",
          "Política de Contenido y Moderación.",
          "Confirmar tu edad legal.",
          "Confirmar que no utilizarás la plataforma para fines ilícitos.",
        ],
      },
      {
        id: "creadora",
        title: "2. Registro como creadora",
        paragraphs: ["Además de lo anterior, al solicitar un perfil de creadora debes aceptar:"],
        bullets: [
          "Contrato de Prestación de Servicios para Creadoras.",
          "Política de Comisiones y Transparencia.",
          "Confirmar que tienes derechos sobre el contenido.",
          "Confirmar que no publicarás contenido prohibido.",
          "Confirmar que aceptas las políticas de moderación.",
        ],
      },
      {
        id: "datos",
        title: "3. Datos que se registran",
        paragraphs: ["XCLUSIVE registra, para cada aceptación:"],
        bullets: [
          "Documento y versión aceptada.",
          "Fecha y hora.",
          "Identificador de cuenta.",
          "Canal de aceptación (registro, cuenta o creadora).",
          "Hash de aceptación.",
          "En producción: dirección IP, dispositivo o navegador, y hash criptográfico con sal del servidor.",
        ],
      },
      {
        id: "consulta",
        title: "4. Consulta y actualizaciones",
        paragraphs: [
          "Puedes consultar tus aceptaciones desde Mi cuenta → Legal y privacidad. Si una versión cambia, la plataforma te pedirá aceptar la nueva versión antes de continuar usando funciones que requieran consentimiento. Las aceptaciones anteriores se conservan como evidencia.",
        ],
      },
      {
        id: "demo",
        title: "5. Nota del prototipo",
        paragraphs: [
          "En este prototipo, el registro se almacena localmente en tu navegador y el hash es determinista, no criptográfico. No constituye evidencia legal suficiente para producción. Antes de operar, debe migrarse a un servidor con almacenamiento inmutable, control de acceso y respaldo.",
        ],
      },
    ],
  },
  {
    id: "demo",
    title: "Modo DEMO y Estado de Cumplimiento",
    short: "Qué funciona hoy, qué no, y qué falta para producción real.",
    icon: "info",
    version: D,
    updated: U,
    status: "Documento operativo del prototipo",
    readingMin: 6,
    preamble:
      "XCLUSIVE se entrega como un prototipo funcional de alto nivel en Modo DEMO. Esta página explica con precisión qué puedes probar, qué es simulado y qué debe completarse antes de un lanzamiento comercial.",
    sections: [
      {
        id: "que-es",
        title: "1. Qué es el Modo DEMO",
        paragraphs: [
          "Es un entorno de simulación segura. Las suscripciones, propinas, PPV, clips, bundles, tickets, solicitudes custom y retiros se registran en el libro de ingresos del prototipo, pero no se realiza ningún cargo, transferencia ni promesa de pago.",
        ],
      },
      {
        id: "funciona",
        title: "2. Qué sí funciona",
        paragraphs: ["Puedes probar de punta a punta:"],
        bullets: [
          "Registro e inicio de sesión con roles de fan, creadora y administración.",
          "Descubrimiento, perfiles, tiers, suscripciones, pruebas gratuitas, PPV, clips, bundles, propinas y contenido custom.",
          "Salones en vivo simulados con chat, audiencia, propinas y control de acceso.",
          "Mensajería con respuestas sugeridas por IA y ofertas PPV adjuntas.",
          "Consola de creadora: contenido, membresías, salones, solicitudes, ingresos, retiros, afiliados y ajustes.",
          "Panel administrativo: solicitudes, moderación, reportes, pagos, white-label y métricas.",
          "Aceptación legal con versión, fecha, canal y hash; derechos ARCO; preferencias de cookies.",
          "Exportación de datos y eliminación del entorno local.",
        ],
      },
      {
        id: "no-funciona",
        title: "3. Qué es simulado o no está habilitado",
        paragraphs: [
          "No hay pasarela de pagos ni PSP conectado. No se procesan tarjetas. No se generan saldos retirables. No hay verificación de edad con proveedor certificado, verificación de identidad, KYC/KYB, almacenamiento de archivos, streaming real, correo transaccional ni base de datos remota.",
          "El contenido adulto está deshabilitado por defecto. Las imágenes del prototipo son editoriales y no explícitas.",
        ],
      },
      {
        id: "datos",
        title: "4. Dónde viven los datos",
        paragraphs: [
          "Los datos de este prototipo se guardan en localStorage de tu navegador. No se envían a un servidor. Si borras los datos del sitio, se restablece el entorno de demostración.",
        ],
      },
      {
        id: "produccion",
        title: "5. Ruta mínima a producción",
        paragraphs: ["Antes de habilitar cobros o contenido adulto se requiere:"],
        bullets: [
          "Revisión legal, fiscal y de protección de datos de todos los documentos.",
          "Constitución/identificación del responsable y domicilio.",
          "Verificación de edad con proveedor especializado y consentimiento documentado.",
          "KYC/KYB de creadoras y prevención de fraude.",
          "PSP que acepte expresamente el modelo de negocio.",
          "Base de datos PostgreSQL con RLS, cifrado, respaldos y auditoría inmutable.",
          "Autenticación server-side, cookies HttpOnly/Secure/SameSite, rate limits y CSRF.",
          "Almacenamiento privado con URLs firmadas de vida corta y marcas de agua.",
          "Moderación humana, proceso de apelación y punto de contacto.",
          "Política de cookies y consentimiento implementados.",
          "Pruebas E2E, monitoreo, respuesta a incidentes y plan de continuidad.",
        ],
      },
      {
        id: "promesa",
        title: "6. Lo que no prometemos",
        paragraphs: [
          "No prometemos ingresos, rentabilidad, reembolsos, disponibilidad ininterrumpida ni ausencia total de capturas o redistribución. La decisión de publicar, cobrar o desplegar es responsabilidad de la persona operadora y debe contar con asesoría profesional.",
        ],
      },
    ],
  },
];

export const LEGAL_BY_ID = new Map(LEGAL_DOCS.map((d) => [d.id, d] as const));

export const REQUIRED_DOCS_FAN = ["terminos", "privacidad", "cookies", "contenido"] as const;
export const REQUIRED_DOCS_CREATOR = [
  "terminos",
  "privacidad",
  "cookies",
  "contenido",
  "contrato-creadoras",
  "comisiones",
] as const;

export const LEGAL_GROUPS: { title: string; description: string; ids: string[] }[] = [
  {
    title: "Uso de la plataforma",
    description: "Reglas, elegibilidad, Modo DEMO y responsabilidad.",
    ids: ["terminos", "cancelacion", "comisiones"],
  },
  {
    title: "Datos y privacidad",
    description: "Datos tratados, ARCO, cookies y consentimiento.",
    ids: ["privacidad", "cookies", "aceptacion"],
  },
  {
    title: "Creadoras y contenido",
    description: "Contrato, contenido prohibido, moderación y apelación.",
    ids: ["contrato-creadoras", "contenido"],
  },
  {
    title: "Transparencia operativa",
    description: "Estado real del prototipo y ruta a producción.",
    ids: ["demo"],
  },
];

export function legalDoc(id: string): LegalDoc | null {
  return LEGAL_BY_ID.get(id) ?? null;
}

export function legalTitle(id: string): string {
  return LEGAL_BY_ID.get(id)?.title ?? id;
}
