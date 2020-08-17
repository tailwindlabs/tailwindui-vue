import debounce from 'debounce'

const ListboxSymbol = Symbol('Listbox')

let id = 0

function generateId() {
  return `tailwind-ui-listbox-id-${++id}`
}

function defaultSlot(parent, scope) {
  return parent.$slots.default
    ? parent.$slots.default
    : parent.$scopedSlots.default(scope)
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
  created() {
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
          'aria-expanded': this.context.isOpen.value ? 'true' : null,
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
          'aria-labelledby': this.context.labelId.value,
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
                if (e.shiftKey) {
                  e.preventDefault()
                }
                this.context.close()
                break
              case 'Up':
              case 'ArrowUp':
                e.preventDefault()
                indexToFocus =
                  focusedIndex - 1 < 0 ? values.length - 1 : focusedIndex - 1
                this.context.focus(values[indexToFocus])
                break
              case 'Down':
              case 'ArrowDown':
                e.preventDefault()
                indexToFocus =
                  focusedIndex + 1 > values.length - 1 ? 0 : focusedIndex + 1
                this.context.focus(values[indexToFocus])
                break
              case ' ':
                e.preventDefault()
                if (this.context.typeahead.value !== '') {
                  this.context.type(' ')
                } else {
                  this.context.select(
                    this.context.activeItem.value || this.context.props.value
                  )
                }
                break
              case 'Enter':
                e.preventDefault()
                this.context.select(
                  this.context.activeItem.value || this.context.props.value
                )
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
    const isMultilistbox = this.context.props.multiple
    const isActive = this.context.activeItem.value === this.value
    const isSelected = isMultilistbox
      ? this.context.props.value.includes(this.value)
      : this.context.props.value === this.value
    let ariaSelected
    if (isSelected) {
      ariaSelected = 'true'
    } else if (isMultilistbox) {
      ariaSelected = 'false'
    }

    return h(
      'li',
      {
        attrs: {
          id: this.id,
          role: 'option',
          'aria-selected': ariaSelected,
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
        return (
          ref.innerText &&
          ref.innerText
            .trim()
            .toLowerCase()
            .startsWith(this.typeahead.value.toLowerCase())
        )
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
      this.optionRefs.value = this.optionRefs.value.filter(
        ([candidateValue]) => {
          return candidateValue !== value
        }
      )
    },
    toggle() {
      this.$data.isOpen.value ? this.close() : this.open()
    },
    open() {
      this.$data.isOpen.value = true
      // Multi selects focus the first selected option when opened
      let activeValue = this.$props.multiple
        ? this.$data.values.value.find((value) =>
            this.$props.value.includes(value)
          )
        : this.$props.value
      // When no item is selected, focus the first option
      if (activeValue == null) {
        activeValue = this.$data.values.value[0]
      }
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
        // If a value is already selected we need to deselect it,
        // else we need to add it to the list of selected values
        const newValues = values.includes(value)
          ? values.filter((v) => v !== value)
          : [...values, value]
        this.$emit('input', newValues)
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
          .children[
            this.values.value.indexOf(this.activeItem.value)
          ].scrollIntoView({
            block: 'nearest',
          })
      })
    },
  },
  render(h) {
    return h('div', {}, defaultSlot(this, { isOpen: this.$data.isOpen.value }))
  },
}
