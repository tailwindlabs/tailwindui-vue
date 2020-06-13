import { mount } from '@vue/test-utils'
import { Listbox, ListboxButton, ListboxLabel, ListboxList, ListboxOption } from './Listbox'

window.HTMLElement.prototype.scrollIntoView = jest.fn()

const OPTIONS = ['foo','bar','baz']

describe('Listbox', () => {
  const createWrapper = ({ selectedOption = OPTIONS[0], options = OPTIONS, props = {} } = {}) => {
    const template = `
    <Listbox v-model="selectedOption" v-bind="props" v-slot="{ isOpen }">
      <ListboxLabel>Label</ListboxLabel>
      <ListboxButton>{{ selectedOption }}</ListboxButton>
      <ListboxList v-show="isOpen">
        <ListboxOption v-for="option in options" :key="option" :value="option">
          {{ option }}
        </ListboxOption>
      </ListboxList>
    </Listbox>`

    const comp = {
      data() {
        return {
          selectedOption,
          options,
          props,
        }
      },
      components: {
        Listbox,
        ListboxButton,
        ListboxLabel,
        ListboxList,
        ListboxOption
      },
      template,
    }

    return mount(comp)
  }

  it('Button has correct aria attributes', async () => {
    const wrapper = createWrapper()
    const label = wrapper.findComponent(ListboxLabel)
    const labelId = label.attributes('id')
    const button = wrapper.findComponent(ListboxButton)
    const buttonId = button.attributes('id')
    expect(button.attributes('aria-haspopup')).toBe('listbox')
    expect(button.attributes('aria-labelledby')).toBe(`${labelId} ${buttonId}`)
    expect(button.attributes('aria-expanded')).toBeFalsy()
  })

  it('Button toggles open state on click', async () => {
    const wrapper = createWrapper()
    const list = wrapper.findComponent(ListboxList)
    expect(list.element).not.toBeVisible()
    const button = wrapper.findComponent(ListboxButton)
    button.trigger('click')
    await wrapper.vm.$nextTick()
    expect(button.attributes('aria-expanded')).toBe('true')
    expect(list.element).toBeVisible()
    button.trigger('click')
    await wrapper.vm.$nextTick()
    expect(button.attributes('aria-expanded')).toBeUndefined()
    expect(list.element).not.toBeVisible()
  })

  it('List has correct aria attributes', async () => {
    const wrapper = createWrapper()
    const label = wrapper.findComponent(ListboxLabel)
    const labelId = label.attributes('id')
    const list = wrapper.findComponent(ListboxList)
    expect(list.attributes('role')).toBe('listbox')
    expect(list.attributes('aria-labelledby')).toBe(labelId)
  })

  describe('Option interaction', () => {
    it('Selects value when option is clicked', async () => {
      const wrapper = createWrapper()
      wrapper.findComponent(ListboxButton).trigger('click')
      await wrapper.vm.$nextTick()
      const options = wrapper.findAllComponents(ListboxOption)
      options.at(1).trigger('click')
      expect(wrapper.vm.$data.selectedOption).toBe(OPTIONS[1])
    })
  
    it('Closes when option was selected', async () => {
      const wrapper = createWrapper()
      wrapper.findComponent(ListboxButton).trigger('click')
      await wrapper.vm.$nextTick()
      const list = wrapper.findComponent(ListboxList)
      const options = wrapper.findAllComponents(ListboxOption)
      options.at(0).trigger('click')
      await wrapper.vm.$nextTick()
      expect(list.element).not.toBeVisible()
    })
  })

  describe('Active options', () => {
    it('Sets first option as active when opened with no selection', async () => {
      const wrapper = createWrapper({ selectedOption: null })
      wrapper.findComponent(ListboxButton).trigger('click')
      await wrapper.vm.$nextTick()
      const list = wrapper.findComponent(ListboxList)
      const options = wrapper.findAllComponents(ListboxOption)
      expect(list.attributes('aria-activedescendant')).toBe(options.at(0).attributes('id'))
    })

    it('Sets selected option as active when opened', async () => {
      const wrapper = createWrapper({ selectedOption: OPTIONS[2] })
      wrapper.findComponent(ListboxButton).trigger('click')
      await wrapper.vm.$nextTick()
      const list = wrapper.findComponent(ListboxList)
      const options = wrapper.findAllComponents(ListboxOption)
      expect(list.attributes('aria-activedescendant')).toBe(options.at(2).attributes('id'))
    })
  
    it('Scrolls selected option into view when opened', async () => {
      const wrapper = createWrapper({ selectedOption: OPTIONS[2] })
      wrapper.findComponent(ListboxButton).trigger('click')
      await wrapper.vm.$nextTick()
      const options = wrapper.findAllComponents(ListboxOption)
      expect(options.at(2).element.scrollIntoView).toBeCalledWith({"block": "nearest"})
    })
  
    it('Sets correct option as activedescendant when option is hovered', async () => {
      const wrapper = createWrapper()
      const button = wrapper.findComponent(ListboxButton)
      button.trigger('click')
      await wrapper.vm.$nextTick()
      const list = wrapper.findComponent(ListboxList)
      const options = wrapper.findAllComponents(ListboxOption)
      const option1 = options.at(0)
      const option2 = options.at(1)
      option2.trigger('mousemove')
      await wrapper.vm.$nextTick()
      expect(list.attributes('aria-activedescendant')).toBe(option2.attributes('id'))
      option1.trigger('mousemove')
      await wrapper.vm.$nextTick()
      expect(list.attributes('aria-activedescendant')).toBe(option1.attributes('id'))
    })
  })

  describe('Keyboard navigation', () => {
    it('"Esc" closes the list', async () => {
      const wrapper = createWrapper()
      const button = wrapper.findComponent(ListboxButton)
      button.trigger('click')
      await wrapper.vm.$nextTick()
      const list = wrapper.findComponent(ListboxList)
      expect(list.element).toBeVisible()
      list.trigger('keydown', { key: 'Esc'})
      await wrapper.vm.$nextTick()
      expect(list.element).not.toBeVisible()
    })

    it('"Tab" closes the list and does not prevent the event', async () => {
      const wrapper = createWrapper()
      const button = wrapper.findComponent(ListboxButton)
      button.trigger('click')
      await wrapper.vm.$nextTick()
      const list = wrapper.findComponent(ListboxList)
      expect(list.element).toBeVisible()
      const event = { key: 'Tab', preventDefault: jest.fn() }
      list.trigger('keydown', event)
      await wrapper.vm.$nextTick()
      expect(list.element).not.toBeVisible()
      expect(event.preventDefault).not.toBeCalled()
    })

    it('"Down" sets next option as active', async () => {
      const wrapper = createWrapper()
      const button = wrapper.findComponent(ListboxButton)
      button.trigger('click')
      await wrapper.vm.$nextTick()
      const list = wrapper.findComponent(ListboxList)
      const options = wrapper.findAllComponents(ListboxOption)
      const option2 = options.at(1)
      list.trigger('keydown', { key: 'Down'})
      await wrapper.vm.$nextTick()
      expect(list.attributes('aria-activedescendant')).toBe(option2.attributes('id'))
    })
  
    it('"Down" wraps to first option when last option is active', async () => {
      const wrapper = createWrapper()
      const button = wrapper.findComponent(ListboxButton)
      button.trigger('click')
      await wrapper.vm.$nextTick()
      const list = wrapper.findComponent(ListboxList)
      const options = wrapper.findAllComponents(ListboxOption)
      const option1 = options.at(0)
      const option3 = options.at(2)
      option3.trigger('mousemove')
      await wrapper.vm.$nextTick()
      expect(list.attributes('aria-activedescendant')).toBe(option3.attributes('id'))
      list.trigger('keydown', { key: 'Down'})
      await wrapper.vm.$nextTick()
      expect(list.attributes('aria-activedescendant')).toBe(option1.attributes('id'))
    })

    it('"Up" sets previous option as active', async () => {
      const wrapper = createWrapper()
      const button = wrapper.findComponent(ListboxButton)
      button.trigger('click')
      await wrapper.vm.$nextTick()
      const list = wrapper.findComponent(ListboxList)
      const options = wrapper.findAllComponents(ListboxOption)
      const option2 = options.at(1)
      const option3 = options.at(2)
      option3.trigger('mousemove')
      await wrapper.vm.$nextTick()
      list.trigger('keydown', { key: 'Up'})
      await wrapper.vm.$nextTick()
      expect(list.attributes('aria-activedescendant')).toBe(option2.attributes('id'))
    })
  
    it('"Up" wraps to last option when first option is active', async () => {
      const wrapper = createWrapper()
      const button = wrapper.findComponent(ListboxButton)
      button.trigger('click')
      await wrapper.vm.$nextTick()
      const list = wrapper.findComponent(ListboxList)
      const options = wrapper.findAllComponents(ListboxOption)
      const option3 = options.at(2)
      list.trigger('keydown', { key: 'Up'})
      await wrapper.vm.$nextTick()
      expect(list.attributes('aria-activedescendant')).toBe(option3.attributes('id'))
    })

    it('"Spacebar" selects active option', async () => {
      const wrapper = createWrapper()
      wrapper.findComponent(ListboxButton).trigger('click')
      await wrapper.vm.$nextTick()
      const options = wrapper.findAllComponents(ListboxOption)
      options.at(1).trigger('mousemove')
      const list = wrapper.findComponent(ListboxList)
      list.trigger('keydown', { key: 'Spacebar'})
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$data.selectedOption).toBe(OPTIONS[1])
    })

    it('"Enter" selects active option', async () => {
      const wrapper = createWrapper()
      wrapper.findComponent(ListboxButton).trigger('click')
      await wrapper.vm.$nextTick()
      const options = wrapper.findAllComponents(ListboxOption)
      options.at(1).trigger('mousemove')
      const list = wrapper.findComponent(ListboxList)
      list.trigger('keydown', { key: 'Enter'})
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$data.selectedOption).toBe(OPTIONS[1])
    })

    it('Typeahead focuses matching option', async () => {
      const wrapper = createWrapper()
      wrapper.findComponent(ListboxButton).trigger('click')
      await wrapper.vm.$nextTick()
      const list = wrapper.findComponent(ListboxList)
      OPTIONS[2].split('').forEach(key => {
        list.trigger('keydown', { key })
      })
      await wrapper.vm.$nextTick()
      const options = wrapper.findAllComponents(ListboxOption)
      expect(list.attributes('aria-activedescendant')).toBe(options.at(2).attributes('id'))
    })
  })

  describe('Multiselect', () => {
    it('List has aria-multiselectable', async () => {
      const wrapper = createWrapper({
        selectedOption: [],
        props: { multiple: true }
      })
      const list = wrapper.findComponent(ListboxList)
      expect(list.attributes('aria-multiselectable')).toBe('true')
    })

    it('Does not close when option is selected', async () => {
      const wrapper = createWrapper({
        selectedOption: [],
        props: { multiple: true }
      })
      wrapper.findComponent(ListboxButton).trigger('click')
      await wrapper.vm.$nextTick()
      const list = wrapper.findComponent(ListboxList)
      const options = wrapper.findAllComponents(ListboxOption)
      options.at(0).trigger('click')
      await wrapper.vm.$nextTick()
      expect(list.element).toBeVisible()
    })

    it('Can select multiple options', async () => {
      const wrapper = createWrapper({
        selectedOption: [],
        props: { multiple: true }
      })
      wrapper.findComponent(ListboxButton).trigger('click')
      await wrapper.vm.$nextTick()
      const list = wrapper.findComponent(ListboxList)
      const options = wrapper.findAllComponents(ListboxOption)
      options.at(0).trigger('click')
      options.at(1).trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$data.selectedOption).toEqual([OPTIONS[0], OPTIONS[1]])
    })

    it('Deselects selected option on click', async () => {
      const wrapper = createWrapper({
        selectedOption: [OPTIONS[0]],
        props: { multiple: true }
      })
      wrapper.findComponent(ListboxButton).trigger('click')
      await wrapper.vm.$nextTick()
      const list = wrapper.findComponent(ListboxList)
      const options = wrapper.findAllComponents(ListboxOption)
      options.at(0).trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$data.selectedOption).toEqual([])
    })

    it('Sets first selected option as active when opened', async () => {
      const wrapper = createWrapper({
        selectedOption: [OPTIONS[1],OPTIONS[2]],
        props: { multiple: true }
      })
      wrapper.findComponent(ListboxButton).trigger('click')
      await wrapper.vm.$nextTick()
      const list = wrapper.findComponent(ListboxList)
      const options = wrapper.findAllComponents(ListboxOption)
      expect(list.attributes('aria-activedescendant')).toBe(options.at(1).attributes('id'))
    })
  })
})