<script setup lang="ts">
import { onMounted, ref } from "vue"
import AuthenticatedLayout from "../components/AuthenticatedLayout.vue"
import { pb } from "../libs/pocketbase"

interface Score {
	id: string
	created: string
	screenshot: string
	achievement: number
	rank: string
	chart_name: string
	score_verified: boolean
}

const scores = ref<Score[]>([])

onMounted(async () => {
	try {
		const getScores = await pb.collection("scores").getFullList<Score>({
			filter: `player = "${pb.authStore.model!.id}"`
		})
	
		scores.value = getScores.map(s => {
			const ss = pb.files.getUrl(s, s.screenshot)
	
			return {...s, screenshot: ss}
		})
	} catch (error) {
		if(error instanceof Error) {
			console.error(error)
		}
	}
})
</script>

<template>
	<AuthenticatedLayout>
		<div class="w-11/12 py-4 mx-auto">
			<div class="flex items-center justify-between">
				<h1 class="text-2xl font-bold mb-8">Scores</h1>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
				<div v-for="score in scores" :key="score.id" class="rounded-md overflow-hidden max-h-56">
					<img :src="score.screenshot" :alt="score.id" class="w-full h-1/2 object-cover object-center">
					
					<div class="flex flex-col w-full bg-slate-800 text-white p-4 h-1/2 justify-center">
						<small class="opacity-75">{{ (new Date(score.created)).toLocaleString('id') }}</small>
						<h5 class="font-bold text-lg mb-2">{{ score.chart_name }} <span :class="score.score_verified ? 'opacity-100 text-[8px] px-1.5 py-0.5 rounded-full bg-green-600' : 'opacity-60 text-[8px] px-1.5 py-0.5 rounded-full bg-red-600'">{{ score.score_verified ? 'Verified' : 'Unverified'}}</span></h5>

						<p class="ml-auto text-3xl font-bold mt-auto">{{ score.achievement }}</p>
					</div>
				</div>
			</div>
		</div>
	</AuthenticatedLayout>
</template>
