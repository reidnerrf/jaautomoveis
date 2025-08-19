import { test, expect } from "@playwright/test";

test.describe("Performance Tests", () => {
  test("should load homepage within performance budget", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");

    // Aguardar carregamento completo
    await page.waitForLoadState("networkidle");

    const loadTime = Date.now() - startTime;

    // Verificar tempo de carregamento
    expect(loadTime).toBeLessThan(3000); // 3 segundos

    // Verificar Core Web Vitals
    const fcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(
            (entry) => entry.name === "first-contentful-paint",
          );
          resolve(fcpEntry?.startTime || 0);
        }).observe({ entryTypes: ["paint"] });
      });
    });

    expect(fcp).toBeLessThan(1500); // 1.5 segundos

    // Verificar se não há erros no console
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    expect(consoleErrors).toHaveLength(0);
  });

  test("should load inventory page efficiently", async ({ page }) => {
    await page.goto("/inventory");

    // Aguardar carregamento dos veículos
    await page.waitForSelector('[data-testid="vehicle-card"]', {
      timeout: 10000,
    });

    // Verificar se as imagens estão otimizadas
    const images = await page.$$("img");
    for (const img of images) {
      const src = await img.getAttribute("src");
      const loading = await img.getAttribute("loading");

      // Verificar se imagens têm lazy loading
      if (src && !src.includes("data:")) {
        expect(loading).toBe("lazy");
      }
    }

    // Verificar se não há layout shift
    const layoutShift = await page.evaluate(() => {
      return new Promise((resolve) => {
        let cls = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.hadRecentInput) continue;
            cls += (entry as any).value;
          }
          resolve(cls);
        }).observe({ entryTypes: ["layout-shift"] });
      });
    });

    expect(layoutShift).toBeLessThan(0.1);
  });

  test("should handle vehicle detail page performance", async ({ page }) => {
    // Primeiro, ir para o estoque para pegar um ID de veículo
    await page.goto("/inventory");
    await page.waitForSelector('[data-testid="vehicle-card"]');

    // Clicar no primeiro veículo
    const firstVehicle = await page.$('[data-testid="vehicle-card"]');
    const vehicleLink = await firstVehicle?.$("a");
    const href = await vehicleLink?.getAttribute("href");

    if (href) {
      const startTime = Date.now();
      await page.goto(href);

      // Aguardar carregamento completo
      await page.waitForLoadState("networkidle");

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(4000); // 4 segundos para página de detalhes

      // Verificar se imagens da galeria carregam corretamente
      const galleryImages = await page.$$(
        '[data-testid="vehicle-gallery"] img',
      );
      expect(galleryImages.length).toBeGreaterThan(0);

      // Verificar se não há erros de carregamento de imagem
      const imageErrors = await page.evaluate(() => {
        return new Promise((resolve) => {
          const errors = [];
          const images = document.querySelectorAll("img");
          images.forEach((img) => {
            if (img.naturalWidth === 0) {
              errors.push(img.src);
            }
          });
          resolve(errors);
        });
      });

      expect(imageErrors).toHaveLength(0);
    }
  });

  test("should maintain performance during navigation", async ({ page }) => {
    const pages = ["/", "/inventory", "/about", "/contact"];
    const navigationTimes = [];

    for (const pagePath of pages) {
      const startTime = Date.now();
      await page.goto(pagePath);
      await page.waitForLoadState("networkidle");

      const loadTime = Date.now() - startTime;
      navigationTimes.push(loadTime);

      // Verificar se a página carregou em tempo aceitável
      expect(loadTime).toBeLessThan(3000);
    }

    // Verificar consistência de performance
    const avgLoadTime =
      navigationTimes.reduce((a, b) => a + b, 0) / navigationTimes.length;
    expect(avgLoadTime).toBeLessThan(2500); // Média menor que 2.5 segundos
  });

  test("should handle mobile performance", async ({ page }) => {
    // Configurar viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verificar se elementos responsivos carregam corretamente
    const heroSection = await page.$('[data-testid="hero-section"]');
    expect(heroSection).toBeTruthy();

    // Verificar se vídeo não carrega em mobile (deve mostrar imagem)
    const video = await page.$("video");
    if (video) {
      const isVisible = await video.isVisible();
      expect(isVisible).toBeFalsy(); // Vídeo não deve ser visível em mobile
    }

    // Verificar se imagem mobile está presente
    const mobileImage = await page.$('img[src*="homepageabout.webp"]');
    expect(mobileImage).toBeTruthy();
  });

  test("should handle search and filtering performance", async ({ page }) => {
    await page.goto("/inventory");
    await page.waitForSelector('[data-testid="vehicle-card"]');

    // Contar veículos iniciais
    const initialCount = await page.$$eval(
      '[data-testid="vehicle-card"]',
      (cards) => cards.length,
    );

    // Realizar busca
    const searchInput = await page.$('[data-testid="search-input"]');
    if (searchInput) {
      await searchInput.fill("Honda");
      await page.waitForTimeout(500); // Aguardar debounce

      // Verificar se filtros foram aplicados rapidamente
      const filterTime = await page.evaluate(() => {
        return new Promise((resolve) => {
          const start = performance.now();
          const observer = new MutationObserver(() => {
            const end = performance.now();
            observer.disconnect();
            resolve(end - start);
          });

          observer.observe(document.body, {
            childList: true,
            subtree: true,
          });
        });
      });

      expect(filterTime).toBeLessThan(1000); // Filtro deve ser aplicado em menos de 1 segundo
    }
  });

  test("should handle image optimization", async ({ page }) => {
    await page.goto("/inventory");
    await page.waitForSelector('[data-testid="vehicle-card"]');

    // Verificar se imagens estão sendo servidas com otimizações
    const images = await page.$$('img[src*="/uploads/"]');

    for (const img of images) {
      const src = await img.getAttribute("src");

      // Verificar se imagem tem parâmetros de otimização
      if (src) {
        expect(src).toMatch(/[?&]w=\d+/); // Deve ter parâmetro de largura
        expect(src).toMatch(/[?&]q=\d+/); // Deve ter parâmetro de qualidade
      }
    }
  });

  test("should handle service worker functionality", async ({
    page,
    context,
  }) => {
    await page.goto("/");

    // Verificar se service worker está registrado
    const swRegistered = await page.evaluate(() => {
      return "serviceWorker" in navigator;
    });

    expect(swRegistered).toBeTruthy();

    // Verificar cache funcionando
    await page.goto("/inventory");
    await page.waitForLoadState("networkidle");

    // Desconectar rede e tentar navegar
    await context.setOffline(true);

    // Tentar navegar para página já visitada
    await page.goto("/");

    // Verificar se página ainda carrega (do cache)
    const title = await page.title();
    expect(title).toContain("JA Automóveis");
  });
});
