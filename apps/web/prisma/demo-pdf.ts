export type DemoPdfInput = {
  title: string;
  patientName: string;
  type: "EXAM" | "REPORT" | "PRESCRIPTION" | "IMAGING";
  issuedAt: Date;
};

const TYPE_LABEL: Record<DemoPdfInput["type"], string> = {
  EXAM: "Exame",
  REPORT: "Laudo",
  PRESCRIPTION: "Receita",
  IMAGING: "Exame de imagem",
};

// PDF WinAnsi (latin-1) e nao UTF-8: a codificação final em Buffer.from(pdf, "latin1")
// mapeia cada caractere acentuado (ex.: é = U+00E9) direto para o byte 0xE9,
// que é o valor correto em WinAnsiEncoding. Aqui só escapamos os caracteres
// reservados do PDF.
function escapePdfText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function formatDate(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

// PDF minimo escrito na mao, sem dependencia externa: um objeto de pagina,
// uma fonte Helvetica com WinAnsiEncoding, e um content stream com as linhas
// do documento. So existe para a demo ter arquivo de verdade para abrir.
export function buildDemoPdf(input: DemoPdfInput): Buffer {
  const lines = [
    `MedChain - ${escapePdfText(TYPE_LABEL[input.type])}`,
    escapePdfText(input.title),
    `Paciente: ${escapePdfText(input.patientName)}`,
    `Emitido em: ${formatDate(input.issuedAt)}`,
    "Documento fictício gerado para fins de demonstração acadêmica.",
  ];

  const contentLines = lines
    .map((line, index) => {
      const y = 760 - index * 28;
      const size = index === 0 ? 18 : 12;
      return `BT /F1 ${size} Tf 72 ${y} Td (${line}) Tj ET`;
    })
    .join("\n");

  const objects: string[] = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  objects.push(
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>"
  );
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  objects.push(`<< /Length ${Buffer.byteLength(contentLines, "latin1")} >>\nstream\n${contentLines}\nendstream`);

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];

  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "latin1");
}
