import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider } from "react-helmet-async";
import App from "../App";
import { Vehicle } from "../types";

interface SSRData {
  vehicles?: Vehicle[];
  vehicle?: Vehicle;
  seo?: {
    title: string;
    description: string;
    keywords: string;
    image: string;
    url: string;
    type: string;
  };
}

interface SSRResult {
  html: string;
  helmet: any;
  data?: SSRData;
}

export const renderSSR = async (
  url: string,
  data?: SSRData,
): Promise<SSRResult> => {
  // Simular contexto de dados para SSR
  const context: any = {
    data: data || {},
  };

  const helmetContext: any = {};
  const app = renderToString(
    React.createElement(
      StaticRouter,
      { location: url, context },
      React.createElement(
        HelmetProvider,
        { context: helmetContext },
        React.createElement(App),
      ),
    ),
  );

  const helmet = helmetContext.helmet;

  return {
    html: app,
    helmet,
    data,
  };
};

// Função para gerar HTML completo com dados
export const generateFullHTML = (ssrResult: SSRResult): string => {
  const { html, helmet, data } = ssrResult;

  return `
<!DOCTYPE html>
<html ${helmet.htmlAttributes.toString()}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${helmet.title.toString()}
  ${helmet.meta.toString()}
  ${helmet.link.toString()}
  ${helmet.script.toString()}
  
  <!-- Preload critical resources -->
  <link rel="preload" href="/assets/logo.png" as="image">
  <link rel="preload" href="/assets/homepageabout.webp" as="image">
  
  <!-- Critical CSS -->
  <style>
    /* Critical CSS for above-the-fold content */
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .loading { display: flex; justify-content: center; align-items: center; height: 100vh; }
    .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
  </style>
</head>
<body ${helmet.bodyAttributes.toString()}>
  <div id="root">${html}</div>
  
  <!-- Hydration data -->
  <script>
    window.__INITIAL_DATA__ = ${JSON.stringify(data || {})};
  </script>
  
  <!-- Service Worker registration -->
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  </script>
  
  <!-- Client-side bundle -->
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
  `.trim();
};

// Função para gerar páginas estáticas
export const generateStaticPages = async (): Promise<void> => {
  const pages = [
    {
      path: "/",
      data: {
        seo: {
          title: "JA Automóveis - Seu Próximo Carro Está Aqui",
          description:
            "Encontre seu próximo carro com as melhores ofertas e financiamento facilitado na JA Automóveis",
          keywords:
            "carros, automóveis, financiamento, consórcio, JA Automóveis",
          image: "/assets/logo.png",
          url: "/",
          type: "website",
        },
      },
    },
    {
      path: "/inventory",
      data: {
        seo: {
          title: "Estoque de Veículos - JA Automóveis",
          description:
            "Confira nosso estoque completo de veículos com as melhores ofertas e condições de pagamento",
          keywords: "estoque, veículos, carros, ofertas, JA Automóveis",
          image: "/assets/logo.png",
          url: "/inventory",
          type: "website",
        },
      },
    },
    {
      path: "/about",
      data: {
        seo: {
          title: "Sobre Nós - JA Automóveis",
          description:
            "Conheça a história e os valores da JA Automóveis, sua parceira de confiança na compra de veículos",
          keywords: "sobre, história, valores, JA Automóveis",
          image: "/assets/logo.png",
          url: "/about",
          type: "website",
        },
      },
    },
    {
      path: "/contact",
      data: {
        seo: {
          title: "Contato - JA Automóveis",
          description:
            "Entre em contato com a JA Automóveis. Estamos prontos para atendê-lo e tirar suas dúvidas",
          keywords: "contato, atendimento, telefone, endereço, JA Automóveis",
          image: "/assets/logo.png",
          url: "/contact",
          type: "website",
        },
      },
    },
    {
      path: "/financing",
      data: {
        seo: {
          title: "Financiamento - JA Automóveis",
          description:
            "Financiamento facilitado para seu veículo. Condições especiais e aprovação rápida na JA Automóveis",
          keywords:
            "financiamento, crédito, aprovação, condições, JA Automóveis",
          image: "/assets/logo.png",
          url: "/financing",
          type: "website",
        },
      },
    },
    {
      path: "/consortium",
      data: {
        seo: {
          title: "Consórcio - JA Automóveis",
          description:
            "Consórcio de veículos com as melhores condições e grupos organizados na JA Automóveis",
          keywords: "consórcio, grupos, veículos, JA Automóveis",
          image: "/assets/logo.png",
          url: "/consortium",
          type: "website",
        },
      },
    },
  ];

  for (const page of pages) {
    try {
      const ssrResult = await renderSSR(page.path, page.data);
      const html = generateFullHTML(ssrResult);

      // Em produção, salvar arquivos estáticos
      console.log(`Generated static page: ${page.path}`);
    } catch (error) {
      console.error(`Error generating static page ${page.path}:`, error);
    }
  }
};

// Função para gerar página de veículo específica
export const generateVehiclePage = async (
  vehicle: Vehicle,
): Promise<string> => {
  const data: SSRData = {
    vehicle,
    seo: {
      title: `${vehicle.year} ${vehicle.make} ${vehicle.model} - R$ ${vehicle.price.toLocaleString("pt-BR")} | JA Automóveis`,
      description: `${vehicle.year} ${vehicle.make} ${vehicle.model} - ${vehicle.color} - ${vehicle.km.toLocaleString("pt-BR")} km - R$ ${vehicle.price.toLocaleString("pt-BR")}. Confira este veículo na JA Automóveis.`,
      keywords: `${vehicle.make}, ${vehicle.model}, ${vehicle.year}, ${vehicle.color}, carro usado, seminovo, JA Automóveis`,
      image: vehicle.images[0],
      url: `/vehicle/${vehicle.id}`,
      type: "product",
    },
  };

  const ssrResult = await renderSSR(`/vehicle/${vehicle.id}`, data);
  return generateFullHTML(ssrResult);
};

export default {
  renderSSR,
  generateFullHTML,
  generateStaticPages,
  generateVehiclePage,
};
