/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  BRAND_LOGO_BASE64,
  HERO_BANNER_URL,
} from "./assets/images";
import {
  STORE_CONFIG,
  INITIAL_PRODUCTS,
  COLLECTIONS,
  INITIAL_REVIEWS,
  Product,
  WholesaleLead,
  estimateShipping,
  formatCurrency,
} from "./data/storeData";

export default function App() {
  // Store mode: 'v' (varejo) or 'a' (atacado)
  const [mode, setMode] = useState<"v" | "a">(() => {
    try {
      const saved = localStorage.getItem("ls_mode");
      return saved === "a" ? "a" : "v";
    } catch {
      return "v";
    }
  });

  // Cart state: { [productId]: quantity }
  const [cart, setCart] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem("ls_cart");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Cart drawer open/close
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Category menu open/close
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // Payment method: 'pix' or 'cc'
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "cc">("pix");

  // Shipping CEP state
  const [cep, setCep] = useState<string>(() => {
    try {
      return localStorage.getItem("ls_cep") || "";
    } catch {
      return "";
    }
  });
  const [shippingResult, setShippingResult] = useState<{
    cost: number;
    days: string;
  } | null>(() => {
    try {
      const savedCep = localStorage.getItem("ls_cep");
      return savedCep ? estimateShipping(savedCep) : null;
    } catch {
      return null;
    }
  });

  // Wholesale lead form state
  const [leadName, setLeadName] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [leadWhatsapp, setLeadWhatsapp] = useState("");
  const [leadCity, setLeadCity] = useState("");
  const [leadInterest, setLeadInterest] = useState("Moda feminina");
  const [leadsList, setLeadsList] = useState<WholesaleLead[]>(() => {
    try {
      const saved = localStorage.getItem("ls_leads");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Review carousel state
  const [currentReview, setCurrentReview] = useState(0);
  const reviewTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cookie consent banner
  const [cookieConsent, setCookieConsent] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem("ls_cookies");
      return saved !== null ? Number(saved) : null;
    } catch {
      return null;
    }
  });

  // In-app Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Sync cart & mode to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("ls_cart", JSON.stringify(cart));
      localStorage.setItem("ls_mode", mode);
    } catch (e) {
      console.error(e);
    }
  }, [cart, mode]);

  // Review carousel auto-slide
  const startReviewTimer = () => {
    if (reviewTimerRef.current) clearInterval(reviewTimerRef.current);
    reviewTimerRef.current = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % INITIAL_REVIEWS.length);
    }, 4500);
  };

  useEffect(() => {
    startReviewTimer();
    return () => {
      if (reviewTimerRef.current) clearInterval(reviewTimerRef.current);
    };
  }, []);

  // Cart calculations
  const totalItemsCount = Object.values(cart).reduce((sum, q) => sum + q, 0);

  const getProductPrice = (product: Product) => {
    return mode === "a" ? product.priceAtacado : product.priceVarejo;
  };

  const cartSubtotal = Object.entries(cart).reduce((sum, [idStr, qty]) => {
    const p = INITIAL_PRODUCTS.find((item) => item.id === Number(idStr));
    if (!p || qty <= 0) return sum;
    return sum + getProductPrice(p) * qty;
  }, 0);

  const discountRate =
    paymentMethod === "pix"
      ? mode === "a"
        ? STORE_CONFIG.wholesaleCashDiscount
        : STORE_CONFIG.retailCashDiscount
      : 0;
  const discountValue = cartSubtotal * discountRate;
  const shippingCost = shippingResult ? shippingResult.cost : 0;
  const cartFinalTotal = Math.max(0, cartSubtotal - discountValue + shippingCost);
  const maxInstallments =
    mode === "a"
      ? STORE_CONFIG.wholesaleMaxInstallments
      : STORE_CONFIG.retailMaxInstallments;

  // Add to cart
  const addToCart = (productId: number) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
    const product = INITIAL_PRODUCTS.find((p) => p.id === productId);
    showToast(`"${product?.name || "Item"}" adicionado ao carrinho!`);
    setIsCartOpen(true);
  };

  // Change quantity
  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) => {
      const nextQty = (prev[productId] || 0) + delta;
      if (nextQty <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: nextQty };
    });
  };

  // Calculate Shipping handler
  const handleCalculateShipping = () => {
    const result = estimateShipping(cep);
    if (!result) {
      showToast("Por favor, digite um CEP válido com 8 números.");
      return;
    }
    setShippingResult(result);
    try {
      localStorage.setItem("ls_cep", cep.replace(/\D/g, ""));
    } catch {}
    showToast(`Frete calculado: ${formatCurrency(result.cost)} (${result.days} dias úteis)`);
  };

  // Checkout via WhatsApp
  const handleCheckout = () => {
    if (totalItemsCount === 0) {
      showToast("Seu carrinho está vazio. Adicione itens antes de finalizar!");
      return;
    }

    if (mode === "a" && totalItemsCount < STORE_CONFIG.minWholesalePieces) {
      showToast(
        `Para compras no atacado, o pedido mínimo é de ${STORE_CONFIG.minWholesalePieces} peças (faltam ${
          STORE_CONFIG.minWholesalePieces - totalItemsCount
        }).`
      );
      return;
    }

    if (!shippingResult) {
      showToast("Por favor, informe seu CEP para calcular a taxa de envio.");
      return;
    }

    // Build WhatsApp message
    const itemsList = Object.entries(cart)
      .filter(([_, qty]) => qty > 0)
      .map(([idStr, qty]) => {
        const p = INITIAL_PRODUCTS.find((item) => item.id === Number(idStr));
        return `${qty}x ${p?.name || "Item"} (${formatCurrency(
          p ? getProductPrice(p) : 0
        )})`;
      })
      .join("\n• ");

    const text = `Olá! Gostaria de finalizar meu pedido na *${STORE_CONFIG.name}*:

*Tipo de compra:* ${mode === "a" ? "ATACADO (Mín. 5 peças)" : "VAREJO (Peças unitárias)"}
*Itens do pedido:*
• ${itemsList}

*Subtotal:* ${formatCurrency(cartSubtotal)}
${
  discountValue > 0
    ? `*Desconto à vista (${mode === "a" ? "7%" : "5%"}):* -${formatCurrency(
        discountValue
      )}\n`
    : ""
}*Frete estimado:* ${formatCurrency(shippingCost)} (${shippingResult.days} dias úteis)
*CEP de entrega:* ${cep}
*Forma de pagamento pretendida:* ${
      paymentMethod === "pix" ? "Pix / À vista com desconto" : `Cartão em até ${maxInstallments}x`
    }
*TOTAL:* ${formatCurrency(cartFinalTotal)}

Por favor, confirme a disponibilidade e os detalhes para pagamento. Obrigado!`;

    const url = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
      text
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Submit wholesale lead
  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || leadWhatsapp.replace(/\D/g, "").length < 10) {
      showToast("Por favor, preencha seu nome e um WhatsApp válido com DDD.");
      return;
    }

    const newLead: WholesaleLead = {
      name: leadName.trim(),
      company: leadCompany.trim(),
      whatsapp: leadWhatsapp.trim(),
      city: leadCity.trim(),
      interest: leadInterest,
      createdAt: new Date().toISOString(),
    };

    const updated = [newLead, ...leadsList];
    setLeadsList(updated);
    try {
      localStorage.setItem("ls_leads", JSON.stringify(updated));
    } catch {}

    const leadMsg = `Olá equipe ${STORE_CONFIG.name}! Fiz meu cadastro de lojista:
• *Nome:* ${newLead.name}
• *Loja / CNPJ:* ${newLead.company || "Pessoa Física"}
• *WhatsApp:* ${newLead.whatsapp}
• *Cidade/UF:* ${newLead.city || "Não informado"}
• *Interesse principal:* ${newLead.interest}

Gostaria de receber a tabela de preços de atacado e os lançamentos da semana!`;

    const url = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
      leadMsg
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");

    setLeadName("");
    setLeadCompany("");
    setLeadWhatsapp("");
    setLeadCity("");
    showToast("Cadastro realizado com sucesso! Enviando para o WhatsApp...");
  };

  return (
    <div className="min-h-screen bg-white text-[#2a1418]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="app-toast">
          <span>🔔</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Announcement Bar */}
      <div className="topline">
        Atacado e varejo • Enviamos para todo o Brasil • Calcule o frete pelo CEP
      </div>

      {/* Sticky Header */}
      <header className="header">
        <div className="wrap headrow">
          <div className="hl">
            <a
              className="head-contact"
              href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Fale conosco
            </a>
            <button
              className="hcart"
              onClick={() => setIsCartOpen(true)}
              aria-label="Abrir carrinho"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 4h2.4l2.1 10.2a1.6 1.6 0 0 0 1.6 1.3h8.1a1.6 1.6 0 0 0 1.6-1.2L20.4 8H6.1" />
                <circle cx="9.5" cy="19.5" r="1.4" />
                <circle cx="17" cy="19.5" r="1.4" />
              </svg>
              {totalItemsCount > 0 && <i>{totalItemsCount}</i>}
            </button>
          </div>

          <div className="brand-stack">
            <a className="brand" href="#inicio">
              <img
                src={BRAND_LOGO_BASE64}
                alt="Logo LAUDINÉIA Moda Feminina"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <div
                className="w-16 h-16 rounded-full bg-[var(--rose)] border-2 border-[var(--wine)] hidden items-center justify-center font-serif font-bold text-[var(--wine)] text-xl shadow-xs"
                style={{ display: "none" }}
              >
                LS
              </div>
            </a>
            <div className="category-menu">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center gap-1 text-[var(--wine)] font-extrabold text-[0.79rem] py-1 cursor-pointer bg-transparent border-0"
                aria-expanded={isCategoryOpen}
              >
                <span className="text-[1.25rem] leading-none">☰</span>
                <span className="hidden sm:inline">Categorias</span>
              </button>

              {isCategoryOpen && (
                <nav className="side-panel">
                  <div className="flex justify-between items-center mb-2">
                    <span className="overline">EXPLORE A LOJA</span>
                    <button
                      onClick={() => setIsCategoryOpen(false)}
                      className="text-gray-400 hover:text-black font-bold text-lg cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                  <h2>Compre por categoria</h2>
                  <a
                    href="#loja"
                    onClick={() => setIsCategoryOpen(false)}
                  >
                    Mais vendidos <span>›</span>
                  </a>
                  <a
                    href="#colecoes"
                    onClick={() => setIsCategoryOpen(false)}
                  >
                    Moda feminina <span>›</span>
                  </a>
                  <a
                    href="#colecoes"
                    onClick={() => setIsCategoryOpen(false)}
                  >
                    Moda masculina <span>›</span>
                  </a>
                  <a
                    href="#colecoes"
                    onClick={() => setIsCategoryOpen(false)}
                  >
                    Infantil <span>›</span>
                  </a>
                  <a
                    href="#colecoes"
                    onClick={() => setIsCategoryOpen(false)}
                  >
                    Beleza <span>›</span>
                  </a>
                  <a
                    href="#atacado"
                    onClick={() => setIsCategoryOpen(false)}
                  >
                    Atacado (Lojistas) <span>›</span>
                  </a>
                  <a
                    href="#condicoes"
                    onClick={() => setIsCategoryOpen(false)}
                  >
                    Condições de venda <span>›</span>
                  </a>
                </nav>
              )}
            </div>
          </div>
        </div>

        {/* Desktop & Tablet Navigation */}
        <nav className="nav">
          <a href="#loja">Mais vendidos</a>
          <a href="#colecoes">Coleções</a>
          <a href="#atacado">Atacado</a>
          <a href="#condicoes">Pagamento e trocas</a>
          <a href="#entrega">Entrega</a>
        </nav>
      </header>

      {/* Main Content */}
      <main id="inicio">
        {/* Hero Section */}
        <section className="hero">
          <div className="wrap">
            {/* Brand Logo Medallion */}
            <div className="flex flex-col items-center justify-center mb-3">
              <div className="p-1.5 rounded-full bg-white border-2 border-[var(--wine)] shadow-md">
                <img
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full object-contain"
                  src={BRAND_LOGO_BASE64}
                  alt="LAUDINÉIA Moda Feminina"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fb = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fb) fb.style.display = "flex";
                  }}
                />
                <div
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[var(--rose)] hidden items-center justify-center font-serif font-bold text-[var(--wine)] text-2xl"
                  style={{ display: "none" }}
                >
                  LS
                </div>
              </div>
            </div>

            <div className="eyebrow">
              LAUDINÉIA • MODA FEMININA • ATACADO E VAREJO
            </div>
            <h1>
              Seu estilo,
              <br />
              <em>sua presença.</em>
            </h1>
            <p>
              Moda feminina contemporânea para valorizar sua elegância ou abastecer
              sua loja com alta lucratividade. No atacado a partir de 5 peças.
              Envio seguro para todo o Brasil.
            </p>

            <div className="cta-row">
              <a className="btn btn-yellow" href="#loja">
                Comprar agora
              </a>
              <a className="btn btn-outline" href="#atacado">
                Sou lojista
              </a>
            </div>

            {/* Editorial Showcase Banner */}
            <div className="mt-8 max-w-3xl mx-auto rounded-xl overflow-hidden shadow-lg border border-[var(--line)]">
              <img
                src={HERO_BANNER_URL}
                alt="Coleção de Moda Feminina LAUDINÉIA"
                className="w-full h-48 sm:h-64 md:h-72 object-cover"
                loading="eager"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <div className="trust">
          <div className="wrap trust-in">
            <span>Varejo em até 6x sem juros</span>
            <span>Atacado em até 3x sem juros</span>
            <span>5% off à vista (7% no atacado)</span>
          </div>
        </div>

        {/* Catalog: Mais Vendidos */}
        <section className="best" id="loja">
          <div className="wrap">
            <span className="eyebrow block text-center">MAIS VENDIDOS</span>
            <h2>Adicione ao carrinho</h2>
            <p>
              Escolha como comprar: peças unitárias no varejo ou a partir de 5
              peças no atacado com preços diferenciados.
            </p>

            {/* Mode Switch Tabs */}
            <div className="tabs">
              <button
                className={mode === "v" ? "on" : ""}
                onClick={() => setMode("v")}
              >
                Varejo · peças unitárias
              </button>
              <button
                className={mode === "a" ? "on" : ""}
                onClick={() => setMode("a")}
              >
                Atacado · mín. 5 peças
              </button>
            </div>

            {/* Products Grid with real, verified fashion photos */}
            <div className="pgrid">
              {INITIAL_PRODUCTS.map((prod) => {
                const currentPrice = getProductPrice(prod);
                return (
                  <div key={prod.id} className="card">
                    {/* Product Photo with absolute fallback */}
                    <div className="relative w-full h-52 bg-[var(--rose)] rounded-md overflow-hidden mb-1">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "grid";
                        }}
                      />
                      <div
                        className="ph w-full h-full hidden place-items-center text-4xl"
                        style={{ display: "none" }}
                      >
                        {prod.icon || "✿"}
                      </div>
                      <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs text-[var(--wine)] font-extrabold text-[0.68rem] px-2 py-0.5 rounded shadow-xs">
                        {prod.category}
                      </span>
                    </div>

                    <b>{prod.name}</b>
                    <p className="text-xs text-[var(--muted)] my-0 line-clamp-2">
                      {prod.description}
                    </p>
                    <span className="price">{formatCurrency(currentPrice)}</span>
                    <small>
                      {mode === "a"
                        ? "Atacado • mín. 5 peças no pedido • 3x sem juros"
                        : "Varejo • peça unitária • até 6x sem juros"}
                    </small>
                    <button
                      className="btn btn-yellow mt-2"
                      onClick={() => addToCart(prod.id)}
                    >
                      Adicionar ao carrinho
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Collections */}
        <section className="section" id="colecoes">
          <div className="wrap">
            <span className="eyebrow block text-center">
              ENCONTRE SEU ESTILO
            </span>
            <h2>Coleções</h2>
            <p className="section-intro">
              Escolha a categoria e fale com a equipe sobre modelos, tamanhos e
              valores disponíveis no momento.
            </p>

            <div className="collection-grid">
              {COLLECTIONS.map((col) => (
                <a
                  key={col.id}
                  className="collection"
                  href={`https://wa.me/${
                    STORE_CONFIG.whatsappNumber
                  }?text=${encodeURIComponent(
                    `Olá! Gostaria de consultar peças da categoria: ${col.name}. Poderiam me enviar os modelos disponíveis?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="icon">{col.icon}</span>
                  <div>
                    <h3>{col.name}</h3>
                    <p>{col.description}</p>
                    <span className="go">Consultar coleção no WhatsApp →</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Wholesale Area */}
        <section
          className="section"
          id="atacado"
          style={{ background: "var(--rose)" }}
        >
          <div className="wrap">
            <span className="eyebrow block text-center">ÁREA DO LOJISTA</span>
            <h2>Compre no atacado</h2>
            <p className="section-intro">
              Mínimo de 5 peças por pedido. Cadastre-se para receber tabela de
              preços, lançamentos e ofertas exclusivas direto no WhatsApp.
            </p>

            <form className="form" onSubmit={handleLeadSubmit}>
              <input
                placeholder="Nome completo"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                required
              />
              <input
                placeholder="Nome da loja ou CNPJ (opcional)"
                value={leadCompany}
                onChange={(e) => setLeadCompany(e.target.value)}
              />
              <input
                placeholder="WhatsApp com DDD (ex: 84991094456)"
                value={leadWhatsapp}
                onChange={(e) => setLeadWhatsapp(e.target.value)}
                inputMode="tel"
                required
              />
              <input
                placeholder="Cidade / UF"
                value={leadCity}
                onChange={(e) => setLeadCity(e.target.value)}
              />
              <select
                value={leadInterest}
                onChange={(e) => setLeadInterest(e.target.value)}
              >
                <option value="Moda feminina">Interesse: Moda feminina</option>
                <option value="Moda masculina">Moda masculina</option>
                <option value="Infantil">Infantil</option>
                <option value="Beleza">Beleza</option>
                <option value="Acessórios e presentes">Acessórios & presentes</option>
              </select>
              <button type="submit" className="btn btn-yellow">
                Cadastrar e receber tabela de atacado
              </button>
            </form>

            {leadsList.length > 0 && (
              <div className="list">
                <b>Cadastros registrados neste dispositivo:</b>
                {leadsList.map((lead, idx) => (
                  <div key={idx}>
                    {lead.name} • {lead.city || "Brasil"} • {lead.interest}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Terms & Payment Conditions */}
        <section className="section" id="condicoes">
          <div className="wrap">
            <h2>Pagamento e trocas</h2>
            <div className="tabs">
              <button className="on">Condições gerais</button>
            </div>

            <div className="cond">
              <div>
                <h3>Varejo · peças unitárias</h3>
                <ul>
                  <li>Cartão de crédito em até 6x sem juros</li>
                  <li>À vista (Pix / Transferência): 5% de desconto imediato</li>
                  <li>Troca garantida em até 7 dias após o recebimento</li>
                  <li>Envio pelos Correios ou Transportadora com rastreio</li>
                </ul>
              </div>

              <div>
                <h3>Atacado · mínimo 5 peças</h3>
                <ul>
                  <li>Mínimo de apenas 5 peças por pedido</li>
                  <li>Cartão de crédito em até 3x sem juros</li>
                  <li>À vista (Pix): 7% de desconto especial para lojistas</li>
                  <li>
                    Não realizamos trocas de grade, exceto defeito de fabricação
                    comprovado em até 30 dias
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Delivery / Shipping Calculator */}
        <section className="delivery" id="entrega">
          <div className="wrap">
            <h2>Entrega para todo o Brasil</h2>
            <p>
              Informe o CEP no carrinho e veja a estimativa instantânea de frete e
              prazo de entrega. A nossa equipe confirma tudo antes do envio!
            </p>
            <button
              className="btn btn-yellow"
              onClick={() => setIsCartOpen(true)}
            >
              Calcular frete no carrinho
            </button>
          </div>
        </section>

        {/* Customer Support CTA */}
        <section className="contact" id="atendimento">
          <div className="wrap">
            <h2>Atendimento personalizado</h2>
            <p>
              Dúvidas sobre tamanhos, modelagens, tabela de atacado ou frete?
              Fale diretamente com nossa consultora.
            </p>
            <a
              className="btn btn-yellow"
              href={`https://wa.me/${
                STORE_CONFIG.whatsappNumber
              }?text=${encodeURIComponent(
                "Olá! Gostaria de um atendimento personalizado com a LAUDINÉIA Moda Feminina."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Chamar no WhatsApp {STORE_CONFIG.whatsappFormatted}
            </a>
          </div>
        </section>
      </main>

      {/* Customer Reviews Section */}
      <footer className="footer">
        <div className="wrap">
          <div className="rv">
            <h3>O que dizem nossas clientes</h3>
            <div className="g">
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.2 5.5-4.7 7.2l7.6 5.9c4.4-4.1 6.9-10.1 6.9-17.6z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.9-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.8 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
                />
              </svg>
              <span>Avaliações reais no Google</span>
            </div>

            {/* Review viewport & slides */}
            <div
              className="rv-vp"
              onMouseEnter={() => {
                if (reviewTimerRef.current) clearInterval(reviewTimerRef.current);
              }}
              onMouseLeave={startReviewTimer}
            >
              <div
                className="rv-tr"
                style={{ transform: `translateX(-${currentReview * 100}%)` }}
              >
                {INITIAL_REVIEWS.map((rev, index) => (
                  <div key={index} className="rv-sl">
                    <div className="rv-st">
                      {"★".repeat(rev.stars)}
                      {"☆".repeat(5 - rev.stars)}
                    </div>
                    <p>“{rev.comment}”</p>
                    <b>
                      {rev.name} {rev.city ? `• ${rev.city}` : ""}
                    </b>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel dots */}
            <div className="rv-dots">
              {INITIAL_REVIEWS.map((_, idx) => (
                <button
                  key={idx}
                  className={idx === currentReview ? "on" : ""}
                  onClick={() => setCurrentReview(idx)}
                  aria-label={`Ver avaliação ${idx + 1}`}
                />
              ))}
            </div>

            {/* External Google Links */}
            <div className="rv-links">
              <a
                href={STORE_CONFIG.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.2 5.5-4.7 7.2l7.6 5.9c4.4-4.1 6.9-10.1 6.9-17.6z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.9-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.8 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
                  />
                </svg>
                Ver todas no Google
              </a>
              <a
                href={STORE_CONFIG.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Avaliar a loja
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center mb-2">
            <img
              src={BRAND_LOGO_BASE64}
              alt="LAUDINÉIA"
              className="w-16 h-16 rounded-full object-contain mb-2"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          <p>
            <strong>{STORE_CONFIG.name}</strong> · Moda Feminina · Atacado e
            Varejo
          </p>

          <div className="footer-links">
            <a
              href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp: {STORE_CONFIG.whatsappFormatted}
            </a>
            <a
              className="ic"
              href={STORE_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram da Loja"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <defs>
                  <linearGradient id="igF" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0" stopColor="#6b42c1" />
                    <stop offset=".52" stopColor="#d84b9b" />
                    <stop offset="1" stopColor="#f2a33a" />
                  </linearGradient>
                </defs>
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="5"
                  fill="none"
                  stroke="url(#igF)"
                  strokeWidth="2"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="4.2"
                  fill="none"
                  stroke="url(#igF)"
                  strokeWidth="2"
                />
                <circle cx="18" cy="6.2" r="1.25" fill="url(#igF)" />
              </svg>
              <span>Instagram</span>
            </a>
            <a
              className="ic"
              href={STORE_CONFIG.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Localização no Google Maps"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.2 5.5-4.7 7.2l7.6 5.9c4.4-4.1 6.9-10.1 6.9-17.6z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.9-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.8 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
                />
              </svg>
              <span>Google · Como chegar</span>
            </a>
          </div>

          <div className="copyright">
            © {new Date().getFullYear()} {STORE_CONFIG.name} Moda & Estilo · Todos
            os direitos reservados.
          </div>
        </div>
      </footer>

      {/* Floating Bottom Navigation Bar (Mobile / Tablet) */}
      <nav id="fbar">
        <a href="#inicio">
          <span className="i">⌂</span>
          <span>Início</span>
        </a>
        <a href="#loja">
          <span className="i">✿</span>
          <span>Loja</span>
        </a>
        <a href="#atacado">
          <span className="i">◇</span>
          <span>Atacado</span>
        </a>
        <a
          href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="i">☏</span>
          <span>WhatsApp</span>
        </a>
        <button
          onClick={() => setIsCartOpen(true)}
          aria-label="Abrir carrinho"
        >
          <span className="i">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 4h2.4l2.1 10.2a1.6 1.6 0 0 0 1.6 1.3h8.1a1.6 1.6 0 0 0 1.6-1.2L20.4 8H6.1" />
              <circle cx="9.5" cy="19.5" r="1.4" />
              <circle cx="17" cy="19.5" r="1.4" />
            </svg>
          </span>
          <span>Carrinho</span>
          {totalItemsCount > 0 && <i>{totalItemsCount}</i>}
        </button>
      </nav>

      {/* Slide-out Cart Drawer */}
      <aside id="drawer" className={isCartOpen ? "open" : ""}>
        <div className="flex justify-between items-center mb-3">
          <h2>Seu carrinho</h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-2xl font-bold cursor-pointer bg-transparent border-0 text-gray-500 hover:text-black"
          >
            ×
          </button>
        </div>

        {/* Mode switcher in cart */}
        <div className="tabs mb-4">
          <button
            className={mode === "v" ? "on" : ""}
            onClick={() => setMode("v")}
          >
            Varejo (unitário)
          </button>
          <button
            className={mode === "a" ? "on" : ""}
            onClick={() => setMode("a")}
          >
            Atacado (mín. 5)
          </button>
        </div>

        {/* Cart items list */}
        <div className="divide-y divide-[var(--line)]">
          {Object.entries(cart).filter(([_, qty]) => qty > 0).length === 0 ? (
            <p className="tot py-6 text-center">Seu carrinho está vazio.</p>
          ) : (
            Object.entries(cart)
              .filter(([_, qty]) => qty > 0)
              .map(([idStr, qty]) => {
                const prod = INITIAL_PRODUCTS.find(
                  (p) => p.id === Number(idStr)
                );
                if (!prod) return null;
                const unitPrice = getProductPrice(prod);
                return (
                  <div key={prod.id} className="row">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-12 h-12 object-cover rounded"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <div>
                        <span className="font-semibold text-sm">{prod.name}</span>
                        <br />
                        <small className="text-[var(--wine)] font-bold">
                          {formatCurrency(unitPrice)} un.
                        </small>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(prod.id, -1)}
                        aria-label="Diminuir quantidade"
                      >
                        −
                      </button>
                      <span className="font-bold min-w-4 text-center">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(prod.id, 1)}
                        aria-label="Aumentar quantidade"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>

        {/* Wholesale minimum quantity alert */}
        {mode === "a" && totalItemsCount > 0 && totalItemsCount < 5 && (
          <div className="tot text-red-600 font-semibold my-2">
            ⚠️ O atacado exige no mínimo 5 peças no pedido (faltam{" "}
            {5 - totalItemsCount} peças).
          </div>
        )}

        {/* Shipping Section */}
        <div className="my-4 pt-3 border-t border-[var(--line)]">
          <label className="text-xs font-bold text-[var(--deep)] block mb-1">
            Calcular frete e prazo de entrega:
          </label>
          <div className="flex gap-2">
            <input
              placeholder="Digite o CEP (ex: 59000000)"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
              maxLength={9}
              inputMode="numeric"
            />
            <button
              className="btn btn-outline whitespace-nowrap text-xs px-3"
              onClick={handleCalculateShipping}
            >
              Calcular
            </button>
          </div>
          {shippingResult && (
            <div className="tot text-emerald-700 font-medium mt-1">
              ✓ Estimativa: <b>{formatCurrency(shippingResult.cost)}</b> (
              {shippingResult.days} dias úteis)
            </div>
          )}
        </div>

        {/* Payment Options */}
        <div className="my-3">
          <label className="text-xs font-bold text-[var(--deep)] block mb-1">
            Forma de pagamento:
          </label>
          <div className="tabs justify-start my-1">
            <button
              className={paymentMethod === "pix" ? "on" : ""}
              onClick={() => setPaymentMethod("pix")}
            >
              Pix / À vista ({mode === "a" ? "7%" : "5%"} OFF)
            </button>
            <button
              className={paymentMethod === "cc" ? "on" : ""}
              onClick={() => setPaymentMethod("cc")}
            >
              Cartão ({maxInstallments}x s/ juros)
            </button>
          </div>
        </div>

        {/* Summary totals */}
        <div className="tot bg-[var(--rose)] p-3 rounded my-3">
          <div>
            Subtotal: <b>{formatCurrency(cartSubtotal)}</b>
          </div>
          {discountValue > 0 && (
            <div className="text-emerald-700">
              Desconto à vista ({mode === "a" ? "7%" : "5%"}):{" "}
              <b>-{formatCurrency(discountValue)}</b>
            </div>
          )}
          <div>
            Frete: <b>{shippingResult ? formatCurrency(shippingCost) : "A calcular"}</b>
          </div>
          <div className="text-base mt-2 pt-2 border-t border-[var(--line)]">
            Total do pedido:{" "}
            <b className="text-[var(--wine)] text-lg">
              {formatCurrency(cartFinalTotal)}
            </b>
          </div>
          {paymentMethod === "cc" && cartFinalTotal > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              ou até {maxInstallments}x de{" "}
              <b>{formatCurrency(cartFinalTotal / maxInstallments)}</b> sem
              juros
            </div>
          )}
        </div>

        {/* Finalize order button */}
        <button
          className="btn btn-yellow w-full py-3 text-sm"
          onClick={handleCheckout}
        >
          Finalizar pedido no WhatsApp
        </button>

        <p className="tot text-[0.7rem] text-center mt-3">
          Seu pedido é enviado para confirmação direta com a nossa equipe via
          WhatsApp oficial.
        </p>
      </aside>

      {/* Backdrop for Cart Drawer */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Floating WhatsApp Quick Action */}
      <div className="quick-floating">
        <a
          href={`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
            "Olá! Vim pelo site da LAUDINÉIA e gostaria de atendimento."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Atendimento rápido no WhatsApp"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.63c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.98-.14.17-.29.18-.54.06-.25-.13-1.06-.39-2.01-1.24-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.44.54.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.18-.48-.31" />
          </svg>
          <span>Falar no WhatsApp</span>
        </a>
      </div>

      {/* Cookies Consent Banner */}
      {cookieConsent === null && (
        <div
          id="ck"
          style={{ display: "block" }}
          className="fixed left-3 right-3 bottom-20 z-50 bg-white border border-[var(--wine)] p-4 shadow-2xl rounded-lg max-w-lg mx-auto"
        >
          <b>Cookies & Privacidade</b>
          <br />
          <span className="text-xs text-[var(--muted)]">
            Usamos cookies para lembrar seu carrinho, preferências de atacado e
            agilizar seu atendimento.
          </span>
          <div className="cta-row mt-3 justify-start gap-2">
            <button
              className="btn btn-yellow text-xs py-2 px-4"
              onClick={() => {
                setCookieConsent(1);
                try {
                  localStorage.setItem("ls_cookies", "1");
                } catch {}
              }}
            >
              Aceitar todos
            </button>
            <button
              className="btn btn-outline text-xs py-2 px-4"
              onClick={() => {
                setCookieConsent(0);
                try {
                  localStorage.setItem("ls_cookies", "0");
                } catch {}
              }}
            >
              Só essenciais
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
