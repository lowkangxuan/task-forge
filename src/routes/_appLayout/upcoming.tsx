import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_appLayout/upcoming')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_appLayout/upcoming"!</div>
}
