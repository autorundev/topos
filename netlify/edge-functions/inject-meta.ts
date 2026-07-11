import type { Context } from "https://edge.netlify.com";

// Meta data is inlined at build time for reliability
// Generated from scripts/generate-meta-data.js
const META_DATA: {
  tasks: Record<string, { title: string; description: string }>;
  layers: Record<string, { title: string; description: string }>;
  pages: Record<string, { title: string; description: string }>;
} = JSON.parse(`{"tasks":{},"layers":{"layer_inbound":{"title":"Inbound Layer - AI Interaction Topos","description":"Всё — write в общий лог, РАВНОПРАВНО: сообщение юзера === sync коннектора === крон === собственный эффект Vector. Каждый write триггерит детекторы. Нет «реактивного» и «проактивного» входа — есть просто изменение данных."},"layer_internal":{"title":"Internal Layer - AI Interaction Topos","description":"Reduce (41 детектор-reducer) → gate (admission по gate_mode) → aggregate (starter-recipe) → the one brain (_run_agent_inner) с read-only тулами → построение графа (link_entities, dream batch) → ночной цикл. Всё читает vault-субстрат (~65 таблиц)."},"layer_outbound":{"title":"Outbound Layer - AI Interaction Topos","description":"actuate_effect — один egress-гейт: send в чат, vault/calendar-write, с audience-render + confirm(необратимое/non-self) + cost-cap + safety-pierce. Эффект — сам write, петлёй возвращается входом следующего цикла."}},"pages":{"/":{"title":"AI Interaction Topos - Open Source AI UX Reference","description":"Comprehensive reference for designing AI experiences. 100+ patterns, visual examples, and reusable components for AI UX designers and product teams."},"/topos":{"title":"Topos Overview - AI Interaction Topos","description":"Explore the complete taxonomy of AI interaction patterns. Browse by task type, layer, or capability."},"/topos/ai":{"title":"AI Tasks - AI Interaction Topos","description":"AI-driven tasks including detection, generation, classification, and more. Explore patterns for machine learning capabilities."},"/topos/human":{"title":"Human Actions - AI Interaction Topos","description":"Human-initiated actions in AI systems. Patterns for input, review, feedback, and human-in-the-loop workflows."},"/topos/system":{"title":"System Operations - AI Interaction Topos","description":"System-level operations including data management, APIs, notifications, and infrastructure patterns."},"/topos/data":{"title":"Data Types - AI Interaction Topos","description":"Data artifacts that flow through AI systems. Understand inputs, outputs, and intermediate data structures."},"/topos/constraints":{"title":"Constraints - AI Interaction Topos","description":"Design constraints that shape AI interactions. Privacy, latency, accuracy, and other considerations."},"/topos/touchpoints":{"title":"Touchpoints - AI Interaction Topos","description":"Interface touchpoints where humans and AI systems interact. Screens, voice, APIs, and more."},"/topos/reference":{"title":"Quick Reference - AI Interaction Topos","description":"Quick reference guide for AI interaction patterns. At-a-glance summaries and navigation."},"/privacy":{"title":"Privacy Policy - AI Interaction Topos","description":"Privacy policy for the AI Interaction Topos website."},"/terms":{"title":"Terms of Service - AI Interaction Topos","description":"Terms of service for the AI Interaction Topos website."}}}`);

const DEFAULT_META = {
  title: "AI Interaction Topos - Open Source AI UX Reference",
  description: "Comprehensive reference for designing AI experiences. 100+ patterns, visual examples, and reusable components for AI UX designers and product teams.",
  url: "https://ai-interaction.com"
};

function getMetaForPath(pathname: string): { title: string; description: string } {
  // Check static pages first
  if (META_DATA.pages[pathname]) {
    return META_DATA.pages[pathname];
  }

  // Check for task pages: /topos/task/{taskId}
  const taskMatch = pathname.match(/^\/topos\/task\/(.+)$/);
  if (taskMatch) {
    const taskId = taskMatch[1];
    if (META_DATA.tasks[taskId]) {
      return META_DATA.tasks[taskId];
    }
  }

  // Check for layer pages: /topos/layer/{layerId}
  const layerMatch = pathname.match(/^\/topos\/layer\/(.+)$/);
  if (layerMatch) {
    const layerId = layerMatch[1];
    if (META_DATA.layers[layerId]) {
      return META_DATA.layers[layerId];
    }
  }

  // Default fallback
  return {
    title: DEFAULT_META.title,
    description: DEFAULT_META.description
  };
}

export default async function handler(request: Request, context: Context) {
  // Bail out early for paths we know don't need meta injection
  const url = new URL(request.url);
  const meta = getMetaForPath(url.pathname);
  if (meta.title === DEFAULT_META.title) {
    return context.next();
  }

  let response: Response;
  try {
    response = await context.next();
  } catch {
    // Origin failed — nothing we can do, return a bare 502
    return new Response("Bad Gateway", { status: 502 });
  }

  // Only process HTML responses
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("text/html")) {
    return response;
  }

  try {
    // Get the HTML
    let html = await response.text();

    // Escape special characters for safe replacement
    const safeTitle = meta.title.replace(/[&<>"']/g, (c) => {
      const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
      return entities[c] || c;
    });
    const safeDesc = meta.description.replace(/[&<>"']/g, (c) => {
      const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
      return entities[c] || c;
    });
    const canonicalUrl = `${DEFAULT_META.url}${url.pathname}`;

    // Replace meta tags in the <head>
    html = html
      .replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`)
      .replace(/<meta name="title" content="[^"]*">/, `<meta name="title" content="${safeTitle}">`)
      .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${safeDesc}">`)
      .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${safeTitle}">`)
      .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${safeDesc}">`)
      .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${canonicalUrl}">`)
      .replace(/<meta property="twitter:title" content="[^"]*">/, `<meta property="twitter:title" content="${safeTitle}">`)
      .replace(/<meta property="twitter:description" content="[^"]*">/, `<meta property="twitter:description" content="${safeDesc}">`)
      .replace(/<meta property="twitter:url" content="[^"]*">/, `<meta property="twitter:url" content="${canonicalUrl}">`)
      .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonicalUrl}">`);

    // Build new headers without stale Content-Length
    const headers = new Headers(response.headers);
    headers.delete("content-length");

    return new Response(html, {
      status: response.status,
      headers
    });
  } catch (error) {
    // HTML processing failed — return the original unmodified response
    console.error("Edge function error:", error);
    return response;
  }
}

// Disabled while investigating 500 errors
// export const config = {
//   path: "/*",
//   excludedPath: ["/assets/*", "/*.js", "/*.css", "/*.svg", "/*.png", "/*.jpg", "/*.ico", "/*.json"]
// };
