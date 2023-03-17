# Serializers

Unfortunately, Tiptap doesn't support Markdown as an input or output format, and while support for Markdown was considered, the Tiptap team decided against it (more information [here](https://tiptap.dev/guide/output#not-an-option-markdown)). However, at Doist, Markdown is a must, and that's why we implemented both an HTML and Markdown serializer to convert between both formats.

Although the serializers are mostly meant to be used internally by the `TypistEditor` component and/or internal extensions, it's sometimes useful to have access to the same serializers externally for custom extensions. With that in mind, the `create*Serializer` and `get*Serializer` methods are publicly exported for both the HTML and Markdown serializers.

## `get*Serializer`

This function is the one everyone should be using most of the time because once a serializer is created for the first time, it will be cached and reused the next time this function is called. You shouldn't worry about using this function for multiple editors loaded with different extensions because the cache mechanism caches multiple serializers based on the given editor `schema`.

## `create*Serializer`

This function is the one that actually creates the serializer instance, and while it's used internally by the `get*Serializer` function, it's also available for public comsumption in the event of a very specific use case where it might be useful. Most of the time you should not need to call this function directly, but you should know that a new serializer instance will be created every time you do call this function directly, and you may incur in a small performance penalty.
