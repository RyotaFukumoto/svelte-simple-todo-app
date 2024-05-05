<script lang="ts">
  import { onMount } from 'svelte';
  import type { Writable } from 'svelte/store';
  import { writable } from 'svelte/store';

  interface Task {
    id: number;
    title: string;
    completed: boolean;
  }

  let tasks: Writable<Task[]> = writable([]);
  let newTaskTitle: string = '';

  onMount(async () => {
    fetchTasks();
  });

  const fetchTasks = async (): Promise<void> => {
    const response = await fetch('http://localhost:3000/tasks');
    const data: Task[] = await response.json();
    tasks.set(data);
  }

	const addTask = async (): Promise<void> => {
    if (!newTaskTitle.trim()) return;
    const response = await fetch('http://localhost:3000/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTaskTitle }),
    });
    if (response.ok) {
      newTaskTitle = '';
      fetchTasks();
    } else {
      console.error('Failed to add task:', await response.text());
    }
	}

  const updateTask = async (task:Task): Promise<void> => {
    const response = await fetch(`http://localhost:3000/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: task.title, completed: !task.completed }),
    });
    if (response.ok) {
      fetchTasks();
    } else {
      console.error('Failed to update task:', await response.text());
    }
  }

  const deleteTask = async (taskId: number): Promise<void> => {
    const response = await fetch(`http://localhost:3000/tasks/${taskId}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      fetchTasks();
    }
  }
</script>

<main>
  <h1>ToDo List</h1>
  <input bind:value={newTaskTitle} on:keyup={(event) => { if (event.key === 'Enter') addTask() }} placeholder="Add new task..." />
  <button on:click={addTask}>Add Task</button>
  <ul>
    {#each $tasks as task (task.id)}
      <li>
        <input type="checkbox" bind:checked={task.completed} on:input={() => updateTask(task)} />
        <input type="text" bind:value={task.title} on:input={() => updateTask(task)} />
        <button on:click={() => deleteTask(task.id)}>Delete</button>
      </li>
    {/each}
  </ul>
</main>

<style>
  main {
    max-width: 600px;
    margin: 40px auto;
    padding: 20px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  input, button {
    margin: 0.5rem 0;
  }
  ul {
    list-style: none;
    padding: 0;
  }
  li {
    margin: 1rem 0;
    align-items: center;
  }
  button {
    margin-left: 12px;
  }
</style>
