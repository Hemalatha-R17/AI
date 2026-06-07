export function parseADF(node) {
  if (!node) return ''
  if (typeof node === 'string') return node

  switch (node.type) {
    case 'doc':
      return (node.content || []).map(parseADF).join('')

    case 'paragraph':
      return (node.content || []).map(parseADF).join('') + '\n\n'

    case 'text': {
      let text = node.text || ''
      const marks = node.marks || []
      for (const mark of marks) {
        if (mark.type === 'strong') text = `**${text}**`
        else if (mark.type === 'em') text = `_${text}_`
        else if (mark.type === 'code') text = `\`${text}\``
        else if (mark.type === 'link') text = `[${text}](${mark.attrs?.href || ''})`
      }
      return text
    }

    case 'hardBreak':
      return '\n'

    case 'heading': {
      const level = '#'.repeat(node.attrs?.level || 1)
      return `${level} ${(node.content || []).map(parseADF).join('')}\n\n`
    }

    case 'bulletList':
      return (node.content || []).map(item => `- ${parseADF(item).trim()}`).join('\n') + '\n\n'

    case 'orderedList':
      return (node.content || []).map((item, i) => `${i + 1}. ${parseADF(item).trim()}`).join('\n') + '\n\n'

    case 'listItem':
      return (node.content || []).map(parseADF).join('').trim()

    case 'codeBlock': {
      const lang = node.attrs?.language || ''
      const code = (node.content || []).map(n => n.text || '').join('')
      return `\`\`\`${lang}\n${code}\n\`\`\`\n\n`
    }

    case 'blockquote':
      return (node.content || []).map(n => `> ${parseADF(n).trim()}`).join('\n') + '\n\n'

    case 'rule':
      return '---\n\n'

    case 'table':
      return (node.content || []).map(parseADF).join('') + '\n'

    case 'tableRow': {
      const cells = (node.content || []).map(cell => parseADF(cell).replace(/\n/g, ' ').trim())
      return `| ${cells.join(' | ')} |\n`
    }

    case 'tableHeader':
    case 'tableCell':
      return (node.content || []).map(parseADF).join(' ')

    case 'mediaSingle':
    case 'media':
      return '[attachment]\n'

    default:
      if (node.content) return (node.content || []).map(parseADF).join('')
      return ''
  }
}
