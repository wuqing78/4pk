'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

type Poem = {
  id: number
  content: string
  author: string
  rating: number
  wins: number
  losses: number
}

function getTitle(content: string) {

  return content
    .split('\n')[0]
    .replace(/[#《》]/g, '')
    .slice(0, 20)

}

export default function Home() {

  const [allPoems, setAllPoems] =
    useState<Poem[]>([])

  const [topPoem, setTopPoem] =
    useState<Poem | null>(null)

  const [leftPoem, setLeftPoem] =
    useState<Poem | null>(null)

  const [rightPoem, setRightPoem] =
    useState<Poem | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [leftKey, setLeftKey] =
    useState(0)

  const [rightKey, setRightKey] =
    useState(0)
function randomBattle(poems: Poem[]) {

  const randomLeft =
    poems[
      Math.floor(
        Math.random() * poems.length
      )
    ]

  const remaining =
    poems.filter(
      (p) => p.id !== randomLeft.id
    )

  const randomRight =
    remaining[
      Math.floor(
        Math.random() * remaining.length
      )
    ]

  setLeftPoem(randomLeft)
  setRightPoem(randomRight)

  setLeftKey((k) => k + 1)
  setRightKey((k) => k + 1)

}
  useEffect(() => {

    async function loadPoems() {

      const { data, error } =
        await supabase
          .from('poems')
          .select('*')

      if (error) {

        console.error(error)
        return

      }

      if (!data || data.length < 2)
        return

      setAllPoems(data)

      const top =
        [...data].sort(
          (a, b) => b.rating - a.rating
        )[0]

      setTopPoem(top)

      randomBattle(data)

      setLoading(false)

    }

    loadPoems()

  }, [])

  if (loading) {

    return (

      <main className="min-h-screen bg-neutral-100" />

    )

  }

  function updateTopPoem(updated: Poem[]) {

    const top =
      [...updated].sort(
        (a, b) => b.rating - a.rating
      )[0]

    setTopPoem(top)

  }

  async function vote(
    winner: Poem,
    loser: Poem
  ) {

    const updatedWinner = {
      ...winner,
      rating: winner.rating + 8,
      wins: winner.wins + 1
    }

    const updatedLoser = {
      ...loser,
      rating: loser.rating - 8,
      losses: loser.losses + 1
    }

    await supabase
      .from('poems')
      .update({
        rating: updatedWinner.rating,
        wins: updatedWinner.wins
      })
      .eq('id', winner.id)

    await supabase
      .from('poems')
      .update({
        rating: updatedLoser.rating,
        losses: updatedLoser.losses
      })
      .eq('id', loser.id)

    const updated =
      allPoems.map((poem) => {

        if (poem.id === winner.id)
          return updatedWinner

        if (poem.id === loser.id)
          return updatedLoser

        return poem

      })

    setAllPoems(updated)

    updateTopPoem(updated)

    const nextPool =
      updated.filter(
        (p) => p.id !== updatedWinner.id
      )

    let next

const randomMode = Math.random()

// 50% 全随机

if (randomMode < 0.5) {

  next =
    nextPool[
      Math.floor(
        Math.random() * nextPool.length
      )
    ]

}

// 30% 接近 rating

else if (randomMode < 0.8) {

  const sortedPool =
    [...nextPool].sort((a, b) => {

      return Math.abs(
        a.rating - updatedWinner.rating
      ) - Math.abs(
        b.rating - updatedWinner.rating
      )

    })

  const candidates =
    sortedPool.slice(0, 20)

  next =
    candidates[
      Math.floor(
        Math.random() * candidates.length
      )
    ]

}

// 20% 推冷门诗

else {

  const unpopular =
    [...nextPool]
      .sort((a, b) => {

        const aGames =
          a.wins + a.losses

        const bGames =
          b.wins + b.losses

        return aGames - bGames

      })
      .slice(0, 30)

  next =
    unpopular[
      Math.floor(
        Math.random() * unpopular.length
      )
    ]

}

    if (winner.id === leftPoem?.id) {

      setLeftPoem(updatedWinner)
      setRightPoem(next)

      setRightKey((k) => k + 1)

    } else {

      setRightPoem(updatedWinner)
      setLeftPoem(next)

      setLeftKey((k) => k + 1)

    }

  }

  async function importTxtFile(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0]

    if (!file)
      return

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

      const { data, error } =
        await supabase
          .from('poems')
          .insert(imported)
          .select()

      if (error) {

        console.error(error)
        return

      }

      const updated = [
        ...allPoems,
        ...data
      ]

      setAllPoems(updated)

      updateTopPoem(updated)

    }

    reader.readAsText(file)

  }

  if (!leftPoem || !rightPoem) {

    return (

      <main className="min-h-screen bg-neutral-100" />

    )

  }

  return (

    <main className="min-h-screen bg-neutral-100 text-black px-6 py-12">

      <div className="max-w-7xl mx-auto">

        {/* 顶部 */}

        <div className="flex items-start justify-between mb-16">

  <button
    onClick={() =>
      randomBattle(allPoems)
    }
    className="
      text-sm
      border border-black
      px-4 py-2
      hover:bg-black
      hover:text-white
      active:scale-95
      transition
    "
  >
    换一组
  </button>

  <div className="text-center">

    <Link
      href="/"
      className="inline-block"
    >

      <h1 className="text-6xl font-bold tracking-tight hover:opacity-70 transition">
        诗PK
      </h1>

    </Link>

    <div className="mt-3 text-xl text-neutral-500">
      诗，无限的选择...
    </div>

  </div>

  <div className="w-[88px]" />

</div>

        {/* PK */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          <AnimatePresence mode="wait">

            <motion.div
              key={leftKey}
              initial={{
                opacity: 0,
                y: 30,
                scale: 0.96
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1
              }}
              exit={{
                opacity: 0
              }}
              transition={{
                duration: 0.35
              }}
              className="
                border border-black
                bg-white
                p-8
              "
            >

              <div className="text-base font-bold tracking-wide text-black/70 mb-8">
  @{leftPoem.author}
</div>

<p className="whitespace-pre-line text-2xl leading-[2.2] break-words">
  {leftPoem.content}
</p>

              <div className="mt-10 flex items-center justify-between">

                <div>

                  <div className="text-sm text-neutral-500">
                    评分 {leftPoem.rating}
                  </div>

                  <div className="text-sm text-neutral-500 mt-1">
                    {leftPoem.wins} 胜 / {leftPoem.losses} 负
                  </div>

                </div>

                <button
                  onClick={() =>
                    vote(leftPoem, rightPoem)
                  }
                  className="
                    border-2 border-black
                    px-8 py-4
                    text-lg font-bold
                    hover:bg-black
                    hover:text-white
                    active:bg-black
                    active:text-white
                    active:scale-95
                    transition
                  "
                >
                  ← 选这首
                </button>

              </div>

            </motion.div>

          </AnimatePresence>

          <AnimatePresence mode="wait">

            <motion.div
              key={rightKey}
              initial={{
                opacity: 0,
                y: 30,
                scale: 0.96
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1
              }}
              exit={{
                opacity: 0
              }}
              transition={{
                duration: 0.35
              }}
              className="
                border border-black
                bg-white
                p-8
              "
            >

              <div className="text-base font-bold tracking-wide text-black/70 mb-8">
  @{rightPoem.author}
</div>

<p className="whitespace-pre-line text-2xl leading-[2.2] break-words">
  {rightPoem.content}
</p>

              <div className="mt-10 flex items-center justify-between">

                <button
                  onClick={() =>
                    vote(rightPoem, leftPoem)
                  }
                  className="
                    border-2 border-black
                    px-8 py-4
                    text-lg font-bold
                    hover:bg-black
                    hover:text-white
                    active:bg-black
                    active:text-white
                    active:scale-95
                    transition
                  "
                >
                  选这首 →
                </button>

                <div className="text-right">

                  <div className="text-sm text-neutral-500">
                    评分 {rightPoem.rating}
                  </div>

                  <div className="text-sm text-neutral-500 mt-1">
                    {rightPoem.wins} 胜 / {rightPoem.losses} 负
                  </div>

                </div>

              </div>

            </motion.div>

          </AnimatePresence>

        </div>

        {/* 底部 */}

        {/* 底部 */}

<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-24">

  {topPoem && (

    <div className="border border-black bg-white p-8">

      <div className="text-xs uppercase tracking-[0.4em] text-neutral-500 mb-5">
        WORLD #1
      </div>
      
<div className="text-base font-bold tracking-wide text-black/70 mb-6">
  @{topPoem.author}
</div>
      <p className="text-2xl leading-[2] whitespace-pre-line break-words">
        {topPoem.content}
      </p>

      <div className="mt-8 flex gap-10">

        <div>

          <div className="text-sm text-neutral-500 mb-2">
            Rating
          </div>

          <div className="text-3xl font-bold">
            {topPoem.rating}
          </div>

        </div>

        <div>

          <div className="text-sm text-neutral-500 mb-2">
            Record
          </div>

          <div className="text-3xl font-bold">
            {topPoem.wins} / {topPoem.losses}
          </div>

        </div>

      </div>

    </div>

  )}

  <div className="border border-black bg-white p-6">

    <h2 className="text-sm uppercase tracking-[0.3em] text-neutral-500 mb-6">
      Top 20
    </h2>

    <div className="space-y-4">

      {[...allPoems]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 20)
        .map((poem, index) => (

          <Link
            href={`/poem/${poem.id}`}
            key={poem.id}
            className="
              block
              border-b border-neutral-300
              pb-3
              hover:opacity-70
              transition
            "
          >

            <div className="flex items-center justify-between">

              <div className="flex gap-3 items-center">

                <div className="text-sm font-bold">
                  #{index + 1}
                </div>

               <div className="max-w-[180px]">

  <div className="text-sm truncate font-bold">
    {getTitle(poem.content)}
  </div>

  <div className="text-xs text-neutral-600 mt-1 truncate">
    @{poem.author || '未知'}
  </div>

</div>

              </div>

              <div className="text-xs text-neutral-500">
                {poem.rating}
              </div>

            </div>

          </Link>

        ))}

    </div>

  </div>

</div>

<div className="mt-24 text-center text-sm text-neutral-400">
  4PK.org
</div>

      </div>

    </main>

  )

}
