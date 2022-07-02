import { Prisma } from '@prisma/client'

export const postSeed = {
    excerpt:
        'Let’s talk for a moment about how we talk about our teams. This might not seem like something that needs a whole article dedicated to it, but it’s actually quite crucial. The way that we refer to our teams sends signals: to stakeholders, to your peers, to the team itself, and even to ourselves. In addressing how we speak about our teams, we’ll also talk about accountability.',
    content: {
        htmlContent:
            '<p>RichTextEditor component focuses on usability and is designed to be as simple as possible to bring a familiar editing experience to regular users. RichTextEditor is based on <a href="https://quilljs.com/" rel="noopener noreferrer" target="_blank">Quill.js</a> via <a href="https://github.com/zenoamaro/react-quill" rel="noopener noreferrer" target="_blank">react-quill</a> and supports most of its features:</p><ul><li>General text formatting: <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strikethrough</s></li><li>Headings (h1-h6)</li><li>Sub and super scripts (&lt;sup /&gt; and &lt;sub /&gt; tags)</li><li>Ordered and bullet lists</li><li>Image and video embeds</li><li>Text align&nbsp;</li></ul><p><br></p><p><span class="mention" data-index="0" data-denotation-char="#" data-id="-1" data-value="aNewTag">﻿<span contenteditable="false"><span class="ql-mention-denotation-char">#</span>aNewTag</span>﻿</span> </p><p><br></p><p><span class="mention" data-index="1" data-denotation-char="#" data-id="2" data-value="ln-webdev">﻿<span contenteditable="false"><span class="ql-mention-denotation-char">#</span>ln-webdev</span>﻿</span> </p><p><br></p><h2>Article itself</h2><p>Let’s talk for a moment about how we talk about our teams. This might not seem like something that needs a whole article dedicated to it, but it’s actually quite crucial. The way that we refer to our teams sends signals: to stakeholders, to your peers, to the team itself, and even to ourselves. In addressing how we speak about our teams, we’ll also talk about accountability.</p><p>I have noticed shared similarities in those folks I consider good managers whose teams deliver well, and those who don’t. It starts with how they communicate about their teams.</p><p><br></p><pre class="ql-syntax" spellcheck="false">await Promise.all(\n' +
            '    allPosts.map(async (post) =&gt; {\n' +
            '        const allTags = await prisma.tag.findMany({})\n' +
            '        const tagCandidates = getRandomElements(allTags)\n' +
            '\n' +
            '        await Promise.all(\n' +
            '            tagCandidates.map(async (tagCandidate) =&gt; {\n' +
            '                await prisma.post.update({\n' +
            '                    where: { id: post.id },\n' +
            '                    data: {\n' +
            '                        tags: {\n' +
            '                            create: {\n' +
            '                                tagId: tagCandidate.id,\n' +
            '                            },\n' +
            '                        },\n' +
            '                    },\n' +
            '                })\n' +
            '            }),\n' +
            '        )\n' +
            '    }),\n' +
            ')\n' +
            '</pre><p><br></p><p>But RichTextEditor is not just a wrapper for <a href="https://github.com/zenoamaro/react-quill" rel="noopener noreferrer" target="_blank">react-quill</a>, it comes with a bunch of extra features:</p><ol><li>Seamless integration with your Mantine theme – component will use font-family, font-sizes, spacing and primary color from your custom theme, defined in MantineProvider</li><li>Dark theme support – like any other Mantine component, RichTextEditor supports dark theme out of the box</li><li>Images uploading – specify upload function (S3 or anywhere else) that will be triggered when user pastes or drops image to editor</li><li>Sticky toolbar will be visible when user scrolls</li></ol><p><br></p>',
        deltaContent: {
            ops: [
                {
                    insert: 'RichTextEditor component focuses on usability and is designed to be as simple as possible to bring a familiar editing experience to regular users. RichTextEditor is based on ',
                },
                {
                    attributes: {
                        link: 'https://quilljs.com/',
                    },
                    insert: 'Quill.js',
                },
                {
                    insert: ' via ',
                },
                {
                    attributes: {
                        link: 'https://github.com/zenoamaro/react-quill',
                    },
                    insert: 'react-quill',
                },
                {
                    insert: ' and supports most of its features:\nGeneral text formatting: ',
                },
                {
                    attributes: {
                        bold: true,
                    },
                    insert: 'bold',
                },
                {
                    insert: ', ',
                },
                {
                    attributes: {
                        italic: true,
                    },
                    insert: 'italic',
                },
                {
                    insert: ', ',
                },
                {
                    attributes: {
                        underline: true,
                    },
                    insert: 'underline',
                },
                {
                    insert: ', ',
                },
                {
                    attributes: {
                        strike: true,
                    },
                    insert: 'strikethrough',
                },
                {
                    attributes: {
                        list: 'bullet',
                    },
                    insert: '\n',
                },
                {
                    insert: 'Headings (h1-h6)',
                },
                {
                    attributes: {
                        list: 'bullet',
                    },
                    insert: '\n',
                },
                {
                    insert: 'Sub and super scripts (<sup /> and <sub /> tags)',
                },
                {
                    attributes: {
                        list: 'bullet',
                    },
                    insert: '\n',
                },
                {
                    insert: 'Ordered and bullet lists',
                },
                {
                    attributes: {
                        list: 'bullet',
                    },
                    insert: '\n',
                },
                {
                    insert: 'Image and video embeds',
                },
                {
                    attributes: {
                        list: 'bullet',
                    },
                    insert: '\n',
                },
                {
                    insert: 'Text align ',
                },
                {
                    attributes: {
                        list: 'bullet',
                    },
                    insert: '\n',
                },
                {
                    insert: '\n',
                },
                {
                    insert: {
                        mention: {
                            index: '0',
                            denotationChar: '#',
                            id: '-1',
                            value: 'aNewTag',
                        },
                    },
                },
                {
                    insert: ' \n\n',
                },
                {
                    insert: {
                        mention: {
                            index: '1',
                            denotationChar: '#',
                            id: '2',
                            value: 'ln-webdev',
                        },
                    },
                },
                {
                    insert: ' \n\nArticle itself',
                },
                {
                    attributes: {
                        header: 2,
                    },
                    insert: '\n',
                },
                {
                    insert: 'Let’s talk for a moment about how we talk about our teams. This might not seem like something that needs a whole article dedicated to it, but it’s actually quite crucial. The way that we refer to our teams sends signals: to stakeholders, to your peers, to the team itself, and even to ourselves. In addressing how we speak about our teams, we’ll also talk about accountability.\nI have noticed shared similarities in those folks I consider good managers whose teams deliver well, and those who don’t. It starts with how they communicate about their teams.\n\nawait Promise.all(',
                },
                {
                    attributes: {
                        'code-block': true,
                    },
                    insert: '\n',
                },
                {
                    insert: '    allPosts.map(async (post) => {',
                },
                {
                    attributes: {
                        'code-block': true,
                    },
                    insert: '\n',
                },
                {
                    insert: '        const allTags = await prisma.tag.findMany({})',
                },
                {
                    attributes: {
                        'code-block': true,
                    },
                    insert: '\n',
                },
                {
                    insert: '        const tagCandidates = getRandomElements(allTags)',
                },
                {
                    attributes: {
                        'code-block': true,
                    },
                    insert: '\n\n',
                },
                {
                    insert: '        await Promise.all(',
                },
                {
                    attributes: {
                        'code-block': true,
                    },
                    insert: '\n',
                },
                {
                    insert: '            tagCandidates.map(async (tagCandidate) => {',
                },
                {
                    attributes: {
                        'code-block': true,
                    },
                    insert: '\n',
                },
                {
                    insert: '                await prisma.post.update({',
                },
                {
                    attributes: {
                        'code-block': true,
                    },
                    insert: '\n',
                },
                {
                    insert: '                    where: { id: post.id },',
                },
                {
                    attributes: {
                        'code-block': true,
                    },
                    insert: '\n',
                },
                {
                    insert: '                    data: {',
                },
                {
                    attributes: {
                        'code-block': true,
                    },
                    insert: '\n',
                },
                {
                    insert: '                        tags: {',
                },
                {
                    attributes: {
                        'code-block': true,
                    },
                    insert: '\n',
                },
                {
                    insert: '                            create: {',
                },
                {
                    attributes: {
                        'code-block': true,
                    },
                    insert: '\n',
                },
                {
                    insert: '                                tagId: tagCandidate.id,',
                },
                {
                    attributes: {
                        'code-block': true,
                    },
                    insert: '\n',
                },
                {
                    insert: '                            },',
                },
                {
                    attributes: {
                        'code-block': true,
                    },
                    insert: '\n',
                },
                {
                    insert: '                        },',
                },
                {
                    attributes: {
                        'code-block': true,
                    },
                    insert: '\n',
                },
                {
                    insert: '                    },',
                },
                {
                    attributes: {
                        'code-block': true,
                    },
                    insert: '\n',
                },
                {
                    insert: '                })',
                },
                {
                    attributes: {
                        'code-block': true,
                    },
                    insert: '\n',
                },
                {
                    insert: '            }),',
                },
                {
                    attributes: {
                        'code-block': true,
                    },
                    insert: '\n',
                },
                {
                    insert: '        )',
                },
                {
                    attributes: {
                        'code-block': true,
                    },
                    insert: '\n',
                },
                {
                    insert: '    }),',
                },
                {
                    attributes: {
                        'code-block': true,
                    },
                    insert: '\n',
                },
                {
                    insert: ')',
                },
                {
                    attributes: {
                        'code-block': true,
                    },
                    insert: '\n',
                },
                {
                    insert: '\nBut RichTextEditor is not just a wrapper for ',
                },
                {
                    attributes: {
                        link: 'https://github.com/zenoamaro/react-quill',
                    },
                    insert: 'react-quill',
                },
                {
                    insert: ', it comes with a bunch of extra features:\nSeamless integration with your Mantine theme – component will use font-family, font-sizes, spacing and primary color from your custom theme, defined in MantineProvider',
                },
                {
                    attributes: {
                        list: 'ordered',
                    },
                    insert: '\n',
                },
                {
                    insert: 'Dark theme support – like any other Mantine component, RichTextEditor supports dark theme out of the box',
                },
                {
                    attributes: {
                        list: 'ordered',
                    },
                    insert: '\n',
                },
                {
                    insert: 'Images uploading – specify upload function (S3 or anywhere else) that will be triggered when user pastes or drops image to editor',
                },
                {
                    attributes: {
                        list: 'ordered',
                    },
                    insert: '\n',
                },
                {
                    insert: 'Sticky toolbar will be visible when user scrolls',
                },
                {
                    attributes: {
                        list: 'ordered',
                    },
                    insert: '\n',
                },
                {
                    insert: '\n',
                },
            ],
        },
    },
}
