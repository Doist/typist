import { getSchema } from '@tiptap/core'
import { TaskItem } from '@tiptap/extension-task-item'
import { TaskList } from '@tiptap/extension-task-list'

import { PlainTextKit } from '../../extensions/plain-text/plain-text-kit'
import { RichTextKit } from '../../extensions/rich-text/rich-text-kit'
import { createSuggestionExtension } from '../../factories/create-suggestion-extension'

import { createHTMLSerializer } from './html'

import type { HTMLSerializerReturnType } from './html'

const MARKDOWN_INPUT_SPECIAL_HTML_CHARS = `Ambition & Balance
<doist>
</doist>
<doist></doist>
"Doist"
'Doist'`

const MARKDOWN_INPUT_HEADINGS = `# Heading level 1
## Heading level 2
### Heading level 3
#### Heading level 4
##### Heading level 5
###### Heading level 6`

const MARKDOWN_INPUT_PARAGRAPHS = `I really like using Markdown.

I think I'll use it to format all of my documents from now on.`

const MARKDOWN_INPUT_LINE_BREAKS = `This is the first line.
And this is the second line.`

const MARKDOWN_INPUT_STYLED_TEXT = `I just love **bold text**.
I just love __bold text__.

Italicized text is the *cat's meow*.
Italicized text is the _cat's meow_.

This text is ***really important***.
This text is ___really important___.
This text is __*really important*__.
This text is **_really important_**.
This is really ***very*** important text.

Strikethrough uses two tildes: ~~scratch this~~`

const MARKDOWN_INPUT_BLOCKQUOTES = `> Dorothy followed her through many of the beautiful rooms in her castle.

> Dorothy followed her through many of the beautiful rooms in her castle.
>
> The Witch bade her clean the pots and kettles and sweep the floor and keep the fire fed with wood.

> Dorothy followed her through many of the beautiful rooms in her castle.
>
> > The Witch bade her clean the pots and kettles and sweep the floor and keep the fire fed with wood.

> #### The quarterly results look great!
>
> - Revenue was off the chart.
> - Profits were higher than ever.
>
> *Everything* is going according to **plan**.`

const MARKDOWN_INPUT_ORDERED_LISTS = `1. First item
2. Second item
3. Third item
4. Fourth item

---

1. First item
1. Second item
1. Third item
1. Fourth item

---

1. First item
8. Second item
3. Third item
5. Fourth item

---

1. First item
2. Second item
3. Third item
    1. Indented item
    2. Indented item
4. Fourth item`

const MARKDOWN_INPUT_UNORDERED_LISTS = `- First item
- Second item
- Third item
- Fourth item

---

* First item
* Second item
* Third item
* Fourth item

---

+ First item
+ Second item
+ Third item
+ Fourth item

---

- First item
- Second item
- Third item
    - Indented item
    - Indented item
- Fourth item

---

- 1968\\. A great year!
- I think 1969 was second best.

---

* This is the first list item.
* Here's the second list item.
    I need to add another paragraph below the second list item.
* And here's the third list item.`

const MARKDOWN_INPUT_TASK_LISTS = `- [ ] First item
- [x] Second item
- [X] Third item
- [ ] Fourth item

---

* [x] First item
* [ ] Second item
* [ ] Third item
* [X] Fourth item

---

+ [X] First item
+ [ ] Second item
+ [x] Third item
+ [ ] Fourth item

---

- First item
- Second item
- Third item
    - [ ] Indented item
    - [ ] Indented item
- Fourth item

---

- [ ] 1968\\. A great year!
- [x] I think 1969 was second best.

---

* [ ] This is the first list item.
* [ ] Here's the second list item.
    I need to add another paragraph below the second list item.
* [ ] And here's the third list item.`

const MARKDOWN_INPUT_IMAGES = `![Octobi Wan Catnobi](https://octodex.github.com/images/octobiwan.jpg)

![](https://octodex.github.com/images/octobiwan.jpg)![](https://octodex.github.com/images/octobiwan.jpg)

![Octobi Wan Catnobi](https://octodex.github.com/images/octobiwan.jpg "Octobi Wan Catnobi")

[![Octobi Wan Catnobi](https://octodex.github.com/images/octobiwan.jpg "Octobi Wan Catnobi")](https://octodex.github.com/octobiwan/)

Octobi Wan Catnobi: ![](https://octodex.github.com/images/octobiwan.jpg)

Octobi Wan Catnobi: ![](https://octodex.github.com/images/octobiwan.jpg) - These are not the droids you're looking for!

![](https://octodex.github.com/images/octobiwan.jpg) - These are not the droids you're looking for!`

const MARKDOWN_INPUT_CODE = `At the command prompt, type \`nano\`.

\`\`Use \`code\` in your Markdown file.\`\``

const MARKDOWN_INPUT_CODE_BLOCK = `\`\`\`
<html>
  <head>
    <title>Test</title>
  </head>
</html>
\`\`\``

const MARKDOWN_INPUT_INDENTED_BLOCK_ELEMENTS = `1. Blockquote:
    > Dorothy followed her through many of the beautiful rooms in her castle.
2. Image:
    ![Octobi Wan Catnobi](https://octodex.github.com/images/octobiwan.jpg)
3. Codeblock:
    \`\`\`
    <html>
      <head>
        <title>Test</title>
      </head>
    </html>
    \`\`\``

const MARKDOWN_INPUT_LINE_RULES = `***

_________________

---`

const MARKDOWN_INPUT_LINKS = `My favorite search engine is [Duck Duck Go](https://duckduckgo.com).
My favorite search engine is [Duck Duck Go](https://duckduckgo.com "The best search engine for privacy").`

const MARKDOWN_INPUT_STYLED_LINKS = `I love supporting the **[EFF](https://eff.org)**.
This is the *[Markdown Guide](https://www.markdownguide.org)*.
See the section on [\`code\`](#code).`

describe('HTML Serializer', () => {
    describe('Plain-text Document', () => {
        describe('with default extensions', () => {
            let htmlSerializer: HTMLSerializerReturnType

            beforeEach(() => {
                htmlSerializer = createHTMLSerializer(getSchema([PlainTextKit]))
            })

            test('special ASCII characters are converted to HTML entities', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_SPECIAL_HTML_CHARS)).toBe(
                    '<p>Ambition &amp; Balance</p><p>&lt;doist&gt;</p><p>&lt;/doist&gt;</p><p>&lt;doist&gt;&lt;/doist&gt;</p><p>&quot;Doist&quot;</p><p>&#39;Doist&#39;</p>',
                )
            })

            test('headings syntax is preserved', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_HEADINGS)).toBe(
                    '<p># Heading level 1</p><p>## Heading level 2</p><p>### Heading level 3</p><p>#### Heading level 4</p><p>##### Heading level 5</p><p>###### Heading level 6</p>',
                )
            })

            test('paragraphs syntax is preserved', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_PARAGRAPHS)).toBe(
                    '<p>I really like using Markdown.</p><p></p><p>I think I&#39;ll use it to format all of my documents from now on.</p>',
                )
            })

            test('line breaks syntax is preserved', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_LINE_BREAKS)).toBe(
                    '<p>This is the first line.</p><p>And this is the second line.</p>',
                )
            })

            test('styled text syntax is preserved', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_STYLED_TEXT)).toBe(
                    '<p>I just love **bold text**.</p><p>I just love __bold text__.</p><p></p><p>Italicized text is the *cat&#39;s meow*.</p><p>Italicized text is the _cat&#39;s meow_.</p><p></p><p>This text is ***really important***.</p><p>This text is ___really important___.</p><p>This text is __*really important*__.</p><p>This text is **_really important_**.</p><p>This is really ***very*** important text.</p><p></p><p>Strikethrough uses two tildes: ~~scratch this~~</p>',
                )
            })

            test('blockquotes syntax is preserved', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_BLOCKQUOTES)).toBe(
                    '<p>&gt; Dorothy followed her through many of the beautiful rooms in her castle.</p><p></p><p>&gt; Dorothy followed her through many of the beautiful rooms in her castle.</p><p>&gt;</p><p>&gt; The Witch bade her clean the pots and kettles and sweep the floor and keep the fire fed with wood.</p><p></p><p>&gt; Dorothy followed her through many of the beautiful rooms in her castle.</p><p>&gt;</p><p>&gt; &gt; The Witch bade her clean the pots and kettles and sweep the floor and keep the fire fed with wood.</p><p></p><p>&gt; #### The quarterly results look great!</p><p>&gt;</p><p>&gt; - Revenue was off the chart.</p><p>&gt; - Profits were higher than ever.</p><p>&gt;</p><p>&gt; *Everything* is going according to **plan**.</p>',
                )
            })

            test('ordered lists syntax is preserved', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_ORDERED_LISTS)).toBe(
                    '<p>1. First item</p><p>2. Second item</p><p>3. Third item</p><p>4. Fourth item</p><p></p><p>---</p><p></p><p>1. First item</p><p>1. Second item</p><p>1. Third item</p><p>1. Fourth item</p><p></p><p>---</p><p></p><p>1. First item</p><p>8. Second item</p><p>3. Third item</p><p>5. Fourth item</p><p></p><p>---</p><p></p><p>1. First item</p><p>2. Second item</p><p>3. Third item</p><p>    1. Indented item</p><p>    2. Indented item</p><p>4. Fourth item</p>',
                )
            })

            test('unordered lists syntax is preserved', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_UNORDERED_LISTS)).toBe(
                    '<p>- First item</p><p>- Second item</p><p>- Third item</p><p>- Fourth item</p><p></p><p>---</p><p></p><p>* First item</p><p>* Second item</p><p>* Third item</p><p>* Fourth item</p><p></p><p>---</p><p></p><p>+ First item</p><p>+ Second item</p><p>+ Third item</p><p>+ Fourth item</p><p></p><p>---</p><p></p><p>- First item</p><p>- Second item</p><p>- Third item</p><p>    - Indented item</p><p>    - Indented item</p><p>- Fourth item</p><p></p><p>---</p><p></p><p>- 1968\\. A great year!</p><p>- I think 1969 was second best.</p><p></p><p>---</p><p></p><p>* This is the first list item.</p><p>* Here&#39;s the second list item.</p><p>    I need to add another paragraph below the second list item.</p><p>* And here&#39;s the third list item.</p>',
                )
            })

            test('tasks lists syntax is preserved', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_TASK_LISTS)).toBe(
                    '<p>- [ ] First item</p><p>- [x] Second item</p><p>- [X] Third item</p><p>- [ ] Fourth item</p><p></p><p>---</p><p></p><p>* [x] First item</p><p>* [ ] Second item</p><p>* [ ] Third item</p><p>* [X] Fourth item</p><p></p><p>---</p><p></p><p>+ [X] First item</p><p>+ [ ] Second item</p><p>+ [x] Third item</p><p>+ [ ] Fourth item</p><p></p><p>---</p><p></p><p>- First item</p><p>- Second item</p><p>- Third item</p><p>    - [ ] Indented item</p><p>    - [ ] Indented item</p><p>- Fourth item</p><p></p><p>---</p><p></p><p>- [ ] 1968\\. A great year!</p><p>- [x] I think 1969 was second best.</p><p></p><p>---</p><p></p><p>* [ ] This is the first list item.</p><p>* [ ] Here&#39;s the second list item.</p><p>    I need to add another paragraph below the second list item.</p><p>* [ ] And here&#39;s the third list item.</p>',
                )
            })

            test('images syntax is preserved', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_IMAGES)).toBe(
                    '<p>![Octobi Wan Catnobi](https://octodex.github.com/images/octobiwan.jpg)</p><p></p><p>![](https://octodex.github.com/images/octobiwan.jpg)![](https://octodex.github.com/images/octobiwan.jpg)</p><p></p><p>![Octobi Wan Catnobi](https://octodex.github.com/images/octobiwan.jpg &quot;Octobi Wan Catnobi&quot;)</p><p></p><p>[![Octobi Wan Catnobi](https://octodex.github.com/images/octobiwan.jpg &quot;Octobi Wan Catnobi&quot;)](https://octodex.github.com/octobiwan/)</p><p></p><p>Octobi Wan Catnobi: ![](https://octodex.github.com/images/octobiwan.jpg)</p><p></p><p>Octobi Wan Catnobi: ![](https://octodex.github.com/images/octobiwan.jpg) - These are not the droids you&#39;re looking for!</p><p></p><p>![](https://octodex.github.com/images/octobiwan.jpg) - These are not the droids you&#39;re looking for!</p>',
                )
            })

            test('code syntax is preserved', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_CODE)).toBe(
                    '<p>At the command prompt, type `nano`.</p><p></p><p>``Use `code` in your Markdown file.``</p>',
                )
            })

            test('code block syntax is preserved', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_CODE_BLOCK)).toBe(
                    '<p>```</p><p>&lt;html&gt;</p><p>  &lt;head&gt;</p><p>    &lt;title&gt;Test&lt;/title&gt;</p><p>  &lt;/head&gt;</p><p>&lt;/html&gt;</p><p>```</p>',
                )
            })

            test('indented block elements syntax is preserved', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_INDENTED_BLOCK_ELEMENTS)).toBe(
                    '<p>1. Blockquote:</p><p>    &gt; Dorothy followed her through many of the beautiful rooms in her castle.</p><p>2. Image:</p><p>    ![Octobi Wan Catnobi](https://octodex.github.com/images/octobiwan.jpg)</p><p>3. Codeblock:</p><p>    ```</p><p>    &lt;html&gt;</p><p>      &lt;head&gt;</p><p>        &lt;title&gt;Test&lt;/title&gt;</p><p>      &lt;/head&gt;</p><p>    &lt;/html&gt;</p><p>    ```</p>',
                )
            })

            test('line rules syntax is preserved', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_LINE_RULES)).toBe(
                    '<p>***</p><p></p><p>_________________</p><p></p><p>---</p>',
                )
            })

            test('links syntax is preserved', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_LINKS)).toBe(
                    '<p>My favorite search engine is [Duck Duck Go](https://duckduckgo.com).</p><p>My favorite search engine is [Duck Duck Go](https://duckduckgo.com &quot;The best search engine for privacy&quot;).</p>',
                )
            })

            test('styled links syntax is preserved', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_STYLED_LINKS)).toBe(
                    '<p>I love supporting the **[EFF](https://eff.org)**.</p><p>This is the *[Markdown Guide](https://www.markdownguide.org)*.</p><p>See the section on [`code`](#code).</p>',
                )
            })
        })

        describe('with custom `*Suggestion` extensions', () => {
            test('mention suggestion HTML output is correct', () => {
                const htmlSerializer = createHTMLSerializer(
                    getSchema([PlainTextKit, createSuggestionExtension('mention')]),
                )

                expect(
                    htmlSerializer.serialize(`Question: Who's the head of the Frontend team?
Answer: [Henning M](mention://963827)`),
                ).toBe(
                    '<p>Question: Who&#39;s the head of the Frontend team?</p><p>Answer: <span data-mention data-id="963827" data-label="Henning M"></span></p>',
                )
            })

            test('channel suggestion HTML output is correct', () => {
                const htmlSerializer = createHTMLSerializer(
                    getSchema([PlainTextKit, createSuggestionExtension('channel')]),
                )

                expect(
                    htmlSerializer.serialize(`Question: What's the best channel on Twist?
Answer: [Doist Frontend](channel://190200)`),
                ).toBe(
                    '<p>Question: What&#39;s the best channel on Twist?</p><p>Answer: <span data-channel data-id="190200" data-label="Doist Frontend"></span></p>',
                )
            })
        })
    })

    describe('Rich-text Document', () => {
        describe('with default extensions', () => {
            let htmlSerializer: HTMLSerializerReturnType

            beforeEach(() => {
                htmlSerializer = createHTMLSerializer(getSchema([RichTextKit]))
            })

            test('special ASCII characters are converted to HTML entities', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_SPECIAL_HTML_CHARS)).toBe(
                    '<p>Ambition &amp; Balance<br>&lt;doist&gt;<br>&lt;/doist&gt;<br>&lt;doist&gt;&lt;/doist&gt;<br>"Doist"<br>\'Doist\'</p>',
                )
            })

            test('headings HTML output is correct', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_HEADINGS)).toBe(
                    '<h1>Heading level 1</h1><h2>Heading level 2</h2><h3>Heading level 3</h3><h4>Heading level 4</h4><h5>Heading level 5</h5><h6>Heading level 6</h6>',
                )
            })

            test('paragraphs HTML output is correct', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_PARAGRAPHS)).toBe(
                    "<p>I really like using Markdown.</p><p>I think I'll use it to format all of my documents from now on.</p>",
                )
            })

            test('line breaks HTML output is correct', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_LINE_BREAKS)).toBe(
                    '<p>This is the first line.<br>And this is the second line.</p>',
                )
            })

            test('styled text HTML output is correct', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_STYLED_TEXT)).toBe(
                    "<p>I just love <strong>bold text</strong>.<br>I just love <strong>bold text</strong>.</p><p>Italicized text is the <em>cat's meow</em>.<br>Italicized text is the <em>cat's meow</em>.</p><p>This text is <em><strong>really important</strong></em>.<br>This text is <em><strong>really important</strong></em>.<br>This text is <strong><em>really important</em></strong>.<br>This text is <strong><em>really important</em></strong>.<br>This is really <em><strong>very</strong></em> important text.</p><p>Strikethrough uses two tildes: <del>scratch this</del></p>",
                )
            })

            test('blockquotes HTML output is correct', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_BLOCKQUOTES)).toBe(
                    '<blockquote><p>Dorothy followed her through many of the beautiful rooms in her castle.</p></blockquote><blockquote><p>Dorothy followed her through many of the beautiful rooms in her castle.</p><p>The Witch bade her clean the pots and kettles and sweep the floor and keep the fire fed with wood.</p></blockquote><blockquote><p>Dorothy followed her through many of the beautiful rooms in her castle.</p><blockquote><p>The Witch bade her clean the pots and kettles and sweep the floor and keep the fire fed with wood.</p></blockquote></blockquote><blockquote><h4>The quarterly results look great!</h4><ul><li>Revenue was off the chart.</li><li>Profits were higher than ever.</li></ul><p><em>Everything</em> is going according to <strong>plan</strong>.</p></blockquote>',
                )
            })

            test('ordered lists HTML output is correct', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_ORDERED_LISTS)).toBe(
                    '<ol><li>First item</li><li>Second item</li><li>Third item</li><li>Fourth item</li></ol><hr><ol><li>First item</li><li>Second item</li><li>Third item</li><li>Fourth item</li></ol><hr><ol><li>First item</li><li>Second item</li><li>Third item</li><li>Fourth item</li></ol><hr><ol><li>First item</li><li>Second item</li><li>Third item<ol><li>Indented item</li><li>Indented item</li></ol></li><li>Fourth item</li></ol>',
                )
            })

            test('unordered lists HTML output is correct', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_UNORDERED_LISTS)).toBe(
                    '<ul><li>First item</li><li>Second item</li><li>Third item</li><li>Fourth item</li></ul><hr><ul><li>First item</li><li>Second item</li><li>Third item</li><li>Fourth item</li></ul><hr><ul><li>First item</li><li>Second item</li><li>Third item</li><li>Fourth item</li></ul><hr><ul><li>First item</li><li>Second item</li><li>Third item<ul><li>Indented item</li><li>Indented item</li></ul></li><li>Fourth item</li></ul><hr><ul><li>1968. A great year!</li><li>I think 1969 was second best.</li></ul><hr><ul><li>This is the first list item.</li><li>Here&#39;s the second list item.<br>  I need to add another paragraph below the second list item.</li><li>And here&#39;s the third list item.</li></ul>',
                )
            })

            test('task lists syntax is preserved (unsupported by default)', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_TASK_LISTS)).toBe(
                    '<ul><li>[ ] First item</li><li>[x] Second item</li><li>[x] Third item</li><li>[ ] Fourth item</li></ul><hr><ul><li>[x] First item</li><li>[ ] Second item</li><li>[ ] Third item</li><li>[x] Fourth item</li></ul><hr><ul><li>[x] First item</li><li>[ ] Second item</li><li>[x] Third item</li><li>[ ] Fourth item</li></ul><hr><ul><li>First item</li><li>Second item</li><li>Third item<ul><li>[ ] Indented item</li><li>[ ] Indented item</li></ul></li><li>Fourth item</li></ul><hr><ul><li>[ ] 1968. A great year!</li><li>[x] I think 1969 was second best.</li></ul><hr><ul><li>[ ] This is the first list item.</li><li>[ ] Here&#39;s the second list item.<br>  I need to add another paragraph below the second list item.</li><li>[ ] And here&#39;s the third list item.</li></ul>',
                )
            })

            test('images HTML output is correct', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_IMAGES)).toBe(
                    '<img src="https://octodex.github.com/images/octobiwan.jpg" alt="Octobi Wan Catnobi"><img src="https://octodex.github.com/images/octobiwan.jpg" alt=""><img src="https://octodex.github.com/images/octobiwan.jpg" alt=""><img src="https://octodex.github.com/images/octobiwan.jpg" alt="Octobi Wan Catnobi" title="Octobi Wan Catnobi"><p><a href="https://octodex.github.com/octobiwan/"><img src="https://octodex.github.com/images/octobiwan.jpg" alt="Octobi Wan Catnobi" title="Octobi Wan Catnobi"></a></p><p>Octobi Wan Catnobi: </p><p>Octobi Wan Catnobi:  - These are not the droids you\'re looking for!</p><p> - These are not the droids you\'re looking for!</p>',
                )
            })

            test('code HTML output is correct', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_CODE)).toBe(
                    '<p>At the command prompt, type <code>nano</code>.</p><p><code>Use `code` in your Markdown file.</code></p>',
                )
            })

            test('code block HTML output is correct', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_CODE_BLOCK))
                    .toBe(`<pre><code>&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;Test&lt;/title&gt;
  &lt;/head&gt;
&lt;/html&gt;</code></pre>`)
            })

            test('block elements HTML output is correct', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_INDENTED_BLOCK_ELEMENTS))
                    .toBe(`<ol><li>Blockquote:<blockquote><p>Dorothy followed her through many of the beautiful rooms in her castle.</p></blockquote></li><li>Image:<br> <img src="https://octodex.github.com/images/octobiwan.jpg" alt="Octobi Wan Catnobi"></li><li>Codeblock:<pre><code>&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;Test&lt;/title&gt;
  &lt;/head&gt;
&lt;/html&gt;</code></pre></li></ol>`)
            })

            test('line rules HTML output is correct', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_LINE_RULES)).toBe('<hr><hr><hr>')
            })

            test('links HTML output is correct', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_LINKS)).toBe(
                    '<p>My favorite search engine is <a href="https://duckduckgo.com">Duck Duck Go</a>.<br>My favorite search engine is <a href="https://duckduckgo.com" title="The best search engine for privacy">Duck Duck Go</a>.</p>',
                )
            })

            test('styled links HTML output is correct', () => {
                expect(htmlSerializer.serialize(MARKDOWN_INPUT_STYLED_LINKS)).toBe(
                    '<p>I love supporting the <strong><a href="https://eff.org">EFF</a></strong>.<br>This is the <em><a href="https://www.markdownguide.org">Markdown Guide</a></em>.<br>See the section on <a href="#code"><code>code</code></a>.</p>',
                )
            })
        })

        describe('without `heading` extension', () => {
            test("HTML output doesn't have heading elements", () => {
                const customSerializer = createHTMLSerializer(
                    getSchema([
                        RichTextKit.configure({
                            heading: false,
                        }),
                    ]),
                )

                expect(customSerializer.serialize(MARKDOWN_INPUT_HEADINGS)).toBe(
                    '<p># Heading level 1</p><p>## Heading level 2</p><p>### Heading level 3</p><p>#### Heading level 4</p><p>##### Heading level 5</p><p>###### Heading level 6</p>',
                )
            })
        })

        describe('without `strike` extension', () => {
            test("HTML output doesn't have `del` elements", () => {
                const customSerializer = createHTMLSerializer(
                    getSchema([
                        RichTextKit.configure({
                            strike: false,
                        }),
                    ]),
                )

                expect(customSerializer.serialize(MARKDOWN_INPUT_STYLED_TEXT)).toBe(
                    "<p>I just love <strong>bold text</strong>.<br>I just love <strong>bold text</strong>.</p><p>Italicized text is the <em>cat's meow</em>.<br>Italicized text is the <em>cat's meow</em>.</p><p>This text is <em><strong>really important</strong></em>.<br>This text is <em><strong>really important</strong></em>.<br>This text is <strong><em>really important</em></strong>.<br>This text is <strong><em>really important</em></strong>.<br>This is really <em><strong>very</strong></em> important text.</p><p>Strikethrough uses two tildes: ~~scratch this~~</p>",
                )
            })
        })

        describe('without `codeblock` extension', () => {
            test('code block HTML output is correct', () => {
                const customSerializer = createHTMLSerializer(
                    getSchema([
                        RichTextKit.configure({
                            codeBlock: false,
                        }),
                    ]),
                )

                expect(customSerializer.serialize(MARKDOWN_INPUT_CODE_BLOCK))
                    .toBe(`<pre><code>&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;Test&lt;/title&gt;
  &lt;/head&gt;
&lt;/html&gt;
</code></pre>`)
            })
        })

        describe('without `image` extension', () => {
            test('images HTML output is correct', () => {
                const customSerializer = createHTMLSerializer(
                    getSchema([
                        RichTextKit.configure({
                            image: false,
                        }),
                    ]),
                )

                expect(customSerializer.serialize(MARKDOWN_INPUT_IMAGES)).toBe(
                    '<img src="https://octodex.github.com/images/octobiwan.jpg" alt="Octobi Wan Catnobi"><img src="https://octodex.github.com/images/octobiwan.jpg" alt=""><img src="https://octodex.github.com/images/octobiwan.jpg" alt=""><img src="https://octodex.github.com/images/octobiwan.jpg" alt="Octobi Wan Catnobi" title="Octobi Wan Catnobi"><p><a href="https://octodex.github.com/octobiwan/"><img src="https://octodex.github.com/images/octobiwan.jpg" alt="Octobi Wan Catnobi" title="Octobi Wan Catnobi"></a></p><p>Octobi Wan Catnobi: </p><p>Octobi Wan Catnobi:  - These are not the droids you\'re looking for!</p><p> - These are not the droids you\'re looking for!</p>',
                )
            })
        })

        describe('with `image` extension (inline)', () => {
            test('images HTML output is correct', () => {
                const customSerializer = createHTMLSerializer(
                    getSchema([
                        RichTextKit.configure({
                            image: {
                                inline: true,
                            },
                        }),
                    ]),
                )

                expect(customSerializer.serialize(MARKDOWN_INPUT_IMAGES)).toBe(
                    '<p><img src="https://octodex.github.com/images/octobiwan.jpg" alt="Octobi Wan Catnobi"></p><p><img src="https://octodex.github.com/images/octobiwan.jpg" alt=""><img src="https://octodex.github.com/images/octobiwan.jpg" alt=""></p><p><img src="https://octodex.github.com/images/octobiwan.jpg" alt="Octobi Wan Catnobi" title="Octobi Wan Catnobi"></p><p><a href="https://octodex.github.com/octobiwan/"><img src="https://octodex.github.com/images/octobiwan.jpg" alt="Octobi Wan Catnobi" title="Octobi Wan Catnobi"></a></p><p>Octobi Wan Catnobi: <img src="https://octodex.github.com/images/octobiwan.jpg" alt=""></p><p>Octobi Wan Catnobi: <img src="https://octodex.github.com/images/octobiwan.jpg" alt=""> - These are not the droids you\'re looking for!</p><p><img src="https://octodex.github.com/images/octobiwan.jpg" alt=""> - These are not the droids you\'re looking for!</p>',
                )
            })
        })

        describe('with custom `taskList` extension', () => {
            test('task lists HTML output is correct', () => {
                const customSerializer = createHTMLSerializer(
                    getSchema([RichTextKit, TaskList, TaskItem]),
                )

                expect(customSerializer.serialize(MARKDOWN_INPUT_TASK_LISTS)).toBe(
                    '<ul data-type="taskList"><li data-type="taskItem" data-checked="false">First item</li><li data-type="taskItem" data-checked="true">Second item</li><li data-type="taskItem" data-checked="true">Third item</li><li data-type="taskItem" data-checked="false">Fourth item</li></ul><hr><ul data-type="taskList"><li data-type="taskItem" data-checked="true">First item</li><li data-type="taskItem" data-checked="false">Second item</li><li data-type="taskItem" data-checked="false">Third item</li><li data-type="taskItem" data-checked="true">Fourth item</li></ul><hr><ul data-type="taskList"><li data-type="taskItem" data-checked="true">First item</li><li data-type="taskItem" data-checked="false">Second item</li><li data-type="taskItem" data-checked="true">Third item</li><li data-type="taskItem" data-checked="false">Fourth item</li></ul><hr><ul data-type="taskList"><li>First item</li><li>Second item</li><li>Third item<ul data-type="taskList"><li data-type="taskItem" data-checked="false">Indented item</li><li data-type="taskItem" data-checked="false">Indented item</li></ul></li><li>Fourth item</li></ul><hr><ul data-type="taskList"><li data-type="taskItem" data-checked="false">1968. A great year!</li><li data-type="taskItem" data-checked="true">I think 1969 was second best.</li></ul><hr><ul data-type="taskList"><li data-type="taskItem" data-checked="false">This is the first list item.</li><li data-type="taskItem" data-checked="false">Here&#39;s the second list item.<br>  I need to add another paragraph below the second list item.</li><li data-type="taskItem" data-checked="false">And here&#39;s the third list item.</li></ul>',
                )
            })
        })

        describe('with custom `*Suggestion` extensions', () => {
            test('suggestion extensions support alphanumeric IDs', () => {
                const customSerializer = createHTMLSerializer(
                    getSchema([RichTextKit, createSuggestionExtension('mention')]),
                )

                expect(
                    customSerializer.serialize(`Question: Who's the head of the Frontend team?
Answer: [Henning M](mention://user:190200@doist.dev)`),
                ).toBe(
                    '<p>Question: Who\'s the head of the Frontend team?<br>Answer: <span data-mention="" data-id="user:190200@doist.dev" data-label="Henning M"></span></p>',
                )
            })

            test('mention suggestions HTML output is correct', () => {
                const customSerializer = createHTMLSerializer(
                    getSchema([RichTextKit, createSuggestionExtension('mention')]),
                )

                expect(
                    customSerializer.serialize(`Question: Who's the head of the Frontend team?
Answer: [Henning M](mention://963827)`),
                ).toBe(
                    '<p>Question: Who\'s the head of the Frontend team?<br>Answer: <span data-mention="" data-id="963827" data-label="Henning M"></span></p>',
                )
            })

            test('channel suggestions HTML output is correct', () => {
                const customSerializer = createHTMLSerializer(
                    getSchema([RichTextKit, createSuggestionExtension('channel')]),
                )

                expect(
                    customSerializer.serialize(`Question: What's the best channel on Twist?
Answer: [Doist Frontend](channel://190200)`),
                ).toBe(
                    '<p>Question: What\'s the best channel on Twist?<br>Answer: <span data-channel="" data-id="190200" data-label="Doist Frontend"></span></p>',
                )
            })
        })
    })
})
