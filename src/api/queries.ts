import { queryOptions, mutationOptions } from '@tanstack/react-query'
import { db } from './db'
import { queryClient } from '#/main'

export const getTimeEntriesQueryOptions = queryOptions({
  queryKey: ['timeEntries'],
  queryFn: async () => {
    return db.timeEntries.toArray()
  },
})

export const createTimeEntryMutationOptions = mutationOptions({
  mutationFn: async (taskId: number) => {
    const now = Date.now()
    const endTimes = await db.timeEntries
      .where('status')
      .equals('active')
      .and((entry) => entry.startTime < now)
      .toArray()
    await Promise.all(
      endTimes.map((entry) =>
        db.timeEntries.update(entry.id!, { endTime: now, status: 'inactive' }),
      ),
    )
    await db.timeEntries.add({
      taskId,
      startTime: now,
      endTime: null,
      status: 'active',
    })
    queryClient.invalidateQueries({
      queryKey: getTimeEntriesQueryOptions.queryKey,
    })
  },
})

export const createTaskMutationOptions = mutationOptions({
  mutationFn: async (body: { name: string; color: string }) => {
    await db.tasks.add({
      name: body.name,
      color: body.color,
      createdAt: Date.now(),
    })
  },
})

export const getTasksQueryOptions = queryOptions({
  queryKey: ['tasks'],
  queryFn: async () => {
    return db.tasks.toArray()
  },
})
