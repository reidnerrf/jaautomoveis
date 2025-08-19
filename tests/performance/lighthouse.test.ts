import lighthouse from "lighthouse";
import chromeLauncher from "chrome-launcher";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

interface LighthouseConfig {
  extends: "lighthouse:default";
  settings: {
    onlyCategories: string[];
    formFactor: "desktop" | "mobile";
    throttling: {
      rttMs: number;
      throughputKbps: number;
      cpuSlowdownMultiplier: number;
      requestLatencyMs: number;
      downloadThroughputKbps: number;
      uploadThroughputKbps: number;
    };
  };
}

interface PerformanceThresholds {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

class PerformanceTester {
  private thresholds: PerformanceThresholds = {
    performance: 90,
    accessibility: 95,
    bestPractices: 90,
    seo: 95,
    firstContentfulPaint: 1500,
    largestContentfulPaint: 2500,
    cumulativeLayoutShift: 0.1,
    firstInputDelay: 100,
  };

  private baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";

  async runLighthouseTest(
    url: string,
    device: "desktop" | "mobile" = "desktop",
  ) {
    const chrome = await chromeLauncher.launch({
      chromeFlags: ["--headless", "--no-sandbox", "--disable-gpu"],
    });

    const config: LighthouseConfig = {
      extends: "lighthouse:default",
      settings: {
        onlyCategories: [
          "performance",
          "accessibility",
          "best-practices",
          "seo",
        ],
        formFactor: device,
        throttling:
          device === "mobile"
            ? {
                rttMs: 40,
                throughputKbps: 10240,
                cpuSlowdownMultiplier: 1,
                requestLatencyMs: 0,
                downloadThroughputKbps: 0,
                uploadThroughputKbps: 0,
              }
            : {
                rttMs: 40,
                throughputKbps: 10240,
                cpuSlowdownMultiplier: 1,
                requestLatencyMs: 0,
                downloadThroughputKbps: 0,
                uploadThroughputKbps: 0,
              },
      },
    };

    try {
      const runnerResult = await lighthouse(
        url,
        {
          port: chrome.port,
          output: "json",
          logLevel: "info",
        },
        config,
      );

      const report = runnerResult.lhr;

      // Salvar relatório
      this.saveReport(report, url, device);

      // Validar métricas
      const results = this.validateMetrics(report);

      await chrome.kill();

      return {
        url,
        device,
        scores: {
          performance: Math.round(report.categories.performance.score * 100),
          accessibility: Math.round(
            report.categories.accessibility.score * 100,
          ),
          bestPractices: Math.round(
            report.categories["best-practices"].score * 100,
          ),
          seo: Math.round(report.categories.seo.score * 100),
        },
        metrics: {
          firstContentfulPaint:
            report.audits["first-contentful-paint"].numericValue,
          largestContentfulPaint:
            report.audits["largest-contentful-paint"].numericValue,
          cumulativeLayoutShift:
            report.audits["cumulative-layout-shift"].numericValue,
          firstInputDelay: report.audits["max-potential-fid"].numericValue,
        },
        passed: results.every((r) => r.passed),
        failures: results.filter((r) => !r.passed),
      };
    } catch (error) {
      await chrome.kill();
      throw error;
    }
  }

  private validateMetrics(report: any) {
    const results = [];

    // Validar scores
    const categories = [
      "performance",
      "accessibility",
      "best-practices",
      "seo",
    ];
    categories.forEach((category) => {
      const score = Math.round(report.categories[category].score * 100);
      const threshold =
        this.thresholds[category as keyof PerformanceThresholds];
      results.push({
        metric: `${category} score`,
        value: score,
        threshold,
        passed: score >= threshold,
      });
    });

    // Validar Core Web Vitals
    const fcp = report.audits["first-contentful-paint"].numericValue;
    results.push({
      metric: "First Contentful Paint",
      value: fcp,
      threshold: this.thresholds.firstContentfulPaint,
      passed: fcp <= this.thresholds.firstContentfulPaint,
    });

    const lcp = report.audits["largest-contentful-paint"].numericValue;
    results.push({
      metric: "Largest Contentful Paint",
      value: lcp,
      threshold: this.thresholds.largestContentfulPaint,
      passed: lcp <= this.thresholds.largestContentfulPaint,
    });

    const cls = report.audits["cumulative-layout-shift"].numericValue;
    results.push({
      metric: "Cumulative Layout Shift",
      value: cls,
      threshold: this.thresholds.cumulativeLayoutShift,
      passed: cls <= this.thresholds.cumulativeLayoutShift,
    });

    const fid = report.audits["max-potential-fid"].numericValue;
    results.push({
      metric: "First Input Delay",
      value: fid,
      threshold: this.thresholds.firstInputDelay,
      passed: fid <= this.thresholds.firstInputDelay,
    });

    return results;
  }

  private saveReport(report: any, url: string, device: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `lighthouse-${device}-${timestamp}.json`;
    const dir = join(process.cwd(), "reports", "lighthouse");

    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, filename), JSON.stringify(report, null, 2));
      console.log(`Lighthouse report saved: ${filename}`);
    } catch (error) {
      console.error("Error saving lighthouse report:", error);
    }
  }

  async runFullPerformanceTest() {
    const pages = [
      "/",
      "/inventory",
      "/about",
      "/contact",
      "/financing",
      "/consortium",
    ];

    const results = [];

    for (const page of pages) {
      const url = `${this.baseUrl}${page}`;

      // Teste desktop
      const desktopResult = await this.runLighthouseTest(url, "desktop");
      results.push(desktopResult);

      // Teste mobile
      const mobileResult = await this.runLighthouseTest(url, "mobile");
      results.push(mobileResult);
    }

    return results;
  }

  setThresholds(thresholds: Partial<PerformanceThresholds>) {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }
}

export const performanceTester = new PerformanceTester();

// Função para executar testes de performance
export const runPerformanceTests = async () => {
  console.log("🚀 Starting performance tests...");

  try {
    const results = await performanceTester.runFullPerformanceTest();

    console.log("\n📊 Performance Test Results:");
    console.log("============================");

    let allPassed = true;

    results.forEach((result) => {
      console.log(`\n${result.device.toUpperCase()} - ${result.url}`);
      console.log(`Performance: ${result.scores.performance}/100`);
      console.log(`Accessibility: ${result.scores.accessibility}/100`);
      console.log(`Best Practices: ${result.scores.bestPractices}/100`);
      console.log(`SEO: ${result.scores.seo}/100`);

      if (!result.passed) {
        allPassed = false;
        console.log("❌ FAILED - Thresholds not met:");
        result.failures.forEach((failure) => {
          console.log(
            `  - ${failure.metric}: ${failure.value} (threshold: ${failure.threshold})`,
          );
        });
      } else {
        console.log("✅ PASSED");
      }
    });

    if (allPassed) {
      console.log("\n🎉 All performance tests passed!");
    } else {
      console.log(
        "\n⚠️  Some performance tests failed. Check the results above.",
      );
      process.exit(1);
    }

    return results;
  } catch (error) {
    console.error("❌ Performance tests failed:", error);
    process.exit(1);
  }
};

export default performanceTester;
