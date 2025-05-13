<template>
  <div class="Battery w-[20px] h-[120px] absolute right-[20px] bottom-[20px] flex justify-center pt-[27px] pb-[5px]">
    <div class="w-[10px] h-full flex items-end overflow-hidden">
      <div :style="{height: `${battery.electricQuantity}%`}" class="w-full rounded-[3px] bg-[#80FB4D]">

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// BatteryManager 是标准浏览器内置类型，VSCode/WebStorm 会自动识别
import { onMounted, reactive } from 'vue'

interface Battery {
  isCharge: boolean
  electricQuantity: number
}

const battery = reactive<Battery>({
  isCharge: false,
  electricQuantity: 0
})

// 监听设备电池状态
const listenBattery = () => {
  // charging: 是否在充电
  // chargingTime: 充满电还需要的时间(秒)
  // dischargingTime:  电池剩余可用时间(秒)
  // level: 剩余电量百分比,最大电量就是1
  // onchargingchange:  充电状态改变时触发该监听函数
  // onchargingtimechange:  充满还需时间改变时触发该监听函数
  // ondischargingtimechange:  电池剩余可用时间改变时触发该监听函数
  // onlevelchange:  电量改变时触发该监听函数
  const changeBattery = (val: BatteryManager) => {
    battery.isCharge = val.charging
    battery.electricQuantity = val.level * 100
  }
  window.navigator.getBattery().then((fn: BatteryManager) => {
    changeBattery(fn)
    fn.onchargingchange = () => {
      changeBattery(fn)
    }
  })
}

onMounted(() => {
  listenBattery()
})
</script>

<style lang="less" scoped>
.Battery {
  background-image: url("@/assets/image/battery.png");
  background-size: 100% 100%;
}
</style>
