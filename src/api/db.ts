import type { Table } from 'dexie'
import { Dexie } from 'dexie'

export interface TimeEntry {
  id?: number
  taskId: number
  startTime: number
  endTime: number | null
  status: 'active' | 'inactive'
}

export interface Task {
  id?: number
  name: string
  createdAt: number
  archivedAt?: number | null
  color?: string
}

class MyDatabase extends Dexie {
  tasks!: Table<Task, number>
  timeEntries!: Table<TimeEntry, number>

  constructor() {
    super('MyDatabase')

    this.version(1).stores({
      tasks: `
        ++id,
        name,
        createdAt,
        archivedAt,
        color
      `,
      timeEntries: `
        ++id,
        taskId,
        startTime,
        endTime,
        status,
        [taskId+startTime]
      `,
    })
  }
}

export const db = new MyDatabase()
