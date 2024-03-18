import { addons } from '@storybook/manager-api'
import { DOCS_RENDERED, STORY_RENDERED, STORIES_EXPAND_ALL } from '@storybook/core-events'

let isSidebarExpanded = false

/**
 * Workaround to expand all sidebar nested categories on first render.
 */
addons.register('expand-sidebar', (api) => {
    const emitter = addons.getChannel()

    const storybookLoaded = () => {
        if (!isSidebarExpanded) {
            setTimeout(() => {
                api.emit(STORIES_EXPAND_ALL)
                isSidebarExpanded = true
            })
        }
    }

    emitter.on(DOCS_RENDERED, storybookLoaded)
    emitter.on(STORY_RENDERED, storybookLoaded)
})
