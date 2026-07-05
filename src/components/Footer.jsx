import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-[#333] py-8 text-center text-white">
      <div className="mx-auto max-w-[1200px] px-5">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <p>&copy; 2024 Lilota. Open source embedded systems firmware.</p>
          </div>
          <div className="flex gap-4">
            <a className="text-xl text-white no-underline" href="https://github.com/COMPAS-Lab/lilota" title="GitHub" target="_blank" rel="noreferrer">📚</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
