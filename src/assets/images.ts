import heroBurgerImg from './images/hero_smash_burger_1794201940251.jpg';
import crispyChickenImg from './images/crispy_chicken_burger_1794201940611.jpg';
import avocadoBaconImg from './images/avocado_bacon_burger_1794229258158.jpg';
import craftComboImg from './images/craft_burger_combo_1794201941193.jpg';
import loadedFriesImg from './images/loaded_cheese_fries_1794201941317.jpg';
import burgerTeamLogoImg from './images/burger_team_logo_1794230003919.jpg';

export const APP_IMAGES = {
  logo: burgerTeamLogoImg,
  heroBurger: heroBurgerImg,
  crispyChicken: crispyChickenImg,
  avocadoBacon: avocadoBaconImg,
  craftCombo: craftComboImg,
  loadedFries: loadedFriesImg,
};

/**
 * Returns a bundled, guaranteed-valid image URL based on category and code
 */
export const getItemImage = (category?: string, code?: string, userImage?: string): string => {
  // If user uploaded a valid data URL or blob
  if (userImage && (userImage.startsWith('data:') || userImage.startsWith('blob:') || userImage.startsWith('http'))) {
    return userImage;
  }

  if (category === 'burgers') {
    if (code === 'B-02' || code === 'B-04' || code === 'B-05' || code === 'B-07' || code === 'B-09') {
      return APP_IMAGES.crispyChicken;
    }
    if (code === 'B-06' || code === 'B-08' || code === 'B-10' || code === 'B-11') {
      return APP_IMAGES.avocadoBacon;
    }
    return APP_IMAGES.heroBurger;
  }

  if (category === 'sides') {
    return APP_IMAGES.loadedFries;
  }

  return APP_IMAGES.craftCombo;
};
