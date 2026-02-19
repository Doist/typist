import './addons/expand-sidebar'

import { addons } from 'storybook/manager-api'

import { theme } from './themes'

addons.setConfig({
    navSize: 320,
    showToolbar: false,
    theme,
})
