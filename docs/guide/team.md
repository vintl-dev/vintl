---
layout: page
---

<script setup lang="ts">
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers,
  VPTeamPageSection
} from 'vitepress/theme'
import GlobeIcon from '../assets/globe.svg?raw'

function avatar(url, big = false) {
  return `//wsrv.nl/?url=${encodeURIComponent(url)}&output=webp&q=75&w=${big ? 96 : 64}`
}

const coreMembers = [{
  avatar: avatar('https://www.github.com/brawaru.png', true),
  name: 'Brawaru',
  title: 'Silly goose who made this thing',
  desc: '‘Umm... What should I say here?’',
  links: [
    { icon: 'github', link: 'https://github.com/brawaru' },
    { icon: 'mastodon', link: 'https://mstdn.social/@brawaru' }
  ],
  sponsor: 'https://github.com/Brawaru/Brawaru/blob/main/SUPPORT.md'
}]

const acknowledgements = [{
  avatar: avatar('https://www.github.com/modrinth.png'),
  name: 'Modrinth',
  desc: 'This project was created specifically for Modrinth.',
  links: [{
    icon: { svg: `<span style="fill: none; width: 20px; height: 20px; display: flex; align-items: center;">${GlobeIcon}</span>` },
    link: 'https://modrinth.com/'
  }, {
    icon: 'github',
    link: 'https://github.com/modrinth'
  }, {
    icon: 'discord',
    link: 'https://discord.gg/EUHuJHt'
  }]
}, {
  avatar: avatar('https://www.github.com/formatjs.png'),
  name: 'FormatJS',
  desc: 'Creators of @formatjs/intl and other projects that this project uses.',
  links: [{
    icon: { svg: `<span style="fill: none; width: 20px; height: 20px; display: flex; align-items: center;">${GlobeIcon}</span>` },
    link: 'https://formatjs.io/'
  }, {
    icon: 'github',
    link: 'https://github.com/formatjs'
  }]
}, {
  avatar: avatar('https://www.github.com/vuejs.png'),
  name: 'Vue',
  desc: 'Obviously the best framework to ever exist ;)',
  links: [{
    icon: { svg: `<span style="fill: none; width: 20px; height: 20px; display: flex; align-items: center;">${GlobeIcon}</span>` },
    link: 'https://vuejs.org/'
  }, {
    icon: 'github',
    link: 'https://github.com/vuejs'
  }]
}]
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>Our Team</template>
    <template #lead>Jokes on you. There's only me.</template>
  </VPTeamPageTitle>
  <VPTeamMembers size="medium" :members="coreMembers" />
  <VPTeamPageSection>
    <template #title>Acknowledgements</template>
    <template #lead>These collectives helped making this project possible.</template>
    <template #members>
      <VPTeamMembers size="small" :members="acknowledgements.slice(0,2)" />
      <br/>
      <VPTeamMembers size="small" :members="acknowledgements.slice(2)" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
