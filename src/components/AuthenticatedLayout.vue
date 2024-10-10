<script setup>
import { onMounted, ref } from "vue"
import { validateLogin } from "../libs/pocketbase"
import { useRouter } from "vue-router"
import Navbar from "./Navbar.vue";

const viewLoading = ref(true)
const router = useRouter()

onMounted(() => {
	if (!validateLogin()) {
		router.replace("/")
	} else {
		viewLoading.value = false
	}
})
</script>

<template>
	<div v-if="!viewLoading">
		<Navbar />

		<slot></slot>
	</div>
	<div v-else>Loading....</div>
</template>
