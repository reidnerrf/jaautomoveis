
export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const generateSEOTitle = (title: string, siteName: string = 'JA Automóveis'): string => {
  return `${title} | ${siteName}`;
};

export const generateVehicleSEO = (vehicle: any): SEOData => {
  return {
    title: generateSEOTitle(`${vehicle.brand} ${vehicle.model} ${vehicle.year}`),
    description: `${vehicle.brand} ${vehicle.model} ${vehicle.year} - ${vehicle.fuelType} - ${new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(vehicle.price)}. Compre na JA Automóveis com qualidade garantida.`,
    keywords: `${vehicle.brand}, ${vehicle.model}, ${vehicle.year}, ${vehicle.fuelType}, carro usado, automóvel`,
    image: vehicle.images?.[0] || '/assets/logo.png',
    type: 'product'
  };
};

export const generatePageSEO = (page: string): SEOData => {
  const seoMap: Record<string, SEOData> = {
    home: {
      title: generateSEOTitle('Carros Usados de Qualidade'),
      description: 'JA Automóveis - Encontre o carro usado perfeito para você. Qualidade garantida, melhores preços e financiamento facilitado.',
      keywords: 'carros usados, automóveis, veículos, compra, venda, financiamento'
    },
    inventory: {
      title: generateSEOTitle('Estoque de Veículos'),
      description: 'Confira nosso estoque completo de carros usados. Diversos modelos, marcas e anos disponíveis.',
      keywords: 'estoque, carros usados, veículos disponíveis, automóveis'
    },
    about: {
      title: generateSEOTitle('Sobre Nós'),
      description: 'Conheça a JA Automóveis. Anos de experiência no mercado de veículos usados com qualidade e confiança.',
      keywords: 'sobre, empresa, história, confiança, experiência'
    },
    contact: {
      title: generateSEOTitle('Contato'),
      description: 'Entre em contato com a JA Automóveis. Tire suas dúvidas, agende uma visita ou solicite informações.',
      keywords: 'contato, telefone, endereço, whatsapp, atendimento'
    },
    financing: {
      title: generateSEOTitle('Financiamento'),
      description: 'Financie seu carro usado com as melhores condições. Aprovação rápida e taxas competitivas.',
      keywords: 'financiamento, crédito, aprovação, taxas, parcelamento'
    }
  };

  return seoMap[page] || {
    title: generateSEOTitle('JA Automóveis'),
    description: 'JA Automóveis - Carros usados de qualidade com garantia.'
  };
};
