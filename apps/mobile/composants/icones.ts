// Icônes 3D Bogolan (design/icons/bogolan/png, D-018). Metro exige des require statiques.
export const ICONES = {
  home: require('../../../design/icons/bogolan/png/home.png'),
  cart: require('../../../design/icons/bogolan/png/cart.png'),
  warehouse: require('../../../design/icons/bogolan/png/warehouse.png'),
  wallet: require('../../../design/icons/bogolan/png/wallet.png'),
  user: require('../../../design/icons/bogolan/png/user.png'),
  chat: require('../../../design/icons/bogolan/png/chat.png'),
  link: require('../../../design/icons/bogolan/png/link.png'),
  camera: require('../../../design/icons/bogolan/png/camera.png'),
  deal: require('../../../design/icons/bogolan/png/deal.png'),
  search: require('../../../design/icons/bogolan/png/search.png'),
  gift: require('../../../design/icons/bogolan/png/gift.png'),
  bientot: require('../../../design/icons/bogolan/png/bientot.png'),
  box: require('../../../design/icons/bogolan/png/box.png'),
  recharge: require('../../../design/icons/bogolan/png/recharge.png'),
} as const;

export type NomIcone = keyof typeof ICONES;
