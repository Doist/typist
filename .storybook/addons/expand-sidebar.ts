import { DOCS_RENDERED, STORIES_EXPAND_ALL, STORY_RENDERED } from 'storybook/internal/core-events'
import { addons } from 'storybook/manager-api'

let isSidebarExpanded = false

addons.register('expand-sidebar', (api) => {
    const emitter = addons.getChannel()

    const storybookLoaded = () => {
        if (!isSidebarExpanded) {
            setTimeout(() => {
                api.emit(STORIES_EXPAND_ALL)
                isSidebarExpanded = true
            }, 0)
        }
    }

    emitter.on(DOCS_RENDERED, storybookLoaded)
    emitter.on(STORY_RENDERED, storybookLoaded)
})
