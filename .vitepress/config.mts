import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { type DefaultTheme, defineConfigWithTheme } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { courseTree } from './course'

const repo = process.env.REPO_URL || 'https://github.com/TienNHM/devops-course'

const root = join(import.meta.dirname, '..')
const pad = (n: number) => String(n).padStart(2, '0')
const h1 = (rel: string) => readFileSync(join(root, rel), 'utf8').match(/^# (.+)$/m)?.[1] ?? rel

type Item = DefaultTheme.SidebarItem

// Link của sidebar ("/a/b" hoặc "/a/") có file nguồn thật không. Trang thiếu thì bỏ khỏi cây.
function pageExists(link: string): boolean {
  const rel = link.replace(/^\//, '')
  if (rel === '' || rel.endsWith('/')) {
    return ['index.md', 'README.md'].some((f) => existsSync(join(root, rel, f)))
  }
  return existsSync(join(root, `${rel}.md`))
}

// Tạo mục sidebar; trả null nếu trang không tồn tại
const page = (text: string, link: string): Item | null => (pageExists(link) ? { text, link } : null)
const present = (items: (Item | null)[]): Item[] => items.filter((i): i is Item => i !== null)
const group = (text: string, items: (Item | null)[], extra: Partial<Item> = {}): Item | null => {
  const kept = present(items)
  return kept.length ? { text, items: kept, ...extra } : null
}

const phases = courseTree()

// Cây học chung cho /labs/, /curriculum/ và /assignments/
function learningSidebar(): Item[] {
  const start = group('Bắt đầu từ đây', [
    page('Bắt đầu từ đây', '/curriculum/getting-started'),
    page('Cách học', '/curriculum/how-to-learn'),
    page('Cài đặt máy', '/resources/setup-guide'),
    page('Lộ trình 16 tuần', '/curriculum/syllabus'),
  ])
  const about = group(
    'Về khóa học',
    [
      page('Chuẩn đầu ra', '/curriculum/learning-outcomes'),
      page('Cách đánh giá', '/curriculum/assessment'),
      page('Dự án cuối khóa (Capstone)', '/assignments/capstone/'),
      page('Tiêu chí chấm Capstone', '/curriculum/capstone-rubric'),
      page('Đánh giá kỹ thuật', '/curriculum/technical-assessment'),
    ],
    { collapsed: true },
  )
  const stages = phases.map((phase, i) =>
    group(
      phase.title,
      phase.weeks.map((w) => page(w.title, w.link)),
      { collapsed: i > 0 },
    ),
  )
  return present([start, ...stages, about])
}

const slideDecks: { dir: string; name: string }[] = [
  { dir: '01-foundation', name: 'Foundation' },
  { dir: '02-docker', name: 'Docker' },
  { dir: '03-compose', name: 'Compose' },
  { dir: '04-cicd', name: 'CI/CD' },
  { dir: '05-kubernetes', name: 'Kubernetes' },
  { dir: '06-kubectl', name: 'kubectl' },
  { dir: '07-operations', name: 'Operations' },
  { dir: '08-capstone', name: 'Capstone' },
]
// Deck nào thuộc giai đoạn nào (theo số thứ tự giai đoạn)
const deckPhase: Record<string, number> = {
  '01-foundation': 1, '02-docker': 2, '03-compose': 2, '04-cicd': 3,
  '05-kubernetes': 4, '06-kubectl': 4, '07-operations': 4, '08-capstone': 5,
}

function slidesSidebar(): Item[] {
  const deckItem = (d: { dir: string; name: string }): Item | null => {
    const dirPath = join(root, 'slides', d.dir)
    if (!existsSync(dirPath)) return null
    const sessions = Array.from({ length: 32 }, (_, i) => pad(i + 1))
      .filter((n) => existsSync(join(dirPath, `session-${n}.md`)))
      .map((n) => ({
        text: h1(`slides/${d.dir}/session-${n}.md`).replace(/^Slide buổi /, 'Buổi '),
        link: `/slides/${d.dir}/session-${n}`,
      }))
    return { text: `${d.dir.slice(0, 2)} · ${d.name}`, collapsed: true, link: `/slides/${d.dir}/`, items: sessions }
  }
  const stages = phases.map((phase, i) =>
    group(
      phase.title,
      slideDecks.filter((d) => deckPhase[d.dir] === phase.no).map(deckItem),
      { collapsed: i > 0 },
    ),
  )
  return present([group('Slide', [page('Tổng quan 32 buổi', '/slides/')]), ...stages])
}

// Sidebar chung cho các trang tra cứu
function referenceSidebar(): Item[] {
  return present([
    group('Cài đặt và sự cố', [
      page('Cài đặt máy', '/resources/setup-guide'),
      page('Tài khoản và GitHub', '/resources/setup-github'),
      page('Terminal cơ bản', '/resources/terminal-101'),
      page('Sự cố khi cài đặt', '/resources/troubleshooting-setup'),
    ]),
    group('Tra nhanh', [
      page('Thuật ngữ', '/resources/glossary'),
      page('Cheatsheets', '/resources/cheatsheets'),
      page('Tài liệu chính thức', '/resources/documentation'),
      page('Sách', '/resources/books'),
    ]),
    group('Mẫu chạy được', [
      page('Ví dụ theo chủ đề', '/examples/'),
      page('10 tình huống lỗi', '/examples/troubleshooting-scenarios'),
      page('Dự án mẫu', '/starter-project/'),
      page('Mẫu bài lab', '/templates/lab-template'),
      page('Mẫu bài tập', '/templates/assignment-template'),
      page('Mẫu dự án', '/templates/project-template'),
    ]),
    group('Slide', [page('Slide 32 buổi', '/slides/')]),
  ])
}

function mentorsSidebar(): Item[] {
  const weeks = phases
    .flatMap((p) => p.weeks)
    .map((w) =>
      group(
        w.title,
        [
          ...w.sessions.map((s) => page(`Kịch bản Buổi ${pad(s)}`, `/mentors/sessions/session-${pad(s)}`)),
          page('Hướng dẫn chấm', `/mentors/grading/week-${w.no}`),
          page('Đáp án', `/mentors/walkthroughs/week-${w.no}`),
        ],
        { collapsed: true },
      ),
    )
  // Trang mentors/*.md chưa có trong danh sách cố định thì tự thêm (tiêu đề lấy từ H1)
  const known = new Set([
    'index', 'README', 'handbook', 'session-runbook', 'launch-checklist', 'pilot-plan', 'repo-governance',
  ])
  const extra = readdirSync(join(root, 'mentors'))
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
    .filter((n) => !known.has(n))
    .sort()
    .map((n) => page(h1(`mentors/${n}.md`), `/mentors/${n}`))
  return present([
    group('Bắt đầu', [page('Tổng quan', '/mentors/'), page('Hướng dẫn mentor', '/mentors/handbook'), ...extra]),
    group('Lên lớp', [
      page('Quy trình mỗi buổi', '/mentors/session-runbook'),
      page('Đáp án: mục lục', '/mentors/walkthroughs/'),
      ...weeks,
    ]),
    group('Vận hành khóa', [
      page('Checklist mở khóa', '/mentors/launch-checklist'),
      page('Kế hoạch chạy thử', '/mentors/pilot-plan'),
      page('Quản trị repo', '/mentors/repo-governance'),
    ]),
  ])
}

function vibeSidebar(): Item[] {
  // Trang mẹ; nếu có file "<tên>-advanced.md" thì hiện thêm mục "Nâng cao" ngay dưới trang mẹ
  const vp = (text: string, link: string): Item | null => {
    const main = page(text, link)
    if (!main) return null
    const adv = page(`${text} (nâng cao)`, `${link}-advanced`)
    return adv ? { ...main, collapsed: true, items: [adv] } : main
  }
  return present([
    group('Bắt đầu', [
      vp('Tổng quan', '/vibe/'),
      vp('Tư duy Vibe Deploy', '/vibe/00-mindset'),
      vp('Git và GitHub', '/vibe/01-git-github'),
      vp('Đưa web tĩnh lên mạng', '/vibe/02-static-hosting'),
    ]),
    group('Thêm database và đăng nhập (chọn MỘT: Supabase hoặc Firebase)', [
      vp('Supabase (bài 04)', '/vibe/04-supabase'),
      vp('Firebase (bài 05)', '/vibe/05-firebase'),
    ]),
    group('Dự án thật', [
      vp('Dự án nhỏ', '/vibe/09-mini-project'),
      vp('Tên miền, bảo mật, production', '/vibe/07-domain-security-production'),
      vp('Hoàn thiện và ra mắt', '/vibe/11-launch-polish'),
    ]),
    group(
      'Tra cứu và nâng cao',
      [
        vp('Fullstack serverless', '/vibe/03-fullstack-serverless'),
        vp('Deploy cùng AI agent', '/vibe/06-ai-agent-deploy'),
        vp('App builders', '/vibe/10-app-builders'),
        vp('Xử lý sự cố', '/vibe/08-troubleshooting'),
        vp('Nền tảng hosting', '/vibe/platforms'),
        vp('Thư viện prompt', '/vibe/prompt-library'),
        vp('CLI cheatsheet', '/vibe/cli-cheatsheet'),
      ],
      { collapsed: true },
    ),
  ])
}

export default withMermaid(defineConfigWithTheme<DefaultTheme.Config & { repoUrl: string }>({
  lang: 'vi-VN',
  title: 'DevOps – From Code to Deployment',
  description:
    'Khóa DevOps 16 tuần bằng tiếng Việt cho HCMUTE DSC: Linux, Git, Docker, Compose, GitHub Actions và Kubernetes, học bằng cách tự dựng, tự phá và tự sửa.',
  base: process.env.BASE ?? '/',
  cleanUrls: true,
  lastUpdated: true,
  // README.md ở gốc là trang giới thiệu cho GitHub; website dùng index.md
  srcExclude: [
    'README.md',
    'ROADMAP.md',
    'CHANGELOG.md',
    'CONTRIBUTING.md',
    'CODE_OF_CONDUCT.md',
    'starter-project/backend/**',
    'starter-project/frontend/**',
    'starter-project/k8s/**',
    'starter-project/database/**',
    'solutions/mentor-only/**',
    'node_modules/**',
  ],
  ignoreDeadLinks: [/^https?:\/\/localhost/],
  rewrites: {
    ':a/README.md': ':a/index.md',
    ':a/:b/README.md': ':a/:b/index.md',
  },
  head: [
    ['link', { rel: 'icon', href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🐳</text></svg>' }],
  ],

  // Thẻ description của mỗi bài lấy từ mục "Nội dung" hoặc đoạn đầu tiên
  transformPageData(pageData, { siteConfig }) {
    if (pageData.frontmatter.description) return
    const src = readFileSync(join(siteConfig.srcDir, pageData.filePath), 'utf8')
    const body =
      src.match(/^> \*\*Tóm tắt:\*\* (.+)$/m)?.[1] ?? src.match(/^## Nội dung\s+([^\n#][^\n]+)$/m)?.[1]
    if (body) pageData.description = body.replace(/[`*]/g, '')
  },

  markdown: {
    lineNumbers: false,
    // Tắt cú pháp {...} gắn thuộc tính
    attrs: { disable: true },
    config(md) {
      // Tiêu đề dạng "Tên mục {#neo}": lấy neo tường minh, bỏ phần {#...} khỏi chữ hiển thị
      md.core.ruler.after('inline', 'explicit_heading_id', (state) => {
        const toks = state.tokens
        for (let i = 0; i < toks.length - 1; i++) {
          if (toks[i].type !== 'heading_open' || toks[i + 1].type !== 'inline') continue
          const inl = toks[i + 1]
          const m = /\s*\{#([A-Za-z0-9_-]+)\}\s*$/.exec(inl.content)
          if (!m) continue
          toks[i].attrSet('id', m[1])
          inl.content = inl.content.slice(0, m.index)
          const last = inl.children?.[inl.children.length - 1]
          if (last && last.type === 'text') last.content = last.content.replace(/\s*\{#[A-Za-z0-9_-]+\}\s*$/, '')
        }
      })

      // Inline code như `${{ github.sha }}`: không để Vue hiểu là biểu thức template
      const codeInline = md.renderer.rules.code_inline!
      md.renderer.rules.code_inline = (tokens, idx, ...rest) => {
        tokens[idx].attrSet('v-pre', '')
        return codeInline(tokens, idx, ...rest)
      }

      // Danh sách rà soát "- [ ] ...": markdown-it không tự hiển thị ô đánh dấu
      // Link tương đối tới file không phải .md (schema.sql, compose.yaml...) hoặc thư mục không có trang
      // (starter-project/backend/): website không phục vụ chúng, nên trỏ sang GitHub để không thành link chết.
      md.core.ruler.push('repo_links', (state) => {
        const from = (state.env?.relativePath as string | undefined)?.split('/').slice(0, -1) ?? []
        for (const block of state.tokens) {
          for (const tok of block.children ?? []) {
            if (tok.type !== 'link_open') continue
            const href = tok.attrGet('href') ?? ''
            if (!href || /^([a-z][a-z0-9+.-]*:|#|\/)/i.test(href)) continue
            const [path, hash] = href.split('#')
            const parts = [...from]
            for (const seg of path.split('/')) {
              if (seg === '..') parts.pop()
              else if (seg && seg !== '.') parts.push(seg)
            }
            const rel = parts.join('/')
            const abs = join(root, rel)
            if (!rel || !existsSync(abs)) continue
            const isDir = statSync(abs).isDirectory()
            const hasPage = isDir
              ? ['README.md', 'index.md'].some((f) => existsSync(join(abs, f))) && !/^(starter-project\/(backend|frontend|k8s|database)|solutions\/mentor-only)/.test(rel)
              : rel.endsWith('.md') && !/^(starter-project\/(backend|frontend|k8s|database)|solutions\/mentor-only)\//.test(rel)
            if (hasPage) continue
            tok.attrSet('href', `${repo}/${isDir ? 'tree' : 'blob'}/master/${rel}${hash ? `#${hash}` : ''}`)
            tok.attrSet('target', '_blank')
            tok.attrSet('rel', 'noreferrer')
          }
        }
      })

      md.core.ruler.push('task_list', (state) => {
        state.tokens.forEach((block, i) => {
          const box =
            block.type === 'inline' &&
            state.tokens[i - 2]?.type === 'list_item_open' &&
            block.children?.[0]?.content.match(/^\[( |x)\] /)
          if (box) {
            const first = block.children![0]
            first.content = first.content.slice(4)
            const input = new state.Token('html_inline', '', 0)
            input.content = `<input type="checkbox" disabled${box[1] === 'x' ? ' checked' : ''}> `
            block.children!.unshift(input)
          }
        })
      })
    },
  },

  themeConfig: {
    repoUrl: repo,
    // Tên ngắn cho thanh điều hướng để vừa màn hình điện thoại; tiêu đề đầy đủ vẫn ở thẻ title
    siteTitle: 'DevOps · HCMUTE DSC',
    nav: [
      { text: 'Bắt đầu', link: '/curriculum/getting-started' },
      { text: 'Học 16 tuần', link: '/curriculum/syllabus' },
      { text: 'Lên mạng nhanh (Vibe)', link: '/vibe/' },
      {
        text: 'Tra cứu',
        items: [
          { text: 'Cài đặt máy', link: '/resources/setup-guide' },
          { text: 'Thuật ngữ', link: '/resources/glossary' },
          { text: 'Cheatsheets', link: '/resources/cheatsheets' },
          { text: 'Tình huống lỗi', link: '/examples/troubleshooting-scenarios' },
          { text: 'Dự án mẫu', link: '/starter-project/' },
        ],
      },
      { text: 'Mentor', link: '/mentors/' },
    ],
    sidebar: {
      '/curriculum/': learningSidebar(),
      '/labs/': learningSidebar(),
      '/assignments/': learningSidebar(),
      '/slides/': slidesSidebar(),
      '/mentors/': mentorsSidebar(),
      '/vibe/': vibeSidebar(),
      '/resources/': referenceSidebar(),
      '/examples/': referenceSidebar(),
      '/starter-project/': referenceSidebar(),
      '/templates/': referenceSidebar(),
    },
    socialLinks: [{ icon: 'github', link: repo }],
    search: {
      provider: 'local',
      options: {
        // Trang mentor không vào chỉ mục tìm kiếm mặc định (học viên không bị lẫn đáp án)
        _render(src, env, md) {
          if (env.relativePath.startsWith('mentors/')) return ''
          return md.render(src)
        },
        miniSearch: {
          searchOptions: {
            // Ưu tiên bài học (labs) và lộ trình (curriculum)
            boostDocument: (id: string) => (/^\/(labs|curriculum)\//.test(id) ? 3 : 1),
          },
        },
        translations: {
          button: { buttonText: 'Tìm kiếm', buttonAriaLabel: 'Tìm kiếm' },
          modal: {
            noResultsText: 'Không tìm thấy kết quả cho',
            resetButtonTitle: 'Xóa',
            footer: { selectText: 'chọn', navigateText: 'di chuyển', closeText: 'đóng' },
          },
        },
      },
    },
    editLink: { pattern: `${repo}/edit/master/:path`, text: 'Sửa trang này trên GitHub' },
    outline: { level: [2, 2], label: 'Trong bài này' },
    docFooter: { prev: 'Bài trước', next: 'Bài sau' },
    lastUpdated: { text: 'Cập nhật lần cuối' },
    returnToTopLabel: 'Lên đầu trang',
    sidebarMenuLabel: 'Danh sách bài',
    darkModeSwitchLabel: 'Giao diện',
    lightModeSwitchTitle: 'Chuyển sang nền sáng',
    darkModeSwitchTitle: 'Chuyển sang nền tối',
    notFound: { title: 'Không tìm thấy trang', quote: 'Có thể bài đã đổi tên.', linkText: 'Về trang chủ' },
    footer: {
      message: 'HCMUTE DSC – DevOps Learning Program.',
      copyright: 'Nội dung gốc của TienNHM',
    },
  },
  mermaid: {},
}))
