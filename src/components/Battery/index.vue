<template>
  <div class="Battery w-[20px] h-[120px] absolute right-[20px] bottom-[20px] flex justify-center pt-[22px] pb-[3px]" :class="{'low-battery': battery.electricQuantity <= 20}">
    <div class="w-[10px] h-full flex items-end overflow-hidden">
      <div :style="{height: `${battery.electricQuantity}%`}" class="battery-val w-full rounded-[2px] bg-[#80FB4D]">

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'

interface Battery {
  isCharge: boolean
  electricQuantity: number
}
interface BatteryManager {
  charging: boolean
  chargingTime: number
  dischargingTime: number
  level: number
  onchargingchange: () => void
  onchargingtimechange: () => void
  ondischargingtimechange: () => void
  onlevelchange: () => void
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
  ( window.navigator as any ).getBattery().then((fn: BatteryManager) => {
    changeBattery(fn)
    fn.onchargingchange = () => {
      changeBattery(fn)
    }
    fn.onlevelchange = () => {
      changeBattery(fn)
    }
  })
}

onMounted(() => {
  listenBattery()
})
</script>

<style lang="less" scoped>
@keyframes shake {
  0%   { transform: translateX(0); }
  4%  { transform: translateX(-3px); }
  8%  { transform: translateX(3px); }
  12%  { transform: translateX(-3px); }
  16%  { transform: translateX(3px); }
  20%  { transform: translateX(-3px); }
  24%  { transform: translateX(3px); }
  28%  { transform: translateX(-3px); }
  32%  { transform: translateX(3px); }
  36%  { transform: translateX(-3px); }
  40%  { transform: translateX(3px); }
  44%  { transform: translateX(-3px); }
  48%  { transform: translateX(3px); }
  50%  { transform: translateX(0px); }
  100% { transform: translateX(0); }
}
.Battery {
  background-image: url("@/assets/image/battery.png");
  background-size: 100% 100%;
}
.low-battery {
  animation: shake 2s steps(2, end) infinite;
  .battery-val {
    background-color: #ff0000;
  }
}
</style>
