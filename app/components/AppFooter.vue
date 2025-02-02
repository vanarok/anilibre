<script setup lang="ts">
import { mdiChat, mdiGithub } from '@mdi/js';

const items = shallowRef([
  {
    title: 'Anilibre GitHub',
    icon: mdiGithub,
    href: 'https://github.com/vanarok/anilibre',
  },
  {
    title: 'Anilibre Telegram',
    icon: mdiChat,
    href: 'https://t.me/vanarok',
  }
])
</script>

<template>
  <v-footer height="40" app>
    <NuxtLink
      v-for="item in items"
      :key="item.title"
      :href="item.href"
      :title="item.title"
      class="d-inline-block mx-2 social-link"
      rel="noopener noreferrer"
      target="_blank"
    >
      <v-icon
        :icon="item.icon"
        :size="item.icon === '$vuetify' ? 24 : 16"
      />
    </NuxtLink>

    <div
      class="text-caption text-disabled"
      style="position: absolute; right: 16px;"
    >
      &copy; {{ (new Date()).getFullYear() }} <span class="d-none d-sm-inline-block">created by <a href="https://t.me/vanarok">vanarok</a></span>
    </div>
  </v-footer>
</template>

<style scoped lang="sass">
  .social-link :deep(.v-icon)
    color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity))
    text-decoration: none
    transition: .2s ease-in-out

    &:hover
      color: rgba(25, 118, 210, 1)
</style>
