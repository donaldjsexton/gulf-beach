'use client'

import { useEffect, useRef } from 'react'
import EditorJS, { OutputData } from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import Image from '@editorjs/image'
import Embed from '@editorjs/embed'
import Quote from '@editorjs/quote'

interface EditorProps {
  data?: OutputData
  onChange?: (data: OutputData) => void
}

export default function Editor({ data, onChange }: EditorProps) {
  const editorRef = useRef<EditorJS | null>(null)

  useEffect(() => {
    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: 'editor',
        tools: {
          header: {
            class: Header,
            config: {
              placeholder: 'Enter a header',
              levels: [1, 2, 3],
              defaultLevel: 1,
            },
          },
          list: {
            class: List,
            inlineToolbar: true,
          },
          image: {
            class: Image,
            config: {
              endpoints: {
                byFile: '/api/upload', // Your image upload endpoint
              },
            },
          },
          embed: {
            class: Embed,
            config: {
              services: {
                youtube: true,
                vimeo: true,
              },
            },
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
          },
        },
        data,
        onChange: async () => {
          const outputData = await editor.save()
          onChange?.(outputData)
        },
      })

      editorRef.current = editor
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy()
        editorRef.current = null
      }
    }
  }, [data, onChange])

  return <div id="editor" className="prose max-w-none" />
} 