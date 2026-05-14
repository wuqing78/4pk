'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {

  const [count, setCount] =
    useState(0)

  const [newPoem, setNewPoem] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  useEffect(() => {

    async function loadCount() {

      const { count } =
        await supabase
          .from('poems')
          .select('*', {
            count: 'exact',
            head: true
          })

      setCount(count || 0)

    }

    loadCount()

  }, [])

  async function submitPoem() {

    if (!newPoem.trim())
      return

    setLoading(true)

    const { error } =
      await supabase
        .from('poems')
        .insert([
          {
            content: newPoem.trim(),
            rating: 1200,
            wins: 0,
            losses: 0
          }
        ])

    setLoading(false)

    if (error) {

      console.error(error)
      alert('导入失败')
      return

    }

    setNewPoem('')

    setCount((c) => c + 1)

    alert('诗歌已加入')

  }

  async function importTxtFile(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0]

    if (!file)
      return

    setLoading(true)

    const reader =
      new FileReader()

    reader.onload = async (e) => {

      const text =
        e.target?.result as string

      const poems =
        text
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n')
          .replace(/\u2028/g, '\n')
          .split('===')
          .map((p) => p.trim())
          .filter(Boolean)

      const imported =
        poems.map((content) => ({
          content,
          rating: 1200,
          wins: 0,
          losses: 0
        }))

      const { error } =
        await supabase
          .from('poems')
          .insert(imported)

      setLoading(false)

      if (error) {

        console.error(error)
        alert('TXT 导入失败')
        return

      }

      setCount((c) => c + imported.length)

      alert(`成功导入 ${imported.length} 首诗`)

    }

    reader.readAsText(file)

  }

  return (

    <main className="min-h-screen bg-neutral-100 text-black px-6 py-12">

      <div className="max-w-3xl mx-auto">

        {/* 顶部 */}

        <div className="mb-16">

          <Link
            href="/"
            className="inline-block"
          >

            <h1 className="text-5xl font-bold tracking-tight hover:opacity-70 transition">
              诗PK Admin
            </h1>

          </Link>

          <div className="mt-3 text-neutral-500">
            当前诗歌：{count} 首
          </div>

        </div>

        {/* TXT 导入 */}

        <div className="border border-black bg-white p-8 mb-10">

          <div className="text-xl font-bold mb-6">
            批量导入 TXT
          </div>

          <div className="text-sm text-neutral-500 mb-6 leading-7">
            使用 === 分隔诗歌
          </div>

          <label
            className="
              inline-block
              border border-black
              px-6 py-3
              hover:bg-black
              hover:text-white
              active:scale-95
              transition
              cursor-pointer
            "
          >

            选择 TXT 文件

            <input
              type="file"
              accept=".txt"
              onChange={importTxtFile}
              className="hidden"
            />

          </label>

        </div>

        {/* 单首导入 */}

        <div className="border border-black bg-white p-8">

          <div className="text-xl font-bold mb-6">
            手动添加诗歌
          </div>

          <textarea
            value={newPoem}
            onChange={(e) =>
              setNewPoem(e.target.value)
            }
            placeholder="写入诗歌..."
            className="
              w-full
              border border-black
              bg-white
              p-6
              min-h-[240px]
              resize-none
              outline-none
              text-lg
              leading-[2]
            "
          />

          <button
            onClick={submitPoem}
            disabled={loading}
            className="
              mt-6
              border border-black
              px-8 py-3
              hover:bg-black
              hover:text-white
              active:scale-95
              transition
            "
          >

            {loading
              ? '处理中...'
              : '加入诗库'}

          </button>

        </div>

        {/* 底部 */}

        <div className="mt-24 text-center text-sm text-neutral-400">
          4PK.org
        </div>

      </div>

    </main>

  )

}
