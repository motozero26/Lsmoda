# LAUDINÉIA · Moda Feminina · Atacado e Varejo

Site e loja virtual moderna, rápida e responsiva para a **LAUDINÉIA Moda Feminina**, pronta para produção e importação para o **GitHub**.

---

## 🌟 Principais Funcionalidades

- **Duplo Modo de Compra (Atacado & Varejo):**
  - **Varejo:** Compra de peças unitárias, parcelamento em até 6x sem juros e 5% de desconto à vista no Pix.
  - **Atacado:** Mínimo de 5 peças por pedido, preços reduzidos para revenda, parcelamento em até 3x sem juros e 7% de desconto à vista no Pix.
- **Carrinho Lateral Completo (Drawer):**
  - Controle de quantidades em tempo real (`+` e `−`).
  - Alerta dinâmico de quantidade mínima para atacado.
  - Cálculo instantâneo de frete por CEP baseado nas faixas de entrega dos Correios/Transportadoras brasileiras.
  - Seleção de forma de pagamento (Pix/À vista com desconto vs. Cartão de crédito parcelado).
  - Botão de checkout que formata todo o pedido detalhadamente e envia direto para o **WhatsApp oficial da loja**.
- **Área do Lojista (Captação de Leads):**
  - Formulário para solicitação de catálogo e tabela de atacado.
  - Salvamento local no navegador (`localStorage`) e envio das informações para o WhatsApp.
- **Carrossel de Avaliações Google:**
  - Depoimentos reais de clientes com estrelas, transição suave e links diretos para a ficha no Google Maps.
- **Barra de Navegação Inferior para Celulares (`#fbar`):**
  - Acesso rápido ao Início, Loja, Atacado, WhatsApp e Carrinho com contador numérico de itens.
- **Botão Flutuante de WhatsApp:**
  - Atendimento com mensagem pré-configurada para fácil contato.
- **Banner de Consentimento de Cookies:**
  - Em conformidade com boas práticas de privacidade (LGPD).

---

## 🚀 Tecnologias Utilizadas

- **React 19** + **TypeScript**
- **Vite 8** (Build veloz e otimizado)
- **Tailwind CSS 4** (Design limpo, responsivo e elegante)
- **Design sob medida** com paleta oficial da marca:
  - Vinho (`#b57a78`)
  - Ouro rosé / Caramelo (`#c99a84`)
  - Marrom profundo (`#5a3f3e`)
  - Branco e Rosé suave (`#fff8f8`)

---

## 📦 Como Rodar Localmente

### 1. Clonar o repositório
```bash
git clone https://github.com/SEU_USUARIO/laudineia-moda-feminina.git
cd laudineia-moda-feminina
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```
Abra no navegador em `http://localhost:3000` (ou na porta indicada no terminal).

### 4. Gerar build de produção
```bash
npm run build
```
Os arquivos otimizados para produção serão gerados na pasta `dist/`.

---

## 🌐 Como Publicar na Vercel (Passo a Passo)

O projeto já possui o arquivo `vercel.json` configurado com regras de rewrite para Single Page Application (SPA) e cabeçalhos de cache otimizados.

### Método 1: Pelo Painel da Vercel com GitHub (Recomendado)
1. Acesse [vercel.com](https://vercel.com) e faça login (pode usar sua conta do GitHub).
2. Clique no botão **"Add New..."** e selecione **"Project"**.
3. Na lista de repositórios do seu GitHub, encontre e clique em **"Import"** no repositório `laudineia-moda-feminina`.
4. As configurações de build serão detectadas automaticamente:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Clique em **"Deploy"**.
6. Em menos de 1 minuto, seu site estará no ar com domínio grátis HTTPS (exemplo: `laudineia-moda-feminina.vercel.app`) e atualizações automáticas a cada novo `git push`!

### Método 2: Pelo Terminal via Vercel CLI
Se preferir publicar diretamente pela linha de comando:
```bash
# 1. Instalar a CLI da Vercel globalmente
npm i -g vercel

# 2. Fazer o deploy
vercel

# 3. Para enviar direto para produção
vercel --prod
```

---

## 🌐 Outras Opções de Publicação

### Opção: Netlify
1. Crie uma conta em [netlify.com](https://netlify.com).
2. Conecte com o GitHub e selecione o repositório.
3. Build command: `npm run build` | Publish directory: `dist`.

### Opção: GitHub Pages
1. Em **Settings > Pages** do seu repositório no GitHub, selecione a fonte como **GitHub Actions**. O arquivo `.github/workflows/deploy.yml` já está configurado.

---

## ⚙️ Como Personalizar os Dados da Loja

Todos os produtos, dados de contato e informações comerciais estão centralizados em:
📁 `src/data/storeData.ts`

- **Telefone / WhatsApp:** Altere `STORE_CONFIG.whatsappNumber` e `STORE_CONFIG.whatsappFormatted`.
- **Instagram e Google Maps:** Altere `STORE_CONFIG.instagramUrl` e `STORE_CONFIG.googleMapsUrl`.
- **Catálogo de Produtos:** Adicione, remova ou edite nomes, categorias e preços de atacado/varejo na lista `INITIAL_PRODUCTS`.
- **Avaliações do Google:** Atualize os depoimentos na lista `INITIAL_REVIEWS`.

---

## 📄 Licença

Distribuído sob a licença Apache-2.0.
© 2026 LAUDINÉIA Moda Feminina. Todos os direitos reservados.
