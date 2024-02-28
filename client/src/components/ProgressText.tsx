import React from "react"

export default function ProgressText({ children }: React.PropsWithChildren) {
  return (
    <h1 className="text-3xl animate-bounce text-center">{children}</h1>
  )
}