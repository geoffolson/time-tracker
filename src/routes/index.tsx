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
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import { Badge } from '#/components/ui/badge'

export const Route = createFileRoute('/')({ component: Home })

const randomColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16)}`

function Home() {
  const newTimeEntryMutation = useMutation(createTimeEntryMutationOptions)
  const timeEntriesQuery = useQuery(getTimeEntriesQueryOptions(new Date()))
  const activeTimeEntryQuery = useQuery(getActiveTimeEntryQueryOptions)
  const tasksQuery = useSuspenseQuery(getTasksQueryOptions)
  const tasksMap: Record<number, Task> = {}
  tasksQuery.data.forEach((task) => {
    tasksMap[task.id!] = task
  })
  const newTaskMutation = useMutation(createTaskMutationOptions)
  const [taskName, setTaskName] = useState('')
  const [taskColor, setTaskColor] = useState(randomColor)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="p-2 h-full w-full max-w-4xl flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Task Tracker</h2>
      <div className="flex gap-4 w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>
              Click on a task to start a time entry for that task.
            </CardDescription>
            <CardAction>
              <Dialog
                open={isDialogOpen}
                onOpenChange={() => {
                  if (isDialogOpen) {
                    setTaskName('')
                    setTaskColor(randomColor())
                  }
                  setIsDialogOpen(!isDialogOpen)
                }}
              >
                <DialogTrigger asChild>
                  <Button size="sm">Add Task</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create a New Task</DialogTitle>
                    <DialogDescription>
                      Enter a name and select a color, then click "Add Task".
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      newTaskMutation.mutate(
                        { name: taskName, color: taskColor },
                        {
                          onSuccess: () => {
                            setTaskName('')
                            setTaskColor(randomColor())
                            setIsDialogOpen(false)
                          },
                        },
                      )
                    }}
                  >
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Task Name</FieldLabel>
                        <Input
                          type="text"
                          placeholder="Task Name"
                          className="p-2 border rounded w-full"
                          onChange={(e) => setTaskName(e.target.value)}
                          value={taskName}
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
                          value={taskColor}
                        />
                        <FieldDescription>
                          Select a color for the task
                        </FieldDescription>
                      </Field>
                    </FieldGroup>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button
                        type="submit"
                        disabled={
                          !taskName || !taskColor || newTaskMutation.isPending
                        }
                      >
                        Add Task
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardAction>
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
                    <Badge variant="translucent">{task.name}</Badge>
                    {activeTimeEntryQuery.data?.taskId === task.id && (
                      <Badge variant="translucent" className="text-sm italic">
                        Active
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
        <Card className="h-full min-w-sm">
          <CardHeader>
            <CardTitle>Today's Aggregates</CardTitle>
          </CardHeader>
          <CardContent className="overflow-y-auto">
            <ul className="flex flex-col gap-2 p-0">
              {tasksQuery.data.map((task) => {
                const totalDuration = timeEntriesQuery.data
                  ?.filter((entry) => entry.taskId === task.id)
                  .reduce((acc, entry) => {
                    const endTime = entry.endTime ? entry.endTime : Date.now()
                    return acc + (endTime - entry.startTime)
                  }, 0)
                return (
                  <li
                    key={task.id}
                    style={{ backgroundColor: task.color || 'black' }}
                    className="p-2 rounded text-shadow-lg"
                  >
                    <Badge variant="translucent">
                      {task.name}: {formatDuration(totalDuration || 0)}
                    </Badge>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
      <div className="h-full flex gap-4 overflow-hidden">
        <Card className="h-full grow">
          <CardHeader>
            <CardTitle>Today's Time Entries</CardTitle>
          </CardHeader>
          <CardContent className="overflow-y-auto">
            <ul className="flex flex-col gap-2 p-0">
              {timeEntriesQuery.data?.map((entry) => (
                <li
                  key={entry.id}
                  style={{
                    backgroundColor: tasksMap[entry.taskId].color || 'black',
                  }}
                  className="p-2 rounded text-shadow-lg"
                >
                  <Badge variant="translucent">
                    {tasksMap[entry.taskId].name || entry.taskId}, Start:{' '}
                    {new Date(entry.startTime).toLocaleString()}, End:{' '}
                    {entry.endTime
                      ? new Date(entry.endTime).toLocaleString()
                      : 'In Progress'}{' '}
                    Duration:{' '}
                    {entry.endTime
                      ? formatDuration(entry.endTime - entry.startTime)
                      : 'In Progress'}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
