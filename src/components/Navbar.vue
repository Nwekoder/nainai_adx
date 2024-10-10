<script setup>
import { onMounted, ref } from "vue"
import { pb } from "../libs/pocketbase"
import { useRouter } from "vue-router"

const navbarOpen = ref(false)
const username = ref("")
const router = useRouter()

onMounted(() => {
	username.value = pb.authStore.model.username
})

function toggleNavbar() {
	navbarOpen.value = !navbarOpen.value
}

function handleLogout() {
	pb.authStore.clear()
	router.replace("/")
}
</script>

<template>
	<nav class="h-14 sticky top-0 left-0 w-full flex items-center shadow-lg bg-white z-50">
		<div class="w-11/12 mx-auto flex items-center justify-between">
			<button @click="toggleNavbar" class="border p-2 aspect-square" type="button">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
					<path
						fill-rule="evenodd"
						d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>

			<div class="flex gap-4 items-center">
				<p class="text-sm">Hello, {{ username }}</p>

				<button type="button" @click="handleLogout" class="button bg-red-600 text-neutral-50 text-xs flex gap-1.5 items-center">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4">
						<path
							fill-rule="evenodd"
							d="M17 4.25A2.25 2.25 0 0 0 14.75 2h-5.5A2.25 2.25 0 0 0 7 4.25v2a.75.75 0 0 0 1.5 0v-2a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 .75.75v11.5a.75.75 0 0 1-.75.75h-5.5a.75.75 0 0 1-.75-.75v-2a.75.75 0 0 0-1.5 0v2A2.25 2.25 0 0 0 9.25 18h5.5A2.25 2.25 0 0 0 17 15.75V4.25Z"
							clip-rule="evenodd"
						/>
						<path
							fill-rule="evenodd"
							d="M14 10a.75.75 0 0 0-.75-.75H3.704l1.048-.943a.75.75 0 1 0-1.004-1.114l-2.5 2.25a.75.75 0 0 0 0 1.114l2.5 2.25a.75.75 0 1 0 1.004-1.114l-1.048-.943h9.546A.75.75 0 0 0 14 10Z"
							clip-rule="evenodd"
						/>
					</svg>

					Logout
				</button>
			</div>
		</div>
	</nav>

	<Transition name="overlay">
		<div class="fixed top-0 left-0 w-full h-screen bg-neutral-950 bg-opacity-25 backdrop-blur-sm z-50" v-if="navbarOpen">
			<div class="fixed top-0 left-0 w-1/2 lg:w-1/5 bg-neutral-50 h-screen overflow-y-auto" v-if="navbarOpen">
				<div class="flex items-center h-14 justify-end px-4 w-full sticky top-0 left-0 shadow-lg">
					<button @click="toggleNavbar" type="button" class="border p-2 aspect-square">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
							<path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
						</svg>
					</button>
				</div>

				<div class="flex flex-col">
					<RouterLink to="/home" class="transition-colors hover:bg-neutral-300 px-3 py-2">Home</RouterLink>
					<RouterLink to="/profile" class="transition-colors hover:bg-neutral-300 px-3 py-2">Profile</RouterLink>
					<RouterLink to="/scores" class="transition-colors hover:bg-neutral-300 px-3 py-2">Scores</RouterLink>
					<RouterLink to="/croptest" class="transition-colors hover:bg-neutral-300 px-3 py-2">CropTest</RouterLink>
				</div>
			</div>
		</div>
	</Transition>
</template>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
	transition: opacity 0.15s ease-out;
}

.overlay-enter-from,
.overlay-leave-to {
	opacity: 0;
}
</style>
