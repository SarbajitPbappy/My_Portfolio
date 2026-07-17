'use client'

import JsxParser from 'react-jsx-parser'

// Detect whether stored content is JSX/TSX or plain HTML.
function isJSXContent(content: string): boolean {
  if (!content || typeof content !== 'string') return false

  const jsxPatterns = [
    /className\s*=/,
    /\{[^}]*\}/, // JSX expressions
    /<\/\w+>/, // closing tags
    /\/>/, // self-closing tags
    /<\w+\s+[^>]*\{/, // opening tag with JSX expression
  ]

  return jsxPatterns.some((pattern) => pattern.test(content))
}

export default function PageContent({ content }: { content: string }) {
  if (!content || !content.trim()) {
    return <p className="text-gray-500 italic">No content available.</p>
  }

  if (isJSXContent(content)) {
    try {
      return (
        <JsxParser
          jsx={content}
          components={{}}
          showWarnings={false}
          allowUnknownElements={true}
          bindings={{}}
          autoCloseVoidElements={true}
          renderInWrapper={false}
        />
      )
    } catch (error) {
      console.warn('JSX parsing failed, falling back to HTML:', error)
      return (
        <div
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )
    }
  }

  return (
    <div
      className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
