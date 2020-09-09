<template>
  <div class="flex justify-center w-screen h-full p-12 bg-gray-50">
    <div class="relative inline-block text-left">
      <Menu>
        <span class="rounded-md shadow-sm">
          <Menu.Button
            class="inline-flex justify-center w-full px-4 py-2 text-sm font-medium leading-5 text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800"
          >
            <span>Options</span>
            <svg class="w-5 h-5 ml-2 -mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Menu.Button>
        </span>

        <Menu.Items
          class="absolute right-0 w-56 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none"
        >
          <div class="px-4 py-3">
            <p class="text-sm leading-5">Signed in as</p>
            <p class="text-sm font-medium leading-5 text-gray-900 truncate">tom@example.com</p>
          </div>

          <div class="py-1">
            <Menu.Item #render="{ active, disabled }">
              <a href="#account-settings" :class="menuItemClassNameResolver({ active, disabled })">
                Account Settings
              </a>
            </Menu.Item>
            <Menu.Item #render="{ active, disabled }">
              <a href="#support" :class="menuItemClassNameResolver({ active, disabled })">
                Support
              </a>
            </Menu.Item>
            <Menu.Item disabled #render="{ active, disabled }">
              <a href="#new-feature" :class="menuItemClassNameResolver({ active, disabled })">
                New feature (soon)
              </a>
            </Menu.Item>
            <Menu.Item #render="{ active, disabled }">
              <a href="#license" :class="menuItemClassNameResolver({ active, disabled })">
                License
              </a>
            </Menu.Item>
          </div>
          <div class="py-1">
            <Menu.Item #render="{ active, disabled }">
              <a href="#sign-out" :class="menuItemClassNameResolver({ active, disabled })">
                Sign out
              </a>
            </Menu.Item>
          </div>
        </Menu.Items>
      </Menu>
    </div>
  </div>
</template>

<script>
import { Menu } from '@tailwindui/vue'

export default {
  components: {
    ...Menu,
  },
  setup() {
    function classNames(...classes) {
      return classes.filter(Boolean).join(' ')
    }

    return {
      menuItemClassNameResolver({ active, disabled }) {
        return classNames(
          'flex justify-between w-full text-left px-4 py-2 text-sm leading-5 text-gray-700',
          active && 'bg-gray-100',
          disabled && 'cursor-not-allowed opacity-50'
        )
      },
    }
  },
}
</script>
