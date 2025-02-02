<template>
  <v-app theme="light">
    <v-app-bar height="80" flat>
      <v-container max-width="1000" width="1000">
        <v-row no-gutters>
          <v-col class="d-flex justify-center align-center">
            <v-app-bar-title class="text-h4 font-weight-black text-center ">
              <NuxtLink to="/">AniLibre</NuxtLink>
            </v-app-bar-title>
          </v-col>
          <v-col cols="9">
            <v-text-field 
              v-model="searchQuery"
              :placeholder="searchInputPlaceholder" 
              clearable 
              hide-details
              variant="outlined" 
              :append-inner-icon="mdiMagnify"
              @update:model-value="handleSearch"
              @click:clear="clearSearch"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-app-bar>
    <v-main width="1000" class="mx-auto">
      <v-container>
        <v-row justify="center">
          <v-col cols="12">
            <NuxtPage />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    <AppFooter />
  </v-app>
</template>

<script setup lang="ts">
import { mdiMagnify } from '@mdi/js';
import { useRoute, useRouter } from 'vue-router';
import { useSearch } from '~/composables/useSearch';

const router = useRouter()
const route = useRoute()
const { searchQuery } = useSearch()
const searchInputPlaceholder = ref('Поиск аниме')

const handleSearch = () => {
  if (route.path !== '/') {
    router.push('/')
  }
}

const clearSearch = () => {
  searchQuery.value = ''
}
</script>
