import { addons } from '@storybook/addons'
import { DOCS_RENDERED, STORY_RENDERED } from '@storybook/core-events'

let isSidebarExpanded = false

/**
 * Workaround to expand all sidebar nested categories on first render.
 */
addons.register('expand-sidebar', (api) => {
    const emitter = addons.getChannel()

    const storybookLoaded = () => {
        if (!isSidebarExpanded) {
            setTimeout(api.expandAll)
            isSidebarExpanded = true
        }
    }

    emitter.on(DOCS_RENDERED, storybookLoaded)
    emitter.on(STORY_RENDERED, storybookLoaded)
})
