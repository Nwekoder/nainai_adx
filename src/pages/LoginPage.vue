<script setup>
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { ClientResponseError } from "pocketbase"
import { pb } from "../libs/pocketbase";

const username = ref("")
const password = ref("")
const viewLoading = ref(true)
const authLoading = ref(false)
const errorMsg = ref(null)
const router = useRouter()

onMounted(() => {
    if(pb.authStore.isValid) {
        router.push('/home')
    }else {
        viewLoading.value = false
    }
})

async function handleLogin() {
	authLoading.value = true

	try {
		await pb.collection("players").authWithPassword(username.value, password.value)

		if (pb.authStore.isValid) {
			router.push("/home")
		}
	} catch (error) {
		authLoading.value = false

		if (error instanceof ClientResponseError) {
			errorMsg.value = error.message
		}

        console.error(error)
	}
}
</script>

<template>
	<div class="flex items-center justify-center min-h-screen p-8">
		<div v-if="!viewLoading" class="w-80 rounded-sm shadow-lg p-4 bg-neutral-50">
			<h1 class="text-xl font-bold mb-2">NaiNai ADX</h1>
			<p class="opacity-70 mb-8">Please login to continue!</p>

			<form @submit.prevent="handleLogin">
				<div class="form-control bg-neutral-50">
					<label for="username">Username</label>
					<input type="text" id="username" v-model="username" required minlength="2" />
				</div>
				<div class="form-control bg-neutral-50">
					<label for="password">Password</label>
					<input type="password" id="password" v-model="password" required minlength="8" />
				</div>

				<button v-if="!authLoading" type="submit" class="button w-full mt-4 hover:bg-slate-900 bg-slate-800 text-neutral-50">Login</button>
				<button v-else disabled type="submit" class="button w-full mt-4 opacity-70 bg-slate-800 text-neutral-50">...</button>
			</form>
		</div>

        <p v-else>Loading...</p>
	</div>
</template>
