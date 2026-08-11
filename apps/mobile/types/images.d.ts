// O expo/types não declara os módulos de imagem, então o import estático de um
// PNG não tem tipo. O Metro resolve o arquivo para um asset que o Image aceita.
declare module "*.png" {
  import type { ImageSourcePropType } from "react-native";
  const content: ImageSourcePropType;
  export default content;
}
