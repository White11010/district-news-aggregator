<script setup lang="ts">
import { NConfigProvider, NMessageProvider, ruRU, dateRuRU } from 'naive-ui'
import { themeOverrides } from './theme'
</script>

<template>
  <NConfigProvider :locale="ruRU" :date-locale="dateRuRU" :theme-overrides="themeOverrides">
    <NMessageProvider>
      <router-view />
    </NMessageProvider>
  </NConfigProvider>
</template>
