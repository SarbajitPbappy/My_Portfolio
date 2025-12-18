import { readFile } from 'fs/promises'
import { join } from 'path'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function GuidePage() {
  let content = ''
  
  try {
    const filePath = join(process.cwd(), 'NAVBAR_AND_PAGES_GUIDE.md')
    content = await readFile(filePath, 'utf-8')
  } catch (error) {
    content = '# Guide Not Found\n\nThe guide file could not be loaded.'
  }

  return (
    <div className="min-h-screen py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Panel</span>
          </Link>
        </div>
        
        <article className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 prose prose-lg max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-4xl font-bold text-gray-900 mb-6">{children}</h1>,
              h2: ({ children }) => <h2 className="text-3xl font-bold text-gray-900 mt-8 mb-4">{children}</h2>,
              h3: ({ children }) => <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">{children}</h3>,
              h4: ({ children }) => <h4 className="text-xl font-semibold text-gray-900 mt-4 mb-2">{children}</h4>,
              p: ({ children }) => <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700">{children}</ol>,
              li: ({ children }) => <li className="ml-4">{children}</li>,
              code: ({ children, className }) => {
                const isInline = !className
                if (isInline) {
                  return <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">{children}</code>
                }
                return (
                  <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4">
                    {children}
                  </code>
                )
              },
              pre: ({ children }) => <pre className="mb-4">{children}</pre>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary-500 pl-4 italic text-gray-600 my-4">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full border border-gray-300">{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-gray-300 px-4 py-2">{children}</td>
              ),
              strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
              em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-primary-600 hover:text-primary-700 underline"
                  target={href?.startsWith('http') ? '_blank' : undefined}
                  rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {children}
                </a>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  )
}

