import { addons } from '@storybook/addons'
import { DOCS_RENDERED } from '@storybook/core-events'

/**
 * Workaround to hide the dark logo from the `README.md` when rendered in Storybook.
 */
addons.register('hide-dark-logo', () => {
    addons.getChannel().on(DOCS_RENDERED, () => {
        const darkLogoElement = document
            .querySelector('#storybook-preview-iframe')
            .contentWindow.document.querySelector('source[srcset*="logo-dark"]')

        darkLogoElement.parentNode.removeChild(darkLogoElement)
    })
})
