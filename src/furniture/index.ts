/**
 * 家具组件汇总入口：导入并注册所有内置组件。
 * 自定义组件时，在这里加一行 import + registerFurniture(...)。
 */
import { registerFurniture } from './registry'

import sofa from './components/sofa'
import chair from './components/chair'
import bed from './components/bed'
import coffeeTable from './components/coffee-table'
import diningTable from './components/dining-table'
import desk from './components/desk'
import nightstand from './components/nightstand'
import wardrobe from './components/wardrobe'
import bookshelf from './components/bookshelf'
import tvStand from './components/tv-stand'
import kitchenCounter from './components/kitchen-counter'
import floorLamp from './components/floor-lamp'
import plant from './components/plant'
import rug from './components/rug'
import toilet from './components/toilet'
import sink from './components/sink'
import television from './components/television'
import televisionWall from './components/televisionWall'

const builtin = [
  sofa,
  chair,
  bed,
  coffeeTable,
  diningTable,
  desk,
  nightstand,
  wardrobe,
  bookshelf,
  tvStand,
  kitchenCounter,
  floorLamp,
  plant,
  rug,
  toilet,
  sink,
  television,
  televisionWall,
]

builtin.forEach(registerFurniture)

export { registerFurniture, getFurniture, listFurniture } from './registry'
export type { FurnitureComponentDef, FurnitureRenderProps } from './types'
export type { Furniture } from '../types'
