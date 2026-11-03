import { courseTracks, type Track } from '../course'

declare const data: Track[]
export { data }

export default {
  watch: ['../../labs/**/*.md'],
  load: courseTracks,
}
