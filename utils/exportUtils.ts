import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Tipos para exportação
export interface VehicleExportData {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  price: number;
  cost?: number;
  status: string;
  fuel: string;
  transmission: string;
  mileage: number;
  color: string;
  description?: string;
  createdAt: string;
}

export interface SellerExportData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  active: boolean;
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  createdAt: string;
}

/**
 * Exporta dados de veículos para Excel
 */
export const exportVehiclesToExcel = (
  vehicles: VehicleExportData[],
  filename: string = "veiculos_disponiveis.xlsx"
) => {
  try {
    // Filtrar apenas veículos disponíveis
    const availableVehicles = vehicles.filter((vehicle) => vehicle.status === "disponivel");

    // Preparar dados para exportação
    const exportData = availableVehicles.map((vehicle) => ({
      ID: vehicle.id,
      Nome: vehicle.name,
      Marca: vehicle.make,
      Modelo: vehicle.model,
      Ano: vehicle.year,
      Preço: vehicle.price,
      Custo: vehicle.cost || 0,
      Lucro: vehicle.cost ? vehicle.price - vehicle.cost : 0,
      Status: vehicle.status,
      Combustível: vehicle.fuel,
      Transmissão: vehicle.transmission,
      Quilometragem: vehicle.mileage,
      Cor: vehicle.color,
      Descrição: vehicle.description || "",
      "Data de Criação": new Date(vehicle.createdAt).toLocaleDateString("pt-BR"),
    }));

    // Criar workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Configurar largura das colunas
    const colWidths = [
      { wch: 10 }, // ID
      { wch: 25 }, // Nome
      { wch: 15 }, // Marca
      { wch: 20 }, // Modelo
      { wch: 8 }, // Ano
      { wch: 15 }, // Preço
      { wch: 15 }, // Custo
      { wch: 15 }, // Lucro
      { wch: 12 }, // Status
      { wch: 12 }, // Combustível
      { wch: 12 }, // Transmissão
      { wch: 12 }, // Quilometragem
      { wch: 12 }, // Cor
      { wch: 30 }, // Descrição
      { wch: 15 }, // Data de Criação
    ];
    ws["!cols"] = colWidths;

    // Adicionar planilha ao workbook
    XLSX.utils.book_append_sheet(wb, ws, "Veículos Disponíveis");

    // Gerar e baixar arquivo
    XLSX.writeFile(wb, filename);

    return { success: true, message: `Arquivo ${filename} exportado com sucesso!` };
  } catch (error) {
    console.error("Erro ao exportar veículos para Excel:", error);
    return { success: false, message: "Erro ao exportar arquivo Excel" };
  }
};

/**
 * Exporta dados de vendedores para Excel
 */
export const exportSellersToExcel = (
  sellers: SellerExportData[],
  filename: string = "vendedores.xlsx"
) => {
  try {
    const exportData = sellers.map((seller) => ({
      ID: seller.id,
      Nome: seller.name,
      Email: seller.email || "",
      Telefone: seller.phone || "",
      Status: seller.active ? "Ativo" : "Inativo",
      "Total de Vendas": seller.totalSales,
      "Receita Total": seller.totalRevenue,
      "Lucro Total": seller.totalProfit,
      "Data de Criação": new Date(seller.createdAt).toLocaleDateString("pt-BR"),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    const colWidths = [
      { wch: 10 }, // ID
      { wch: 25 }, // Nome
      { wch: 25 }, // Email
      { wch: 15 }, // Telefone
      { wch: 10 }, // Status
      { wch: 15 }, // Total de Vendas
      { wch: 15 }, // Receita Total
      { wch: 15 }, // Lucro Total
      { wch: 15 }, // Data de Criação
    ];
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Vendedores");
    XLSX.writeFile(wb, filename);

    return { success: true, message: `Arquivo ${filename} exportado com sucesso!` };
  } catch (error) {
    console.error("Erro ao exportar vendedores para Excel:", error);
    return { success: false, message: "Erro ao exportar arquivo Excel" };
  }
};

/**
 * Exporta um elemento HTML (gráfico) para PDF
 */
export const exportChartToPDF = async (
  elementId: string,
  filename: string = "grafico.pdf",
  title: string = "Gráfico"
) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Elemento com ID ${elementId} não encontrado`);
    }

    // Capturar o elemento como canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    });

    // Criar PDF
    const pdf = new jsPDF("landscape", "mm", "a4");
    const imgWidth = 297; // A4 width in mm
    const pageHeight = 210; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    // Adicionar título
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text(title, 20, 20);

    // Adicionar data
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      `Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
      20,
      30
    );

    let position = 40;

    // Adicionar imagem
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Adicionar novas páginas se necessário
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Baixar PDF
    pdf.save(filename);

    return { success: true, message: `Arquivo ${filename} exportado com sucesso!` };
  } catch (error) {
    console.error("Erro ao exportar gráfico para PDF:", error);
    return { success: false, message: "Erro ao exportar arquivo PDF" };
  }
};

/**
 * Exporta múltiplos gráficos em um único PDF
 */
export const exportMultipleChartsToPDF = async (
  charts: Array<{ elementId: string; title: string }>,
  filename: string = "relatorio_graficos.pdf"
) => {
  try {
    const pdf = new jsPDF("landscape", "mm", "a4");
    let isFirstPage = true;

    for (const chart of charts) {
      const element = document.getElementById(chart.elementId);
      if (!element) continue;

      if (!isFirstPage) {
        pdf.addPage();
      }

      // Capturar elemento
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      // Adicionar título
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(chart.title, 20, 20);

      // Adicionar data
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
        20,
        30
      );

      // Adicionar gráfico
      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL("image/png");

      pdf.addImage(imgData, "PNG", 0, 40, imgWidth, imgHeight);

      isFirstPage = false;
    }

    pdf.save(filename);

    return { success: true, message: `Arquivo ${filename} exportado com sucesso!` };
  } catch (error) {
    console.error("Erro ao exportar múltiplos gráficos para PDF:", error);
    return { success: false, message: "Erro ao exportar arquivo PDF" };
  }
};

/**
 * Exporta a página inteira (body) para PDF, paginando até o final
 */
export const exportFullPageToPDF = async (
  filename: string = "dashboard_completo.pdf",
  title: string = "Dashboard Completo",
  elementId?: string
) => {
  try {
    const target = elementId ? document.getElementById(elementId) : document.documentElement;
    if (!target) {
      throw new Error("Elemento alvo não encontrado para exportação");
    }

    // Capturar toda a página com escala maior para melhor qualidade
    const contentWidth = (target as HTMLElement).scrollWidth;
    const contentHeight = (target as HTMLElement).scrollHeight;
    const canvas = await html2canvas(target as HTMLElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: contentWidth,
      height: contentHeight,
      windowWidth: contentWidth,
      windowHeight: contentHeight,
      scrollX: -window.scrollX,
      scrollY: -window.scrollY,
    });

    // PDF em orientação retrato A4
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 210; // A4 retrato
    const pageHeight = 297; // A4 retrato
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight - (pageHeight - 28);

    // Cabeçalho
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(title, 14, 16);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      `Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
      14,
      22
    );

    // Início da imagem abaixo do cabeçalho
    let position = 28;
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

    // Paginação
    while (heightLeft > 0) {
      pdf.addPage();
      position = 0;
      const y = position - (imgHeight - (pageHeight - 28) - heightLeft);
      pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
    return { success: true, message: `Arquivo ${filename} exportado com sucesso!` };
  } catch (error) {
    console.error("Erro ao exportar página completa para PDF:", error);
    return { success: false, message: "Erro ao exportar arquivo PDF" };
  }
};

/**
 * Formata valor monetário para exibição
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

/**
 * Formata data para exibição
 */
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("pt-BR");
};
