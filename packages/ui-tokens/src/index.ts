export { colors, type Colors } from "./colors";
export {
  typography,
  fontFamily,
  type TypeStyle,
  type TypographyRole,
} from "./typography";
export { radius, shadow, spacing, motion } from "./layout";

// Compatibilidade: o nome antigo da escala de raio. Continua exportado para
// não quebrar quem já importava, mas o valor agora vem da escala contida.
export { radius as borderRadius } from "./layout";
