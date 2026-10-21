import { courseTree, type Phase } from '../course'

declare const data: Phase[]
export { data }

export default {
  watch: ['../../labs/**/*.md'],
  load: courseTree,
}
