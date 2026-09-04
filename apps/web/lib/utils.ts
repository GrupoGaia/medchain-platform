import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// O tailwind-merge só conhece a escala padrão do Tailwind. Os papéis
// tipográficos do MedChain (`text-body`, `text-caption`, ...) não estão nela,
// então ele os classificava como cor de texto e descartava o tamanho sempre que
// a mesma chamada trazia uma cor — `cn("text-caption", "text-warning")` perdia
// o `text-caption` inteiro. Registrar os grupos abaixo é o que mantém tamanho e
// cor como decisões independentes.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display",
            "page-title",
            "section-title",
            "card-title",
            "body",
            "body-sm",
            "label",
            "caption",
            "overline",
          ],
        },
      ],
      shadow: [{ shadow: ["surface", "floating", "modal"] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
