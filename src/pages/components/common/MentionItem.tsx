const getElement = (mention: Element, denotation: string) => {
    const tmpObj = document.createElement('span')
    const item = denotation === '#' ? 'tag' : 'user'
    tmpObj.innerHTML = `<a href="post/${item}/${mention.getAttribute(
        'data-value',
    )}">${denotation}${mention.getAttribute('data-value')}</Link>`
    mention.replaceWith(tmpObj)
}

export const replaceMentions = (doc: HTMLElement) => {
    const userMentions = doc.querySelectorAll('[data-denotation-char="@"]')
    const tagMentions = doc.querySelectorAll('[data-denotation-char="#"]')

    userMentions.forEach((mention) => getElement(mention, '@'))
    tagMentions.forEach((mention) => getElement(mention, '#'))
}
