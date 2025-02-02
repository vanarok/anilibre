<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

interface AnimeResult {
  id: number
  code: string
  names: string[]
  poster: string
  description: string
  genres: string[]
  year: string
  status: string
}
const { searchQuery } = useSearch()

const searchResults = ref<AnimeResult[]>([])
const loading = ref(false)
const showResults = ref(false)

const route = useRoute()
const animeDetails = ref<AnimeResult | null>(null)
const loadingDetails = ref(false)

let searchTimeout: NodeJS.Timeout

watch(searchQuery, () => {
  searchAnime()
})

async function searchAnime() {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    loading.value = true
    showResults.value = true

    try {
      const { data } = await useFetch('/api/search', {
        query: {
          search: searchQuery.value
        }
      })

      if (data.value?.status) {
        searchResults.value = data.value.data || []
      } else {
        searchResults.value = []
      }
    } catch (error) {
      console.error('Ошибка при поиске:', error)
      searchResults.value = []
    } finally {
      loading.value = false
    }
  }, 300)
}
</script>

<template>
  <Transition name="swing" mode="out-in">
    <v-container :key="searchResults.length ? 'results' : 'no-results'">
      <v-row>
          <v-col v-for="anime in searchResults" :key="anime.id" cols="4">
            <v-card :key="anime.id" :to="`/anime/${anime.id}`" @click="showResults = false" height="400" variant="tonal">
              <v-img :src="`https://www.anilibria.tv${anime.poster}`" height="300" cover />
              <v-card-title class="text-truncate text-body-1 pa-2">
                {{ anime.names[0] }}
              </v-card-title>
              <v-card-subtitle class="text-truncate text-body-2 px-2 pb-2">
                {{ anime.names[1] }}
              </v-card-subtitle>
            </v-card>
          </v-col>
      </v-row>
    </v-container>
  </Transition>
</template>

<style scoped>
.swing-enter-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.swing-enter-from {
  transform: scale(0.2);
}

.swing-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.swing-leave-to {
  transform: scale(0.2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>