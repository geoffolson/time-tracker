import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  createTaskMutationOptions,
  createTimeEntryMutationOptions,
  getTasksQueryOptions,
  getTimeEntriesQueryOptions,
} from '../api/queries'
import { useState } from 'react'
import type { Task } from '#/api/db'
import { formatDuration } from '#/utils'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const newTimeEntryMutation = useMutation(createTimeEntryMutationOptions)
  const timeEntriesQuery = useQuery(getTimeEntriesQueryOptions)
  const tasksQuery = useSuspenseQuery(getTasksQueryOptions)
  const tasksMap: Record<number, Task> = {}
  tasksQuery.data.forEach((task) => {
    tasksMap[task.id!] = task
  })
  const newTaskMutation = useMutation(createTaskMutationOptions)
  const [taskName, setTaskName] = useState('')
  const [taskColor, setTaskColor] = useState('')

  return (
    // give it a good dark mode background color
    <div className="p-8 bg-gray-900 text-gray-500 h-full">
      <h1 className="text-4xl font-bold">Time Tracker</h1>
      <div className="flex items-center gap-3 pt-2">
        <input
          type="text"
          placeholder="Task Name"
          className="p-2 border rounded w-full"
          onChange={(e) => setTaskName(e.target.value)}
        />
        <input
          type="color"
          placeholder="Task Color"
          className="w-20 h-10 p-0 cursor-pointer"
          onChange={(e) => setTaskColor(e.target.value)}
        />
        <button
          onClick={() =>
            newTaskMutation.mutate({ name: taskName, color: taskColor })
          }
          className="w-48 p-2 bg-blue-500 text-white rounded"
        >
          Add Task
        </button>
      </div>
      <br />
      <div className="pt-0">
        <ul className="p-0">
          {tasksQuery.data.map((task) => (
            <li
              key={task.id}
              style={{ backgroundColor: task.color || 'transparent' }}
              className="p-2 rounded mb-2 cursor-pointer"
              onClick={() => newTimeEntryMutation.mutate(task.id!)}
            >
              {task.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <h2 className="text-2xl font-bold">Time Entries</h2>
        <ul className="flex flex-col gap-2 p-0">
          {timeEntriesQuery.data?.map((entry) => (
            <li
              key={entry.id}
              style={{
                backgroundColor: tasksMap[entry.taskId].color || 'black',
              }}
              className="p-2 rounded"
            >
              Task: {tasksMap[entry.taskId].name || entry.taskId}, Start:{' '}
              {new Date(entry.startTime).toLocaleString()}, End:{' '}
              {entry.endTime
                ? new Date(entry.endTime).toLocaleString()
                : 'In Progress'}{' '}
              Duration:{' '}
              {entry.endTime
                ? formatDuration(entry.endTime - entry.startTime)
                : 'In Progress'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
