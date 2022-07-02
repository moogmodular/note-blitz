export const commentSeed = {
    content: {
        htmlContent:
            `<p><span class="mention" data-index="4" data-denotation-char="#" data-id="5" data-value="bitcoin">﻿<span contenteditable="false"><span class="ql-mention-denotation-char">#</span>bitcoin</span>﻿</span> <span class="mention" data-index="0" data-denotation-char="@" data-id="0" data-value="LegalFuchsiaDuck">﻿<span contenteditable="false"><span class="ql-mention-denotation-char">@</span>LegalFuchsiaDuck</span>﻿</span> <span class="mention" data-index="0" data-denotation-char="#" data-id="-1" data-value="anotherNewTag">﻿<span contenteditable="false"><span class="ql-mention-denotation-char">#</span>anotherNewTag</span>﻿</span> </p><p>This is&nbsp;<code>Code</code>&nbsp;inside paragraph</p><pre class="ql-syntax" spellcheck="false">import React from 'react';\n` +
            "import { Avatar } from '@mantine/core';\n" +
            "import image from './image.png';\n" +
            '\n' +
            'export function AvatarDemo() {\n' +
            `  return &lt;Avatar src={image} alt="it's me" /&gt;;\n` +
            '}\n' +
            '</pre><p><br></p><p>To embed a video click video icon and paste a link to YouTube, Vimeo or other video service which supports inserting via iframe. Images are more complex you will need to setup uploading function and then editor will handle all heavy image stuff: dnd, pasting from clipboard and inserting with image button. Try the thing out!</p>',
        deltaContent: {
            ops: [
                {
                    insert: {
                        mention: {
                            index: '4',
                            denotationChar: '#',
                            id: '5',
                            value: 'bitcoin',
                        },
                    },
                },
                {
                    insert: ' ',
                },
                {
                    insert: {
                        mention: {
                            index: '0',
                            denotationChar: '@',
                            id: '0',
                            value: 'LegalFuchsiaDuck',
                        },
                    },
                },
                {
                    insert: ' ',
                },
                {
                    insert: {
                        mention: {
                            index: '0',
                            denotationChar: '#',
                            id: '-1',
                            value: 'anotherNewTag',
                        },
                    },
                },
                {
                    insert: ' \nThis is ',
                },
                {
                    attributes: {
                        code: true,
                    },
                    insert: 'Code',
                },
                {
                    insert: " inside paragraph\nimport React from 'react';",
                },
                {
                    attributes: {
                        'code-block': true,
                    },
                    insert: '\n',
                },
                {
                    insert: "import { Avatar } from '@mantine/core';",
                },
                {
                    attributes: {
                        'code-block': true,
                    },
                    insert: '\n',
                },
                {
                    insert: "import image from './image.png';",
                },
                {
                    attributes: {
                        'code-block': true,
                    },
                    insert: '\n\n',
                },
                {
                    insert: 'export function AvatarDemo() {',
                },
                {
                    attributes: {
                        'code-block': true,
                    },
                    insert: '\n',
                },
                {
                    insert: '  return <Avatar src={image} alt="it\'s me" />;',
                },
                {
                    attributes: {
                        'code-block': true,
                    },
                    insert: '\n',
                },
                {
                    insert: '}',
                },
                {
                    attributes: {
                        'code-block': true,
                    },
                    insert: '\n',
                },
                {
                    insert: '\nTo embed a video click video icon and paste a link to YouTube, Vimeo or other video service which supports inserting via iframe. Images are more complex you will need to setup uploading function and then editor will handle all heavy image stuff: dnd, pasting from clipboard and inserting with image button. Try the thing out!\n',
                },
            ],
        },
    },
}
