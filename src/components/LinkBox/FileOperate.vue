<template>
  <div class="FileOperate absolute top-[30px] -right-[65px] flex flex-col">
    <div class="w-[40px] h-[40px] relative pointer group">
      <img class="w-full h-full" src="@/assets/image/link/upload.png" :alt="$t('common.upload')">
      <input class="w-full h-full absolute top-0 left-0 z-[2] text-[0px]" type="file" accept=".json" @change="handleUpload">
      <StardewTips placement="bottom-start">
        <template #default>
          <SimpleInfo :detail="{title: $t('link.uploadShortcuts'), content: $t('link.batchImport')}" />
        </template>
      </StardewTips>
    </div>
    <div class="w-[40px] mt-[20px] pointer group">
      <img class="w-full h-full" src="@/assets/image/link/download.png" :alt="$t('common.download')" @click="downLoad">
      <StardewTips placement="bottom-start">
        <template #default>
          <SimpleInfo :detail="{title: $t('link.exportShortcuts'), content: $t('link.exportDesc')}" />
        </template>
      </StardewTips>
    </div>

    <!--二次确认-->
    <ConfirmBox ref="ConfirmBoxRef" @on-commit="commitUpload" />
  </div>
</template>

<script setup lang="ts">
import ConfirmBox from '@/components/_components/ConfirmBox/index.vue'
import { ref, useTemplateRef } from 'vue'
import { getLinkData, replaceLinkListData } from '@/libs'
import SimpleInfo from '@/components/_common/SimpleInfo/index.vue'
import StardewTips from '@/components/_components/StardewTips/index.vue'
import { useI18n } from 'vue-i18n'

const { t: $t } = useI18n()

const emit = defineEmits([ 'on-upload-success' ])
const ConfirmBoxRef = useTemplateRef('ConfirmBoxRef')
const tempUploadFile = ref<File | null>()

const handleUpload = (e: any) => {
  tempUploadFile.value = e.target.files[0]
  // 解除浏览器不能上传同一文件操作
  e.target.value = ''
  // 打开二次确认弹窗
  ConfirmBoxRef.value?.show($t('message.uploadConfirm'))
}
const commitUpload = () => {
  const reader = new FileReader()
  reader.readAsText(tempUploadFile.value as File)
  reader.onload = async () => {
    try {
      const data = reader.result as string
      const jsonData = JSON.parse(data).map((item: any, index: number) => {
        return {
          ...item,
          id: index + 1,
          list: item.list.map((secItem: any, secIndex: number) => {
            return {
              ...secItem,
              parentId: index + 1,
              id: `${ index + 1 }-${ secIndex + 1 }`
            }
          })
        }
      })
      await replaceLinkListData(jsonData)
      emit('on-upload-success')
    } catch (error) {
      console.error(error)
    }
  }
}
// 下载链接
const downLoad = async () => {
  const linkList = await getLinkData()
  // 过滤掉id和parentId
  const linkListData = linkList.map((item: any) => {
    return {
      name: item.name,
      list: item.list.map((secItem: any) => {
        return {
          name: secItem.name,
          url: secItem.url,
          logo: secItem.logo,
          iconSource: secItem.iconSource,
          builtinIconKey: secItem.builtinIconKey,
          desc: secItem.desc,
          type: secItem.type,
          bgColor: secItem.bgColor,
          textColor: secItem.textColor
        }
      })
    }
  })
  // 将数据转换为 JSON 字符串
  const jsonData = JSON.stringify(linkListData, null, 2)
  // 创建 Blob 对象
  const blob = new Blob([ jsonData ], {type: 'application/json'})
  // 创建临时链接
  const url = URL.createObjectURL(blob)
  // 创建下载链接
  const a = document.createElement('a')
  a.href = url
  a.download = 'Stardew_tab_link_list.json'  // 设置下载文件名
  a.click()  // 触发下载
  // 释放 URL 对象
  URL.revokeObjectURL(url)
}
</script>

<style lang="less" scoped>
</style>
