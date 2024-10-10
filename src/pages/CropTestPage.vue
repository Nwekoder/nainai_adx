<script setup lang="ts">
import { ref, useTemplateRef } from "vue"
import AuthenticatedLayout from "../components/AuthenticatedLayout.vue"
import Tesseract from "tesseract.js"
import { pb } from "../libs/pocketbase"
import { useRouter } from "vue-router"

const fileInputRef = useTemplateRef("fileInputRef")
const imgPreviewRef = useTemplateRef("imgPreviewRef")
const readyToUpload = ref(false)
const router = useRouter()

const scoreInfo = ref<{
	chart_name: string | null
	difficulty: number | null
	achievement: number | null
	rank: string | null
}>({
	chart_name: null,
	difficulty: null,
	achievement: null,
	rank: null,
})

const imgChartNameRef = useTemplateRef("imgChartNameRef")
const imgDifficultyRef = useTemplateRef("imgDifficultyRef")
const imgAchievementRef = useTemplateRef("imgAchievementRef")
const imgRankRef = useTemplateRef("imgRankRef")

function cropImage(img: HTMLImageElement, x: number, y: number, w: number, h: number) {
	const canvas = document.createElement("canvas")
	const ctx = canvas.getContext("2d")!

	canvas.width = w
	canvas.height = h

	const sourceX = img.width - (x * img.width + w)
	const sourceY = img.height - (y * img.width + h)

	ctx.drawImage(img, sourceX, sourceY, w, h, 0, 0, w, h)

	return canvas.toDataURL("image/png")
}

function handleInputChange() {
	scoreInfo.value = {
		chart_name: null,
		difficulty: null,
		achievement: null,
		rank: null,
	}

	const file = fileInputRef.value!.files![0]

	const image = new Image()
	image.src = URL.createObjectURL(file)

	const croppedImage = new Image()

	image.onload = () => {
		const croppedImageSrc = cropImage(image, 0.025, 0.025, image.width * 0.9, image.height * 0.9)
		imgPreviewRef.value!.src = croppedImageSrc
		croppedImage.src = croppedImageSrc
	}

	croppedImage.onload = async () => {
		const chartNameSrc = cropChartName(croppedImage)
		imgChartNameRef.value!.src = chartNameSrc

		const difficultySrc = cropDifficulty(croppedImage)
		imgDifficultyRef.value!.src = difficultySrc

		// TODO: Crop and show achievement rate and rank

		// Text Recognition Parts
		const chartNameImage = new Image()
		chartNameImage.src = chartNameSrc

		chartNameImage.onload = async () => {
			scoreInfo.value.chart_name = await runOCR(chartNameImage)
		}

		// TODO: Recognize achievement rate and rank

		const difficultyImage = new Image()
		difficultyImage.src = difficultySrc

		difficultyImage.onload = async () => {
			const readedScore = (await runOCR(difficultyImage)).replace(/[^0-9+]+/g, "")
			scoreInfo.value.difficulty = Number(readedScore.endsWith("+") ? readedScore.replace(/[^0-9]+/g, "") + ".5" : readedScore.replace(/[^0-9]+/g, ""))
		}
	}
}

async function runOCR(img: Tesseract.ImageLike) {
	readyToUpload.value = false
	const recognition = await Tesseract.recognize(img, "jpn+eng")
	readyToUpload.value = true

	return recognition.data.text
}

function applySharpenFilter(imageData: ImageData): ImageData {
	const width = imageData.width
	const height = imageData.height
	const data = imageData.data

	// Create a new ImageData object to store the result
	const output = new ImageData(width, height)

	// Define the sharpen kernel
	const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0]

	const kernelSize = Math.sqrt(kernel.length) // Should be 3 for 3x3 kernel

	// Apply convolution
	for (let y = 1; y < height - 1; y++) {
		for (let x = 1; x < width - 1; x++) {
			const idx = (y * width + x) * 4

			let r = 0,
				g = 0,
				b = 0

			// Loop through the kernel
			for (let ky = -1; ky <= 1; ky++) {
				for (let kx = -1; kx <= 1; kx++) {
					const px = x + kx
					const py = y + ky
					const pixelIdx = (py * width + px) * 4

					// Get pixel color
					const weight = kernel[(ky + 1) * kernelSize + (kx + 1)]
					r += data[pixelIdx] * weight
					g += data[pixelIdx + 1] * weight
					b += data[pixelIdx + 2] * weight
				}
			}

			// Set pixel color in the output image
			output.data[idx] = Math.min(Math.max(r, 0), 255) // Red channel
			output.data[idx + 1] = Math.min(Math.max(g, 0), 255) // Green channel
			output.data[idx + 2] = Math.min(Math.max(b, 0), 255) // Blue channel
			output.data[idx + 3] = data[idx + 3] // Alpha channel (unchanged)
		}
	}

	return output
}

function cropChartName(img: HTMLImageElement) {
	const x = img.width * 0
	const y = img.height * 0.077
	const w = img.width * 0.435
	const h = img.height * 0.065

	const canvas = document.createElement("canvas")

	canvas.width = w
	canvas.height = h

	const ctx = canvas.getContext("2d")!

	ctx.filter = "grayscale(100%) contrast(200%) brightness(150%)"
	ctx.drawImage(img, x, y, w, h, 0, 0, w, h)

	const imageData = ctx.getImageData(0, 0, img.width, img.height)
	const sharpenedData = applySharpenFilter(imageData)
	ctx.putImageData(sharpenedData, 0, 0)

	return canvas.toDataURL("image/png")
}

function cropAchievement(img: HTMLImageElement) {
	// TODO: Tune this!
	const x = img.width * 0.345
	const y = img.height * 0.68
	const w = img.width * 0.1375
	const h = img.height * 0.0725

	const canvas = document.createElement("canvas")

	canvas.width = w
	canvas.height = h

	const ctx = canvas.getContext("2d")!

	ctx.filter = "grayscale(100%) contrast(200%) brightness(150%)"
	ctx.drawImage(img, x, y, w, h, 0, 0, w, h)

	const imageData = ctx.getImageData(0, 0, img.width, img.height)
	const sharpenedData = applySharpenFilter(imageData)
	ctx.putImageData(sharpenedData, 0, 0)

	return canvas.toDataURL("image/png")
}

function cropRank(img: HTMLImageElement) {
	// TODO: Tune this!
	const x = img.width * 0.345
	const y = img.height * 0.68
	const w = img.width * 0.1375
	const h = img.height * 0.0725

	const canvas = document.createElement("canvas")

	canvas.width = w
	canvas.height = h

	const ctx = canvas.getContext("2d")!

	ctx.filter = "grayscale(100%) contrast(200%) brightness(150%)"
	ctx.drawImage(img, x, y, w, h, 0, 0, w, h)

	const imageData = ctx.getImageData(0, 0, img.width, img.height)
	const sharpenedData = applySharpenFilter(imageData)
	ctx.putImageData(sharpenedData, 0, 0)

	return canvas.toDataURL("image/png")
}

function cropDifficulty(img: HTMLImageElement) {
	const x = img.width * 0.4975
	const y = img.height * 0.075
	const w = img.width * 0.1
	const h = img.height * 0.075

	const canvas = document.createElement("canvas")

	canvas.width = w
	canvas.height = h

	const ctx = canvas.getContext("2d")!

	ctx.filter = "grayscale(100%) contrast(200%) brightness(150%) blur(1.25px)"
	ctx.drawImage(img, x, y, w, h, 0, 0, w, h)

	const imageData = ctx.getImageData(0, 0, img.width, img.height)
	const sharpenedData = applySharpenFilter(imageData)
	ctx.putImageData(sharpenedData, 0, 0)

	return canvas.toDataURL("image/png")
}

async function uploadScore() {
	if (fileInputRef.value!.files && readyToUpload) {
		const formdata = new FormData()

		formdata.append("player", pb.authStore.model!.id)
		formdata.append("achievement", scoreInfo.value.achievement?.toString() || "")
		formdata.append("chart_name", scoreInfo.value.chart_name?.trim() || "")
		formdata.append("rank", scoreInfo.value.rank?.toUpperCase().trim() || "")
		formdata.append("difficulty", scoreInfo.value.difficulty?.toString() || "")
		formdata.append("score_verified", "false")

		const image = new Image()
		image.src = imgPreviewRef.value!.src

		image.onload = () => {
			const canvas = document.createElement("canvas")
			const ctx = canvas.getContext("2d")!

			canvas.width = image.width
			canvas.height = image.height

			ctx.drawImage(image, 0, 0)
			canvas.toBlob((blob) => {
				if (blob) {
					formdata.append("screenshot", blob)

					pb.collection("scores")
						.create(formdata)
						.then(() => {
							router.push("/scores")
						})
				}
			})
		}
	}
}
</script>

<template>
	<AuthenticatedLayout>
		<div class="grid grid-cols-2 gap-2">
			<div class="p-4">
				<div class="mb-4">
					<label for="fileInput" class="button w-fit bg-neutral-600 text-white hover:bg-neutral-700 block">Upload your score</label>
					<input type="file" class="hidden" id="fileInput" ref="fileInputRef" @change="handleInputChange" />
				</div>

				<img ref="imgPreviewRef" />
			</div>

			<div class="p-4">
				<p>Chart Name : {{ scoreInfo.chart_name }}</p>
				<img ref="imgChartNameRef" class="mb-4" />

				<p>Difficulty : {{ scoreInfo.difficulty }}</p>
				<img ref="imgDifficultyRef" class="mb-4" />

				<p>Achievement Rate : {{ scoreInfo.achievement }}</p>
				<img ref="imgAchievementRef" class="mb-8" />

				<p>Rank : {{ scoreInfo.rank }}</p>
				<img ref="imgRankRef" class="mb-8" />

				<button @click="uploadScore" :disabled="!readyToUpload" type="button" class="button disabled:opacity-50 bg-green-600 w-full text-white hover:bg-green-700">Upload!</button>
			</div>
		</div>
	</AuthenticatedLayout>
</template>
