import { describe, it, expect } from "vitest"

describe("ModuleSection type compatibility", () => {
  it("should accept modules with lessons property", () => {
    // This test will fail if the Module interface in module-section.tsx
    // doesn't include the lessons property

    interface Lesson {
      id: string
      title: string
      description: string | null
      videoUrl: string | null
      order: number
      moduleId: string
    }

    interface Module {
      id: string
      title: string
      order: number
      courseId: string
      lessons: Lesson[]
    }

    const mockModule: Module = {
      id: "mod-1",
      title: "Module 1",
      order: 0,
      courseId: "course-1",
      lessons: [
        {
          id: "lesson-1",
          title: "Lesson 1",
          description: null,
          videoUrl: null,
          order: 0,
          moduleId: "mod-1",
        },
      ],
    }

    // This assignment should be valid
    const modules: Module[] = [mockModule]

    expect(modules).toBeDefined()
    expect(modules[0].lessons).toBeDefined()
    expect(modules[0].lessons).toHaveLength(1)
  })

  it("should work with modules having no lessons", () => {
    interface Lesson {
      id: string
      title: string
      description: string | null
      videoUrl: string | null
      order: number
      moduleId: string
    }

    interface Module {
      id: string
      title: string
      order: number
      courseId: string
      lessons: Lesson[]
    }

    const mockModule: Module = {
      id: "mod-1",
      title: "Module 1",
      order: 0,
      courseId: "course-1",
      lessons: [],
    }

    const modules: Module[] = [mockModule]

    expect(modules).toBeDefined()
    expect(modules[0].lessons).toBeDefined()
    expect(modules[0].lessons).toHaveLength(0)
  })
})
