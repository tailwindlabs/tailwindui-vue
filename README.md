# @tailwindui/vue

**This project is still in a pre-alpha state and could change dramatically at any time. Not for production.**

A set of completely unstyled, fully accessible UI components for Vue.js, designed to integrate beautifully with Tailwind CSS.

You bring the styles and the markup, we handle all of the complex keyboard interactions and ARIA management.

## Installation

```sh
# npm
npm install @tailwindui/vue

# Yarn
yarn add @tailwindui/vue
```

## Usage

### Listbox

Basic example:

```html
<template>
  <Listbox v-model="selectedWrestler" v-slot="{ isOpen }">
    <ListboxLabel class="sr-only">
      Select a wrestler:
    </ListboxLabel>
    <ListboxButton class="rounded p-3 border">
      {{ selectedWrestler }}
    </ListboxButton>
    <ListboxList v-show="isOpen">
      <ListboxOption
        v-for="wrestler in wrestlers"
        :key="wrestler"
        :value="wrestler"
        v-slot="{ isActive, isSelected }"
      >
        <div class="p-3" :class="isActive ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'">
          {{ wrestler }}
          <img v-show="isSelected" src="/checkmark.svg">
        </div>
      </ListboxOption>
    </ListboxList>
  </Listbox>
</template>

<script>
  import { Listbox, ListboxLabel, ListboxButton, ListboxList, ListboxOption } from '@tailwindui/vue'

  export default {
    components: {
      Listbox,
      ListboxLabel,
      ListboxButton,
      ListboxList,
      ListboxOption,
    },
    data() {
      return {
        selectedWrestler: 'The Ultimate Warrior',
        wrestlers: [
          'The Ultimate Warrior',
          'Randy Savage',
          'Hulk Hogan',
          'Bret Hart',
          'The Undertaker',
          'Mr. Perfect',
          'Ted DiBiase',
          'Bam Bam Bigelow',
          'Yokozuna',
        ]
      }
    }
  }
</script>
```

### Multi Select Listbox

Basic example:

```html
<template>
  <Listbox v-model="selectedWrestlers" v-slot="{ isOpen }" multiple>
    <ListboxLabel class="sr-only">
      Select a wrestler:
    </ListboxLabel>
    <ListboxButton class="rounded p-3 border">
      {{ selectedWrestlers.join(', ') }}
    </ListboxButton>
    <ListboxList v-show="isOpen">
      <ListboxOption
        v-for="wrestler in wrestlers"
        :key="wrestler"
        :value="wrestler"
        v-slot="{ isActive, isSelected }"
      >
        <div class="p-3" :class="isActive ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'">
          {{ wrestler }}
          <img v-show="isSelected" src="/checkmark.svg">
        </div>
      </ListboxOption>
    </ListboxList>
  </Listbox>
</template>

<script>
  import { Listbox, ListboxLabel, ListboxButton, ListboxList, ListboxOption } from '@tailwindui/vue'

  export default {
    components: {
      Listbox,
      ListboxLabel,
      ListboxButton,
      ListboxList,
      ListboxOption,
    },
    data() {
      return {
        selectedWrestlers: ['The Ultimate Warrior'],
        wrestlers: [
          'The Ultimate Warrior',
          'Randy Savage',
          'Hulk Hogan',
          'Bret Hart',
          'The Undertaker',
          'Mr. Perfect',
          'Ted DiBiase',
          'Bam Bam Bigelow',
          'Yokozuna',
        ]
      }
    }
  }
</script>
```
