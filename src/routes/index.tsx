import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  createTaskMutationOptions,
  createTimeEntryMutationOptions,
  getActiveTimeEntryQueryOptions,
  getTasksQueryOptions,
  getTimeEntriesQueryOptions,
} from '../api/queries'
import { useState } from 'react'
import type { Task } from '#/api/db'
import { formatDuration } from '#/utils'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Field, FieldDescription, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const newTimeEntryMutation = useMutation(createTimeEntryMutationOptions)
  const timeEntriesQuery = useQuery(getTimeEntriesQueryOptions(new Date()))
  const activeTimeEntryQuery = useQuery(getActiveTimeEntryQueryOptions)
  activeTimeEntryQuery.data?.taskId &&
    console.log(
      'Active time entry for task ID:',
      activeTimeEntryQuery.data.taskId,
    )
  const tasksQuery = useSuspenseQuery(getTasksQueryOptions)
  const tasksMap: Record<number, Task> = {}
  tasksQuery.data.forEach((task) => {
    tasksMap[task.id!] = task
  })
  const newTaskMutation = useMutation(createTaskMutationOptions)
  const [taskName, setTaskName] = useState('')
  const [taskColor, setTaskColor] = useState('')

  return (
    <div className="p-2 h-full w-full max-w-4xl flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Time Tracker</h2>
      <div className="flex gap-4 w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>
              Click on a task to start a time entry for that task.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="pt-0">
              <ul className="p-0">
                {tasksQuery.data.map((task) => (
                  <li
                    key={task.id}
                    style={{ backgroundColor: task.color || 'transparent' }}
                    className={`flex justify-between p-2 rounded mb-2 cursor-pointer border-3 ${activeTimeEntryQuery.data?.taskId === task.id ? 'border-white' : ''}`}
                    onClick={() => newTimeEntryMutation.mutate(task.id!)}
                  >
                    <div className="text-shadow-lg">{task.name}</div>
                    {activeTimeEntryQuery.data?.taskId === task.id && (
                      <span className="text-sm italic text-shadow-lg">
                        Active
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Create New Task</CardTitle>
            <CardDescription>
              Enter a name and select a color, then click "Add Task". Click on a
              task to start a time entry for that task.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Field>
              <FieldLabel>Task Name</FieldLabel>
              <Input
                type="text"
                placeholder="Task Name"
                className="p-2 border rounded w-full"
                onChange={(e) => setTaskName(e.target.value)}
              />
              <FieldDescription>
                Provide a unique name for the task
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Task Color</FieldLabel>
              <Input
                type="color"
                placeholder="Task Color"
                onChange={(e) => setTaskColor(e.target.value)}
              />
              <FieldDescription>Select a color for the task</FieldDescription>
            </Field>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() =>
                newTaskMutation.mutate({ name: taskName, color: taskColor })
              }
              disabled={!taskName || !taskColor}
            >
              Add Task
            </Button>
          </CardFooter>
        </Card>
      </div>
      <Card className='overflow-y-auto h-full'>
        <CardHeader>
          <CardTitle>Today's Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  )
}
