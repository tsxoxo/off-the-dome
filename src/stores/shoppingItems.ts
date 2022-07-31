import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import type { Ref } from 'vue'
import { useFetchUnsplashSearch } from '~/composables/fetch'

interface Item {
  id: number
  text: string
  isChecked: boolean
  pictureURL: string
}
export const useShoppingItemsStore = defineStore('shoppingItems', () => {
  const items: Ref<Item[]> = useLocalStorage('shopping-items', [
    {
      id: 0,
      text: 'tomatos',
      isChecked: false,
      pictureURL: '',
    },
    {
      id: 1,
      text: 'tomatoes',
      isChecked: false,
      pictureURL: '',
    },
    {
      id: 2,
      text: 'ketchup',
      isChecked: false,
      pictureURL: '',
    },
  ])
  const lastId = ref(Math.max(...items.value.map(item => item.id)))
  function nextId() {
    return ++lastId.value
  }
  const indexOfItem = (id: number) => items.value.findIndex((item: Item) => item.id === id)
  const checkedItemsIds = computed(() => items.value.filter(item => item.isChecked === true).map(item => String(item.id)))

  interface UnsplashSingleResult {
    alt_description: string
    blur_hash: string
    categories: any[]
    color: string
    created_at: string
    current_user_collections: any[]
    description: any
    height: number
    id: string
    liked_by_user: boolean
    likes: number
    links: any
    promoted_at: string
    sponsorship: any
    tags: any[]
    topic_submissions: any
    updated_at: string
    urls: {
      thumb: string
    }
    user: object
    width: number
  }
  interface UnsplashResponse {
    results: UnsplashSingleResult[]
    total: number
    total_pages: number
  }

  const isFetchingImage = ref(false)
  async function addItem(text: string) {
    const { data, isFetching, execute }: { data: Ref<UnsplashResponse | null>; isFetching: Ref<boolean>; execute: () => Promise<any> } = useFetchUnsplashSearch(`photos?per_page=1&orientation=squarish&query=${text}`, {
      immediate: false,
    },
    ).json()

    syncRef(isFetching, isFetchingImage)
    await execute()

    let myUrl: string
    if (data!.value!.results.length === 0) {
      // This doesn't work and I hate debugging this
      // const { data }: { data: any } = useFetchUnsplashRandom('random?per_page=1&orientation=squarish').json()
      // myUrl = data.value.urls.thumb
      myUrl = ''
    }
    else {
      if (data !== undefined)
        myUrl = data!.value!.results[0].urls.thumb
      else myUrl = ''
    }
    items.value.unshift({
      id: nextId(),
      text,
      isChecked: false,
      pictureURL: myUrl,
    })
  }
  function removeItem(id: number) {
    const i = indexOfItem(id)
    if (i > -1)
      items.value.splice(i, 1)
  }
  function updateItem(id: number) {
    const i = indexOfItem(id)
    if (i > -1)
      items.value[i].isChecked = !items.value[i].isChecked
  }

  return { items, checkedItemsIds, addItem, removeItem, updateItem, isFetchingImage }
})
