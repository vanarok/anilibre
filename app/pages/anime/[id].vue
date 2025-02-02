<script setup lang="ts">
import { mdiArrowLeftBold, mdiArrowRightBold, mdiPlayCircle } from '@mdi/js'
import type Hls from 'hls.js'
import { nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

interface AnimeResult {
  id: number
  code: string
  names: {
    ru: string
    en: string
    alternative: string | null
  }
  posters: {
    small: {
      url: string
    }
    medium: {
      url: string
    }
    original: {
      url: string
    }
  }
  description: string
  player: {
    host: string
    list: {
      [key: string]: {
        episode: number
        hls: {
          fhd: string
          hd: string
          sd: string
        }
      }
    }
  }
}

const route = useRoute()
const animeDetails = ref<AnimeResult | null>(null)
const loading = ref(false)
const currentEpisode = ref(0)
const videoQuality = ref<'fhd' | 'hd'>('fhd')
const videoElement = ref<HTMLVideoElement | null>(null)

const player = ref<Plyr | null>(null)
const hls = ref<Hls | null>(null)

// Добавляем утилиту для проверки клиентского окружения
const isClient = typeof window !== 'undefined'

// Модифицируем функции для работы с localStorage
function saveCurrentEpisode(episode: number) {
  if (!isClient) return
  
  const animeId = route.params.id
  localStorage.setItem(`anime_${animeId}_episode`, episode.toString())
}

function loadSavedEpisode(): number {
  if (!isClient) return 0
  
  const animeId = route.params.id
  const savedEpisode = localStorage.getItem(`anime_${animeId}_episode`)
  return savedEpisode ? parseInt(savedEpisode) : 0
}

async function loadAnimeDetails() {
  const id = route.params.id
  if (!id) return

  loading.value = true
  try {
    const response = await fetch(`/api/anime/${id}`)
    const data = await response.json()
    animeDetails.value = data
    
    // Загружаем сохраненную серию только на клиенте
    if (isClient) {
      currentEpisode.value = loadSavedEpisode()
    }
  } catch (error) {
    console.error('Ошибка при загрузке деталей:', error)
  } finally {
    loading.value = false
  }
}

const initializeVideoPlayer = async () => {
  if (!isClient) return
  
  await nextTick()
  
  if (!videoElement.value || !animeDetails.value) return

  if (!document.body.contains(videoElement.value)) {
    console.warn('Video element is not in DOM')
    return
  }

  try {
    // Динамически импортируем Plyr и его стили
    const { default: Plyr } = await import('plyr')
    const { default: Hls } = await import('hls.js')
    await import('plyr/dist/plyr.css')

    const episodeKey = Object.keys(animeDetails.value.player.list)[currentEpisode.value]
    const videoUrl = `/api/anime/${route.params.id}/stream?episode=${episodeKey}&quality=${videoQuality.value}`

    // Создаем новый плеер
    player.value = new Plyr(videoElement.value, {
      controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'duration',
        'mute',
        'volume',
        'settings',
        'fullscreen'
      ],
      settings: ['speed'],
    })

    // Настраиваем HLS
    if (Hls.isSupported()) {
      hls.value = new Hls()
      hls.value.loadSource(videoUrl)
      hls.value.attachMedia(videoElement.value)
      

      // Обработка ошибок HLS
      hls.value.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('HLS network error')
              hls.value?.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('HLS media error')
              hls.value?.recoverMediaError()
              break
            default:
              console.error('HLS fatal error')
              break
          }
        }
      })
    }
    // Для браузеров с нативной поддержкой HLS
    else if (videoElement.value.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.value.src = videoUrl
    }

  } catch (error) {
    console.error('Error initializing video player:', error)
  }
}

const changeEpisode = async (index: number) => {
  currentEpisode.value = index
  saveCurrentEpisode(index)

  if (!player.value || !animeDetails.value) return

  try {
    const episodeKey = Object.keys(animeDetails.value.player.list)[index]
    const videoUrl = `/api/anime/${route.params.id}/stream?episode=${episodeKey}&quality=${videoQuality.value}`

    if (hls.value) {
      hls.value.loadSource(videoUrl)
    }
 
  } catch (error) {
    console.error('Error changing episode:', error)
  }
}

function changeQuality(quality: 'fhd' | 'hd') {
  videoQuality.value = quality
  if (player.value && animeDetails.value) {
    const episodeKey = Object.keys(animeDetails.value.player.list)[currentEpisode.value]
    const videoUrl = `/api/anime/${route.params.id}/stream?episode=${episodeKey}&quality=${quality}`
    
    if (hls.value) {
      hls.value.loadSource(videoUrl)
    }
  }
}

onMounted(async () => {
  await loadAnimeDetails()
  // Инициализируем плеер только после загрузки деталей
  if (animeDetails.value && isClient) {
    await initializeVideoPlayer()
  }
})

// Следим за изменениями animeDetails для переинициализации плеера при необходимости
watch(animeDetails, async () => {
  if (isClient && animeDetails.value) {
    await initializeVideoPlayer()
  }
})
</script>

<template>
  <v-container>
    <v-row v-if="animeDetails">
      <v-col cols="12" md="4">
        <v-img
          :src="`https://anilibria.tv${animeDetails.posters.original.url}`"
          height="400"
          cover
        />
      </v-col>
      <v-col cols="12" md="8">
        <h1>{{ animeDetails.names.ru }}</h1>
        <p>{{ animeDetails.description }}</p>
      </v-col>
      
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <div class="video-container">
              <video 
                ref="videoElement"
                crossorigin="anonymous"
                playsinline
                controls
              ></video>
            </div>
            
            <div class="video-controls d-flex align-center justify-space-between pa-4">
              <div class="d-flex align-center">
                <span class="text-h6 mr-4">
                  Серия {{ currentEpisode + 1 }} из {{ Object.keys(animeDetails.player.list).length }}
                </span>
                
                <v-btn-group>
                  <v-btn
                    :disabled="currentEpisode === 0"
                    @click="changeEpisode(currentEpisode - 1)"
                  >
                    <v-icon :icon="mdiArrowLeftBold" size="xx-large" />
                    <v-tooltip activator="parent" location="top">
                      Предыдущая серия
                    </v-tooltip>
                  </v-btn>
                  
                  <v-btn
                    :disabled="currentEpisode >= Object.keys(animeDetails.player.list).length - 1"
                    @click="changeEpisode(currentEpisode + 1)"
                  >
                    <v-icon :icon="mdiArrowRightBold" size="xx-large" />
                    <v-tooltip activator="parent" location="top">
                      Следующая серия
                    </v-tooltip>
                  </v-btn>
                </v-btn-group>
              </div>

              <div>
                <v-btn-group>
                  <v-btn
                    :color="videoQuality === 'fhd' ? 'primary' : ''"
                    size="small"
                    @click="changeQuality('fhd')"
                  >
                    FHD
                  </v-btn>
                  <v-btn
                    :color="videoQuality === 'hd' ? 'primary' : ''"
                    size="small"
                    @click="changeQuality('hd')"
                  >
                    HD
                  </v-btn>
                </v-btn-group>
              </div>
            </div>
            
            <!-- Добавляем список серий -->
            <div class="episodes-section mt-4">
              <div class="d-flex align-center mb-4">
                <h2 class="text-h5">Серии</h2>
                <v-spacer></v-spacer>
                <span class="text-body-2">{{ Object.keys(animeDetails.player.list).length }} серий</span>
              </div>
              
              <v-row>
                <v-col 
                  v-for="(episode, index) in Object.keys(animeDetails.player.list)" 
                  :key="index"
                  cols="12"
                  sm="6"
                  md="4"
                  lg="3"
                >
                  <v-card
                    :class="[
                      'episode-card',
                      currentEpisode === index ? 'episode-card--active' : ''
                    ]"
                    @click="changeEpisode(index)"
                    variant="outlined"
                    height="100"
                  >
                    <v-card-text class="d-flex align-center pa-4">
                      <div class="episode-number mr-4">
                        {{ index + 1 }}
                      </div>
                      <div class="episode-info flex-grow-1">
                        <div class="text-body-1 font-weight-medium">
                          Серия {{ index + 1 }}
                        </div>
                        <div 
                          v-if="currentEpisode === index"
                          class="text-caption text-primary"
                        >
                          Сейчас смотрите
                        </div>
                      </div>
                      <v-icon
                        v-if="currentEpisode === index"
                        color="primary"
                        :icon="mdiPlayCircle"
                        size="large"
                      ></v-icon>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col cols="12" class="text-center">
        <v-progress-circular
          v-if="loading"
          indeterminate
          color="primary"
        />
        <p v-else>Аниме не найдено</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
/* Контейнер для видео с фиксированной высотой */
.video-container {
  position: relative;
  width: 100%;
  height: 600px; /* Фиксированная высота */
  background: #000;
}

/* Стили для видео внутри контейнера */
.video-container video {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Сохраняет пропорции видео */
}

/* Стили для Plyr */
:deep(.plyr) {
  width: 100%;
  height: 100%;
  --plyr-color-main: rgb(var(--v-theme-primary));
}

.video-controls {
  background: rgba(0, 0, 0, 0.05);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

:deep(.v-btn--icon) {
  border-radius: 50%;
}

.episode-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.episode-card:hover {
  transform: scale(1.02);
  background: rgba(0, 0, 0, 0.05);
}

.episode-card--active {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.05);
}

.episode-number {
  font-size: 24px;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.7);
  min-width: 40px;
}

.episodes-section {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 16px;
}
</style> 