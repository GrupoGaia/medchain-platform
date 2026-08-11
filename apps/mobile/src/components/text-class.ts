const WEIGHT_CLASS =
  /\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/;

/**
 * Decide se o texto precisa da classe base `font-sans`.
 *
 * Cada peso da Inter é uma família própria no tailwind.config, porque o React
 * Native não sintetiza negrito a partir de um arquivo só. O Tailwind emite as
 * famílias em ordem alfabética, então `.font-sans` sai depois de `.font-bold` e
 * venceria o empate de especificidade. Por isso a classe base só entra quando
 * quem chamou não escolheu um peso.
 */
export function resolveTextClassName(className?: string): string {
  const provided = className?.trim() ?? "";
  if (WEIGHT_CLASS.test(provided)) return provided;
  return provided ? `font-sans ${provided}` : "font-sans";
}
