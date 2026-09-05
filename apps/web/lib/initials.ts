/**
 * Iniciais para o avatar: primeira letra do primeiro nome e do último.
 *
 * Vive aqui, e não junto do componente que a usa, porque o `UserMenu` é um
 * client component. Exportar a função de lá fazia o Next tratá-la como
 * referência de cliente, e chamá-la de um server component quebrava a página
 * em tempo de execução — o build e o typecheck não pegam esse caso.
 */
export function initialsFrom(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}
