import debounce from 'debounce'

const ListboxSymbol = Symbol('Listbox')

let id = 0

function generateId() {
  return `tailwind-ui-listbox-id-${++id}`
}

function defaultSlot(parent, scope) {
  return parent.$slots.default ? parent.$slots.default : parent.$scopedSlots.default(scope)
}

function isString(value) {
  return typeof value === 'string' || value instanceof String
}

export const ListboxLabel = {
  inject: {
    context: ListboxSymbol,
  },
  data: () => ({
    id: generateId(),
  }),
  mounted() {
    this.context.labelId.value = this.id
  },
  render(h) {
    return h(
      'span',
      {
        attrs: {
          id: this.id,
        },
      },
      defaultSlot(this, {})
    )
  },
}

export const ListboxButton = {
  inject: {
    context: ListboxSymbol,
  },
  data: () => ({
    id: generateId(),
    isFocused: false,
  }),
  created() {
    this.context.listboxButtonRef.value = () => this.$el
    this.context.buttonId.value = this.id
  },
  render(h) {
    return h(
      'button',
      {
        attrs: {
          id: this.id,
          type: 'button',
          'aria-haspopup': 'listbox',
          'aria-labelledby': `${this.context.labelId.value} ${this.id}`,
          ...(this.context.isOpen.value ? { 'aria-expanded': 'true' } : {}),
        },
        on: {
          focus: () => {
            this.isFocused = true
          },
          blur: () => {
            this.isFocused = false
          },
          click: this.context.toggle,
        },
      },
      defaultSlot(this, { isFocused: this.isFocused })
    )
  },
}

export const ListboxList = {
  inject: {
    context: ListboxSymbol,
  },
  created() {
    this.context.listboxListRef.value = () => this.$refs.listboxList
  },
  render(h) {
    const children = defaultSlot(this, {})
    const values = children.map((node) => node.componentOptions.propsData.value)
    this.context.values.value = values
    const focusedIndex = values.indexOf(this.context.activeItem.value)

    return h(
      'ul',
      {
        ref: 'listboxList',
        attrs: {
          tabindex: '-1',
          role: 'listbox',
          'aria-activedescendant': this.context.getActiveDescendant(),
          'aria-labelledby': this.context.props.labelledby,
          'aria-multiselectable': this.context.props.multiple,
        },
        on: {
          focusout: (e) => {
            if (e.relatedTarget === this.context.listboxButtonRef.value()) {
              return
            }
            this.context.close()
          },
          mouseleave: () => {
            this.context.activeItem.value = null
          },
          keydown: (e) => {
            let indexToFocus
            switch (e.key) {
              case 'Esc':
              case 'Escape':
                e.preventDefault()
                this.context.close()
                break
              case 'Tab':
                this.context.close()
                break
              case 'Up':
              case 'ArrowUp':
                e.preventDefault()
                indexToFocus = focusedIndex - 1 < 0 ? values.length - 1 : focusedIndex - 1
                this.context.focus(values[indexToFocus])
                break
              case 'Down':
              case 'ArrowDown':
                e.preventDefault()
                indexToFocus = focusedIndex + 1 > values.length - 1 ? 0 : focusedIndex + 1
                this.context.focus(values[indexToFocus])
                break
              case 'Spacebar':
              case ' ':
                e.preventDefault()
                if (this.context.typeahead.value !== '') {
                  this.context.type(' ')
                } else {
                  this.context.select(this.context.activeItem.value || this.context.props.value)
                }
                break
              case 'Enter':
                e.preventDefault()
                this.context.select(this.context.activeItem.value || this.context.props.value)
                break
              default:
                if (!(isString(e.key) && e.key.length === 1)) {
                  return
                }

                e.preventDefault()
                this.context.type(e.key)
                return
            }
          },
        },
      },
      children
    )
  },
}

export const ListboxOption = {
  inject: {
    context: ListboxSymbol,
  },
  data: () => ({
    id: generateId(),
  }),
  props: ['value'],
  watch: {
    value(newValue, oldValue) {
      this.context.unregisterOptionId(oldValue)
      this.context.unregisterOptionRef(this.value)
      this.context.registerOptionId(newValue, this.id)
      this.context.registerOptionRef(this.value, this.$el)
    },
  },
  created() {
    this.context.registerOptionId(this.value, this.id)
  },
  mounted() {
    this.context.registerOptionRef(this.value, this.$el)
  },
  beforeDestroy() {
    this.context.unregisterOptionId(this.value)
    this.context.unregisterOptionRef(this.value)
  },
  render(h) {
    const isActive = this.context.activeItem.value === this.value
    const isSelected = this.context.props.multiple
      ? this.context.props.value.includes(this.value)
      : this.context.props.value === this.value

    return h(
      'li',
      {
        attrs: {
          id: this.id,
          role: 'option',
          'aria-selected': isSelected ? 'true' : (this.context.props.multiple ? 'false' : null),
        },
        on: {
          click: () => {
            this.context.select(this.value)
          },
          mousemove: () => {
            if (this.context.activeItem.value === this.value) {
              return
            }

            this.context.activeItem.value = this.value
          },
        },
      },
      defaultSlot(this, {
        isActive,
        isSelected,
      })
    )
  },
}

export const Listbox = {
  props: {
    value: {
      required: true,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
  },
  data: (vm) => ({
    typeahead: { value: '' },
    listboxButtonRef: { value: null },
    listboxListRef: { value: null },
    isOpen: { value: false },
    activeItem: { value: vm.$props.value },
    values: { value: null },
    labelId: { value: null },
    buttonId: { value: null },
    optionIds: { value: [] },
    optionRefs: { value: [] },
  }),
  provide() {
    return {
      [ListboxSymbol]: {
        getActiveDescendant: this.getActiveDescendant,
        registerOptionId: this.registerOptionId,
        unregisterOptionId: this.unregisterOptionId,
        registerOptionRef: this.registerOptionRef,
        unregisterOptionRef: this.unregisterOptionRef,
        toggle: this.toggle,
        open: this.open,
        close: this.close,
        select: this.select,
        focus: this.focus,
        clearTypeahead: this.clearTypeahead,
        typeahead: this.$data.typeahead,
        type: this.type,
        listboxButtonRef: this.$data.listboxButtonRef,
        listboxListRef: this.$data.listboxListRef,
        isOpen: this.$data.isOpen,
        activeItem: this.$data.activeItem,
        values: this.$data.values,
        labelId: this.$data.labelId,
        buttonId: this.$data.buttonId,
        props: this.$props,
      },
    }
  },
  methods: {
    getActiveDescendant() {
      const [_value, id] = this.optionIds.value.find(([value]) => {
        return value === this.activeItem.value
      }) || [null, null]

      return id
    },
    registerOptionId(value, optionId) {
      this.unregisterOptionId(value)
      this.optionIds.value = [...this.optionIds.value, [value, optionId]]
    },
    unregisterOptionId(value) {
      this.optionIds.value = this.optionIds.value.filter(([candidateValue]) => {
        return candidateValue !== value
      })
    },
    type(value) {
      this.typeahead.value = this.typeahead.value + value

      const [match] = this.optionRefs.value.find(([_value, ref]) => {
        return ref.innerText.toLowerCase().startsWith(this.typeahead.value.toLowerCase())
      }) || [null]

      if (match !== null) {
        this.focus(match)
      }

      this.clearTypeahead()
    },
    clearTypeahead: debounce(function () {
      this.typeahead.value = ''
    }, 500),
    registerOptionRef(value, optionRef) {
      this.unregisterOptionRef(value)
      this.optionRefs.value = [...this.optionRefs.value, [value, optionRef]]
    },
    unregisterOptionRef(value) {
      this.optionRefs.value = this.optionRefs.value.filter(([candidateValue]) => {
        return candidateValue !== value
      })
    },
    toggle() {
      this.$data.isOpen.value ? this.close() : this.open()
    },
    open() {
      this.$data.isOpen.value = true
      // Multi selects focus the first selected element when opened
      const activeValue = this.$props.multiple
        ? this.$data.values.value.find(value => this.$props.value.includes(value))
        : this.$props.value
      this.focus(activeValue)
      this.$nextTick(() => {
        this.$data.listboxListRef.value().focus()
      })
    },
    close() {
      this.$data.isOpen.value = false
      this.$data.listboxButtonRef.value().focus()
    },
    select(value) {
      if (this.$props.multiple) {
        const values = this.$props.value
        const index = values.indexOf(value)
        if (index > -1) {
          values.splice(index, 1)
        } else {
          values.push(value)
        }
        this.$emit('input', values)
        return
      }
      this.$emit('input', value)
      this.$nextTick(() => {
        this.close()
      })
    },
    focus(value) {
      this.activeItem.value = value

      if (value == null) {
        return
      }

      this.$nextTick(() => {
        this.listboxListRef
          .value()
          .children[this.values.value.indexOf(this.activeItem.value)].scrollIntoView({
            block: 'nearest',
          })
      })
    },
  },
  render(h) {
    return h('div', {}, defaultSlot(this, { isOpen: this.$data.isOpen.value }))
  },
}
