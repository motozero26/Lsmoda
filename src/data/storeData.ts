export interface Product {
  id: number;
  name: string;
  category: string;
  priceVarejo: number;
  priceAtacado: number;
  description: string;
  icon: string;
  image: string;
}

export interface CollectionItem {
  id: string;
  icon: string;
  name: string;
  description: string;
  image?: string;
}

export interface ReviewItem {
  name: string;
  stars: number;
  comment: string;
  city?: string;
}

export interface WholesaleLead {
  name: string;
  company?: string;
  whatsapp: string;
  city: string;
  interest: string;
  createdAt: string;
}

export const STORE_CONFIG = {
  name: "LAUDINÉIA",
  tagline: "Moda Feminina · Atacado e Varejo",
  whatsappNumber: "5584991094456",
  whatsappFormatted: "(84) 9 9109-4456",
  instagramUrl: "https://www.instagram.com/ls_modafeminina2023",
  googleMapsUrl: "https://maps.app.goo.gl/UkF5mZ1SM3sMAnVk7",
  minWholesalePieces: 5,
  retailMaxInstallments: 6,
  wholesaleMaxInstallments: 3,
  retailCashDiscount: 0.05, // 5%
  wholesaleCashDiscount: 0.07, // 7%
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 0,
    name: "Vestido midi",
    category: "Feminina",
    priceVarejo: 129.9,
    priceAtacado: 99.9,
    description: "Tecido leve, modelagem sofisticada e caimento impecável.",
    icon: "👗",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 1,
    name: "Conjunto linho",
    category: "Feminina",
    priceVarejo: 159.9,
    priceAtacado: 119.9,
    description: "Visual elegante e fresco, perfeito para dias quentes e eventos casuais.",
    icon: "✨",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    name: "Blusa cropped",
    category: "Feminina",
    priceVarejo: 59.9,
    priceAtacado: 42.9,
    description: "Design moderno com acabamento refinado para combinar com tudo.",
    icon: "👚",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    name: "Calça alfaiataria",
    category: "Feminina",
    priceVarejo: 119.9,
    priceAtacado: 89.9,
    description: "Corte reto impecável que valoriza a silhueta com extremo conforto.",
    icon: "👖",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 4,
    name: "Saia plissada",
    category: "Feminina",
    priceVarejo: 89.9,
    priceAtacado: 64.9,
    description: "Movimento fluido e cintura confortável para looks elegantes.",
    icon: "🎀",
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 5,
    name: "Kit acessórios",
    category: "Acessórios",
    priceVarejo: 39.9,
    priceAtacado: 27.9,
    description: "Conjunto exclusivo de semijoias e detalhes para valorizar seu look.",
    icon: "💎",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
  },
];

export const COLLECTIONS: CollectionItem[] = [
  { id: "fem", icon: "✿", name: "Moda feminina", description: "Vestidos, conjuntos, blusas e calças com tendências atuais." },
  { id: "masc", icon: "◈", name: "Moda masculina", description: "Camisas, bermudas e peças básicas essenciais de alta durabilidade." },
  { id: "inf", icon: "✦", name: "Infantil", description: "Looks confortáveis e fofos para momentos especiais dos pequenos." },
  { id: "bel", icon: "❀", name: "Beleza", description: "Produtos e cuidados pensados para realçar o seu bem-estar." },
  { id: "calc", icon: "⌑", name: "Calçados", description: "Rasteiras, sandálias e modelos versáteis para o dia a dia." },
  { id: "aces", icon: "◇", name: "Acessórios & presentes", description: "Itens selecionados para complementar ou presentear com carinho." },
];

export const INITIAL_REVIEWS: ReviewItem[] = [
  {
    name: "Mariana Silva",
    stars: 5,
    comment: "Peças lindas e atendimento excelente. Chegou tudo certinho e muito bem embalado!",
    city: "Natal / RN",
  },
  {
    name: "Fernanda Costa",
    stars: 5,
    comment: "Comprei no atacado para revenda e esgotou na mesma semana. Ótimo preço e qualidade!",
    city: "Mossoró / RN",
  },
  {
    name: "Carla Mendes",
    stars: 5,
    comment: "Entrega rápida, tecidos de ótima qualidade e tamanhos certinhos. Recomendo de olhos fechados!",
    city: "Fortaleza / CE",
  },
  {
    name: "Juliana Santos",
    stars: 5,
    comment: "Modelos super atuais e a equipe me ajudou a escolher pelo WhatsApp com muita paciência. Voltarei!",
    city: "João Pessoa / PB",
  },
];

/**
 * Cálculo estimado de frete por CEP no Brasil baseado na região (primeiro dígito)
 */
export function estimateShipping(cepDigits: string): { cost: number; days: string } | null {
  const clean = cepDigits.replace(/\D/g, "");
  if (clean.length !== 8) return null;
  const first = clean[0];
  const table: Record<string, [number, string]> = {
    "5": [14.9, "2 a 4"], // RN, PB, PE, AL
    "4": [24.9, "4 a 7"], // BA, SE
    "3": [24.9, "4 a 7"], // MG
    "0": [29.9, "5 a 8"], // SP capital / Grande SP
    "1": [29.9, "5 a 8"], // SP interior
    "2": [29.9, "5 a 8"], // RJ, ES
    "6": [29.9, "6 a 10"], // CE, PI, MA, PA, AP, AM, RR, AC
    "7": [29.9, "6 a 10"], // DF, GO, TO, MT, MS, RO
    "8": [34.9, "6 a 10"], // PR, SC
    "9": [34.9, "6 a 10"], // RS
  };
  const res = table[first] || [29.9, "5 a 9"];
  return { cost: res[0], days: res[1] };
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
