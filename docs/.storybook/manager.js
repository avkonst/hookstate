import { addons } from '@storybook/addons';
import yourTheme from './yourTheme';

addons.setConfig({
  theme: yourTheme,
  isToolshown: false,
  selectedPanel: 'docs',
  showPanel: false,
  enableShortcuts: true,
  showNav: true,
  panelPosition: 'bottom',
});