export const exportPdf = async (element: HTMLElement, filename: string) => {
  if (typeof window === 'undefined') return; // SSR check
  if (!element) return;

  const html2pdf = (await import('html2pdf.js')).default;

  html2pdf()
    .set({
      margin: 0.5,
      filename: `${filename}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    })
    .from(element)
    .save();
};
