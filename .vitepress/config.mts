import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { type DefaultTheme, defineConfigWithTheme } from 'vitepress'
import { courseTree } from './course'

const repo = process.env.REPO_URL || 'https://github.com/TienNHM/devops-course'

const weekNums = Array.from({ length: 16 }, (_, i) => String(i + 1).padStart(2, '0'))

function labsSidebar(): DefaultTheme.SidebarItem[] {
  return courseTree().map((phase, i) => ({
    text: `Giai đoạn ${phase.no} — ${phase.name}`,
    collapsed: i > 0,
    items: phase.weeks.map((w) => ({
      text: w.title,
      link: w.link,
      collapsed: true,
      items: w.sessions.map((s) => ({ text: s.title, link: s.link })),
    })),
  }))
}

export default defineConfigWithTheme<DefaultTheme.Config & { repoUrl: string }>({
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
    const body = src.match(/^## Nội dung\s+([^\n#][^\n]+)$/m)?.[1]
    if (body) pageData.description = body.replace(/[`*]/g, '')
  },

  markdown: {
    lineNumbers: false,
    // Tắt cú pháp {...} gắn thuộc tính
    attrs: { disable: true },
    config(md) {
      // Inline code như `${{ github.sha }}`: không để Vue hiểu là biểu thức template
      const codeInline = md.renderer.rules.code_inline!
      md.renderer.rules.code_inline = (tokens, idx, ...rest) => {
        tokens[idx].attrSet('v-pre', '')
        return codeInline(tokens, idx, ...rest)
      }

      // Danh sách rà soát "- [ ] ...": markdown-it không tự hiển thị ô đánh dấu
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
    nav: [
      { text: 'Syllabus', link: '/curriculum/syllabus' },
      { text: 'Lịch học', link: '/curriculum/schedule' },
      { text: 'Bài lab', link: '/labs/week-01/' },
      { text: 'Capstone', link: '/assignments/capstone/' },
      {
        text: 'Thêm',
        items: [
          { text: 'Starter project', link: '/starter-project/' },
          { text: '10 tình huống lỗi', link: '/examples/troubleshooting-scenarios' },
          { text: 'Setup guide', link: '/resources/setup-guide' },
          { text: 'Cheatsheets', link: '/resources/cheatsheets' },
        ],
      },
    ],
    sidebar: {
      '/curriculum/': [
        {
          text: 'Chương trình',
          items: [
            { text: 'Syllabus', link: '/curriculum/syllabus' },
            { text: 'Lịch học', link: '/curriculum/schedule' },
            { text: 'Chuẩn đầu ra', link: '/curriculum/learning-outcomes' },
            { text: 'Đánh giá', link: '/curriculum/assessment' },
          ],
        },
      ],
      '/labs/': labsSidebar(),
      '/assignments/': [
        { text: 'Dự án cuối khóa', items: [{ text: 'Capstone', link: '/assignments/capstone/' }] },
        {
          text: 'Bài tập hàng tuần',
          items: weekNums.map((n) => ({ text: `Tuần ${n}`, link: `/assignments/weekly/week-${n}` })),
        },
      ],
      '/slides/': [
        {
          text: 'Slide deck',
          items: [
            ['01-foundation', 'Foundation'],
            ['02-docker', 'Docker'],
            ['03-compose', 'Compose'],
            ['04-cicd', 'CI/CD'],
            ['05-kubernetes', 'Kubernetes'],
            ['06-kubectl', 'kubectl'],
            ['07-operations', 'Operations'],
            ['08-capstone', 'Capstone'],
          ].map(([dir, name]) => ({ text: `${dir.slice(0, 2)} – ${name}`, link: `/slides/${dir}/` })),
        },
      ],
      '/resources/': [
        {
          text: 'Tài nguyên',
          items: [
            { text: 'Setup guide', link: '/resources/setup-guide' },
            { text: 'Tài liệu chính thức', link: '/resources/documentation' },
            { text: 'Sách', link: '/resources/books' },
            { text: 'Cheatsheets', link: '/resources/cheatsheets' },
          ],
        },
      ],
      '/examples/': [
        {
          text: 'Ví dụ',
          items: [
            { text: 'Tổng quan', link: '/examples/' },
            { text: '10 tình huống lỗi', link: '/examples/troubleshooting-scenarios' },
          ],
        },
      ],
      '/templates/': [
        {
          text: 'Template',
          items: [
            { text: 'Lab', link: '/templates/lab-template' },
            { text: 'Assignment', link: '/templates/assignment-template' },
            { text: 'Project', link: '/templates/project-template' },
          ],
        },
      ],
    },
    socialLinks: [{ icon: 'github', link: repo }],
    search: {
      provider: 'local',
      options: {
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
    outline: { level: [2, 3], label: 'Trong bài này' },
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
})
