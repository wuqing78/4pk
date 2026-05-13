'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Poem = {
  id: number
  content: string
  rating: number
  wins: number
  losses: number
}

export default function PoemPage() {

  const params = useParams()

  const [poem, setPoem] =
    useState<Poem | null>(null)

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {

    async function loadPoem() {

      const { data, error } =
        await supabase
          .from('poems')
          .select('*')
          .eq('id', params.id)
          .single()

      if (error) {

        console.error(error)
        setLoading(false)
        return

      }

      setPoem(data)
      setLoading(false)

    }

    loadPoem()

  }, [params.id])

  if (loading) {
    return null
  }

  if (!poem) {

    return (

      <main className="min-h-screen bg-neutral-100 flex items-center justify-center">

        <div className="text-neutral-500">
          poem not found
        </div>

      </main>

    )

  }

  return (

    <main className="min-h-screen bg-neutral-100 text-black px-6 py-16">

      <div className="max-w-3xl mx-auto">

        <Link
          href="/"
          className="
            inline-block
            mb-12
            text-sm
            hover:opacity-60
            transition
          "
        >
          ← back
        </Link>

        <div className="border border-black bg-white p-10">

          <div className="whitespace-pre-line text-3xl leading-[2.2]">
            {poem.content}
          </div>

          <div className="mt-12 flex gap-12">

            <div>

              <div className="text-sm text-neutral-500 mb-2">
                Rating
              </div>

              <div className="text-4xl font-bold">
                {poem.rating}
              </div>

            </div>

            <div>

              <div className="text-sm text-neutral-500 mb-2">
                Record
              </div>

              <div className="text-4xl font-bold">
                {poem.wins} / {poem.losses}
              </div>

            </div>

          </div>

        </div>

      </div>

    </main>

  )

}
