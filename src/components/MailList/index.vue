<script setup lang="ts">
import StardewDialog from '@/components/_components/StardewDialog/index.vue'
import { computed, onMounted, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { MAIL_LIST_READ_IDS_KEY } from '@/libs/const'
import { useStorage } from '@/libs/storage'
import { DEFAULT_MAIL_LIST_MESSAGE_ID } from './types'
import { getMailListMessages } from '@/locales/maillist'

const emit = defineEmits<{
  readStateChange: [hasUnread: boolean];
}>()

const { locale, t } = useI18n()
const { getStorage, setStorage } = useStorage()

const visible = shallowRef<boolean>(false)
const readIds = shallowRef<string[]>([])
const selectedMailId = shallowRef<string>(DEFAULT_MAIL_LIST_MESSAGE_ID)

const messages = computed(() => {
  return getMailListMessages(locale.value)
})

const selectedMail = computed(() => {
  return messages.value.find((mail) => mail.id === selectedMailId.value) || messages.value[0]
})

const hasUnread = computed(() => {
  return messages.value.some((mail) => !readIds.value.includes(mail.id))
})

const syncReadState = () => {
  emit('readStateChange', hasUnread.value)
}

const loadReadIds = async () => {
  readIds.value = await getStorage<string[]>(MAIL_LIST_READ_IDS_KEY) || []
  syncReadState()
}

const isMailUnread = (mailId: string) => {
  return !readIds.value.includes(mailId)
}

const markRead = async (mailId: string) => {
  if (!isMailUnread(mailId)) {
    return
  }

  readIds.value = [ ...new Set([ ...readIds.value, mailId ]) ]
  await setStorage(MAIL_LIST_READ_IDS_KEY, readIds.value)
  syncReadState()
}

const handleSelectMail = (mailId: string) => {
  selectedMailId.value = mailId
  markRead(mailId)
}

const show = async () => {
  await loadReadIds()
  selectedMailId.value = selectedMail.value.id
  visible.value = true
  await markRead(selectedMailId.value)
}

const hide = () => {
  visible.value = false
}

onMounted(() => {
  loadReadIds()
})

defineExpose({
  show,
  hide
})
</script>

<template>
  <StardewDialog v-model="visible">
    <div class="relative w-[760px] max-w-[94vw] bg-[#EFBD73] p-6 stardew-border stardew-font">
      <div class="close-box" @click="hide">
        <img src="@/assets/image/link/close.png" :alt="t('common.close')">
      </div>
      <h3 class="dialog-title">
        {{ t('maillist.title') }}
      </h3>
      <div
        class="mt-3 flex min-h-[340px] max-h-[70vh] flex-col border-2 border-[#8E5F40] bg-[#f8d18a] shadow-[inset_0_0_0_2px_#cf802f] sm:max-h-[440px] sm:flex-row"
      >
        <aside
          class="flex max-h-[158px] w-full shrink-0 flex-col border-b-2 border-[#8E5F40] bg-[#e7aa5e] sm:max-h-none sm:w-[230px] sm:border-r-2 sm:border-b-0"
          :aria-label="t('maillist.listTitle')"
        >
          <div class="flex min-h-[72px] shrink-0 items-center border-b-2 border-[#8E5F40] bg-[#efbd73] px-4">
            <p class="m-0 text-[18px] leading-6 font-bold text-[#4e3623]">
              {{ t('maillist.listTitle') }}
            </p>
          </div>
          <div class="min-h-0 flex-1 overflow-y-auto">
            <button
              v-for="mail in messages"
              :key="mail.id"
              type="button"
              class="pointer relative flex min-h-[68px] w-full flex-col items-stretch gap-1 border-b-2 border-[#8E5F40] px-[10px] py-[9px] pl-[22px] text-left text-[#4e3623] hover:bg-[#f8d18a] sm:min-h-[76px] sm:pt-[10px]"
              :class="mail.id === selectedMailId ? 'bg-[#f8d18a] shadow-[inset_3px_0_0_#7B312A]' : 'bg-[#efbd73]'"
              @click="handleSelectMail(mail.id)"
            >
              <span
                v-if="isMailUnread(mail.id)"
                class="absolute top-[13px] left-2 h-2 w-2 rounded-full border-2 border-[#5f2e16] bg-[#c7472d]"
              ></span>
              <span class="min-w-0 truncate text-sm leading-[18px] font-bold">
                {{ mail.subject }}
              </span>
              <span class="min-w-0 truncate text-xs leading-[16px] text-[#7B312A]">
                {{ mail.summary }}
              </span>
              <span class="text-[11px] leading-[14px] text-[#8E5F40]">
                {{ mail.date }}
              </span>
            </button>
          </div>
        </aside>
        <article v-if="selectedMail" class="min-w-0 flex-1 overflow-y-auto bg-[#f8d18a]">
          <div class="flex min-h-[72px] items-center justify-between gap-4 border-b-2 border-[#8E5F40] bg-[#efbd73] px-4 py-3.5">
            <div class="min-w-0">
              <p class="m-0 text-[13px] leading-[18px] text-[#7B312A]">
                {{ selectedMail.sender }}
              </p>
              <h4 class="m-0 text-[18px] leading-6 font-bold text-[#4e3623]">
                {{ selectedMail.subject }}
              </h4>
            </div>
            <p class="m-0 shrink-0 text-xs leading-[18px] text-[#8E5F40]">
              {{ selectedMail.date }}
            </p>
          </div>
          <p class="m-0 p-4 text-[15px] leading-[22px] text-[#4e3623]">
            {{ selectedMail.content }}
          </p>
        </article>
        <div v-else class="flex flex-1 items-center justify-center bg-[#f8d18a] text-[15px] text-[#8E5F40]">
          {{ t('maillist.emptyText') }}
        </div>
      </div>
    </div>
  </StardewDialog>
</template>

<style lang="less" scoped>
@import "@/styles/common";
.close-box {
  .dialog-close-button();
}
</style>
