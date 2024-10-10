<script setup lang="ts">
import { onMounted, ref } from 'vue';
import AuthenticatedLayout from '../components/AuthenticatedLayout.vue';
import { pb } from '../libs/pocketbase';

interface UserProfile {
	username: string,
	dx_rating: number
}

interface Score {
	id: string
	created: string
	screenshot: string
	dx_score: number
	chart_name: string
	score_verified: boolean,
	difficulty: number
}

const userProfile = ref<UserProfile|null>(null)
const userScores = ref<Score[]>([])

function calculateTotalScore() {
	let tmp: Score[] = []

	// Group scores by chart_name and take the one with the highest dx_score
	userScores.value.forEach(score => {
		const existingScore = tmp.find(s => s.chart_name === score.chart_name)
		if (existingScore) {
			// Replace if the current score has a higher dx_score
			if (score.dx_score > existingScore.dx_score) {
				existingScore.dx_score = score.dx_score
			}
		} else {
			tmp.push(score)
		}
	})

	// Sum all dx_score from tmp and return the value
	const totalScore = tmp.reduce((acc, score) => acc + score.dx_score, 0)
	userScores.value = tmp
	return totalScore
}

async function calculateDXRating() {
	let tmp = 0
	
	userScores.value.sort((a, b) => b.dx_score - a.dx_score).slice(0, userScores.value.length >= 15 ? 15 : userScores.value.length).forEach(score => {
		const calculated = (score.dx_score + (score.difficulty * 220)) / (userScores.value.length >= 15 ? 15 : userScores.value.length)
		tmp += (calculated)
	})

	userProfile.value!.dx_rating = Number(tmp.toFixed(0) || "0")

	if(pb.authStore.model!.dx_rating != userProfile.value!.dx_rating) {
		await pb.collection('players').update(pb.authStore.model!.id, {
			"dx_rating": userProfile.value!.dx_rating
		})
	}
}

onMounted(async () => {
	const all_scores = await pb.collection('scores').getFullList<Score>({
		filter: `score_verified = true && player = "${pb.authStore.model!.id}"`
	})
	
	userScores.value = all_scores
	
	userProfile.value = {
		username: pb.authStore.model!.username,
		dx_rating: pb.authStore.model!.dx_rating
	}

	calculateDXRating()
})

</script>

<template>
	<AuthenticatedLayout>
		<div class="flex items-center justify-center w-full h-screen">
			<div class="md:w-2/3 w-11/12 border p-4 rounded-md" v-if="userProfile">
				<h1 class="text-xl font-medium mb-4">{{ userProfile.username }}</h1>

				<div class="grid grid-cols-1 lg:grid-cols-3 gap-2">
					<div class="px-4 py-2 rounded-md bg-slate-600 text-white">
						<h3 class="text-lg mb-4">Scores Calculated</h3>
						<p class="text-3xl font-bold text-right">{{ userScores.length }}</p>
					</div>
					<div class="px-4 py-2 rounded-md bg-orange-600 text-white">
						<h3 class="text-lg mb-4">Rating</h3>
						<p class="text-3xl font-bold text-right">{{ userProfile.dx_rating }}</p>
					</div>
					<div class="px-4 py-2 rounded-md bg-blue-600 text-white">
						<h3 class="text-lg mb-4">Total Score</h3>
						<p class="text-3xl font-bold text-right">{{ calculateTotalScore() }}</p>
					</div>
				</div>
			</div>
		</div>
	</AuthenticatedLayout>
</template>
