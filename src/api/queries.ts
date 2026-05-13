import { queryOptions, mutationOptions } from '@tanstack/react-query'
import { db } from './db'
import { queryClient } from '#/main'

export const getTimeEntriesQueryOptions = (date: Date) => {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  return queryOptions({
    queryKey: ['timeEntries', start],
    queryFn: async () => {
      return db.timeEntries
        .where('startTime')
        .between(start.getTime(), end.getTime(), true, false)
        .toArray()
    },
  })
}

export const getActiveTimeEntryQueryOptions = queryOptions({
  queryKey: ['activeTimeEntry'],
  queryFn: async () => {
    const activeTimeEntry = await db.timeEntries
      .where('status')
      .equals('active')
      .first()
    return activeTimeEntry ?? null
  },
})

export const createTimeEntryMutationOptions = mutationOptions({
  mutationFn: async (taskId: number) => {
    const now = Date.now()
    const task = await db.timeEntries
      .where('taskId')
      .equals(taskId)
      .and((entry) => entry.status === 'active')
      .first()
    if (task) {
      await db.timeEntries.update(task.id!, {
        endTime: now,
        status: 'inactive',
      })
      queryClient.invalidateQueries()
    } else {
      const endTimes = await db.timeEntries
        .where('status')
        .equals('active')
        .and((entry) => entry.startTime < now)
        .toArray()
      await Promise.all(
        endTimes.map((entry) =>
          db.timeEntries.update(entry.id!, {
            endTime: now,
            status: 'inactive',
          }),
        ),
      )
      await db.timeEntries.add({
        taskId,
        startTime: now,
        endTime: null,
        status: 'active',
      })
      queryClient.invalidateQueries()
    }
  },
})

export const createTaskMutationOptions = mutationOptions({
  mutationFn: async (body: { name: string; color: string }) => {
    await db.tasks.add({
      name: body.name,
      color: body.color,
      createdAt: Date.now(),
    })
    queryClient.invalidateQueries()
  },
})

export const getTasksQueryOptions = queryOptions({
  queryKey: ['tasks'],
  queryFn: async () => {
    return db.tasks.toArray()
  },
})
