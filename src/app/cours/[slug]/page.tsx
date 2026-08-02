import { notFound } from "next/navigation"
import { getCourseBySlug } from "@/lib/queries/course"
import { formatPrice } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function CourseSalesPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const course = await getCourseBySlug(slug)

  if (!course) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      {/* Hero / Thumbnail */}
      <div className="w-full">
        {course.thumbnailUrl ? (
          <div className="aspect-video w-full bg-muted">
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-gradient-to-br from-muted to-background flex items-center justify-center">
            <p className="text-muted-foreground text-xl">{course.title}</p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title + Prof */}
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold">{course.title}</h1>
              {course.prof.name && (
                <p className="text-muted-foreground">par {course.prof.name}</p>
              )}
            </div>

            {/* Description */}
            {course.description && (
              <div className="prose prose-invert max-w-none">
                <div className="text-base leading-relaxed whitespace-pre-line">
                  {course.description}
                </div>
              </div>
            )}

            {/* Curriculum */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Programme du cours</h2>
              {course.modules.length > 0 ? (
                <Card>
                  <CardContent className="p-0">
                    <ul className="divide-y divide-border">
                      {course.modules.map((module, index) => (
                        <li key={module.id} className="p-4 flex items-center gap-3">
                          <Badge variant="secondary">{index + 1}</Badge>
                          <span>{module.title}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ) : (
                <p className="text-muted-foreground">
                  Le programme sera bientôt disponible
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Sticky Sidebar (desktop) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {formatPrice(course.price)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button render={<Link href={`/checkout/${course.id}`} />} className="w-full" size="lg">
                    Acheter
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Prix</p>
            <p className="text-xl font-semibold">{formatPrice(course.price)}</p>
          </div>
          <Button render={<Link href={`/checkout/${course.id}`} />} size="lg">
            Acheter
          </Button>
        </div>
      </div>
    </div>
  )
}
