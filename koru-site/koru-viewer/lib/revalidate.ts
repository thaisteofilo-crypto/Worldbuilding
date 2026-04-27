import { revalidatePath } from "next/cache"

// Invalida o cache de todas as páginas servidas pelo layout raiz.
// Chamar após qualquer mutação no admin (banners, card-images, characters,
// site-content, editor de MD, gallery) para que a edição apareça no público
// no próximo request, sem esperar redeploy.
export function revalidatePublicSite() {
  try {
    revalidatePath("/", "layout")
  } catch {
    // revalidatePath só funciona em route handlers/server actions; ignora
    // silenciosamente se chamada fora desse contexto.
  }
}
