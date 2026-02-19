import { addons } from 'storybook/manager-api'
import { STORIES_EXPAND_ALL, DOCS_RENDERED, STORY_RENDERED } from 'storybook/internal/core-events'

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
