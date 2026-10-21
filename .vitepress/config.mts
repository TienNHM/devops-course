import { defineConfig } from "vitepress";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");

function title(file: string): string {
  const line = readFileSync(file, "utf8").split("\n").find((l) => l.startsWith("# "));
  return line ? line.slice(2).trim() : file;
}

const weeks = readdirSync(join(root, "labs"))
  .filter((d) => d.startsWith("week-"))
  .sort();

const labsSidebar = weeks.map((w) => {
  const files = readdirSync(join(root, "labs", w)).filter((f) => f.endsWith(".md")).sort();
  return {
    text: title(join(root, "labs", w, "README.md")).replace(/^Tuần /, "Tuần "),
    collapsed: true,
    items: files.map((f) => ({
      text: f === "README.md" ? "Tổng quan tuần" : title(join(root, "labs", w, f)),
      link: `/labs/${w}/${f === "README.md" ? "" : f.replace(/\.md$/, "")}`,
    })),
  };
});

const slides = readdirSync(join(root, "slides")).sort();

export default defineConfig({
  lang: "vi-VN",
  title: "HCMUTE DSC – DevOps",
  description: "From Code to Deployment – DevOps Foundation & Practical Engineering",
  cleanUrls: true,
  lastUpdated: true,
  srcExclude: [
    "starter-project/backend/**",
    "starter-project/frontend/**",
    "starter-project/k8s/**",
    "starter-project/database/**",
    "solutions/mentor-only/**",
    "node_modules/**",
  ],
  rewrites: {
    "README.md": "index.md",
    ":a/README.md": ":a/index.md",
    ":a/:b/README.md": ":a/:b/index.md",
  },
  themeConfig: {
    nav: [
      { text: "Syllabus", link: "/curriculum/syllabus" },
      { text: "Lịch học", link: "/curriculum/schedule" },
      { text: "Labs", link: "/labs/week-01/" },
      { text: "Starter project", link: "/starter-project/" },
      { text: "Tài nguyên", link: "/resources/setup-guide" },
    ],
    sidebar: {
      "/curriculum/": [
        {
          text: "Curriculum",
          items: [
            { text: "Syllabus", link: "/curriculum/syllabus" },
            { text: "Lịch học", link: "/curriculum/schedule" },
            { text: "Chuẩn đầu ra", link: "/curriculum/learning-outcomes" },
            { text: "Đánh giá", link: "/curriculum/assessment" },
          ],
        },
      ],
      "/labs/": labsSidebar,
      "/assignments/": [
        { text: "Capstone", items: [{ text: "Capstone project", link: "/assignments/capstone/" }] },
        {
          text: "Assignment hàng tuần",
          items: weeks.map((w) => ({
            text: `Tuần ${w.slice(5)}`,
            link: `/assignments/weekly/${w}`,
          })),
        },
      ],
      "/slides/": slides.map((s) => ({ text: s, link: `/slides/${s}/` })),
      "/resources/": [
        {
          text: "Tài nguyên",
          items: [
            { text: "Setup guide", link: "/resources/setup-guide" },
            { text: "Tài liệu chính thức", link: "/resources/documentation" },
            { text: "Sách", link: "/resources/books" },
            { text: "Cheatsheets", link: "/resources/cheatsheets" },
          ],
        },
      ],
      "/examples/": [
        { text: "Examples", items: [{ text: "Tổng quan", link: "/examples/" }, { text: "10 tình huống lỗi", link: "/examples/troubleshooting-scenarios" }] },
      ],
    },
    socialLinks: [{ icon: "github", link: "https://github.com/TienNHM/devops-course" }],
    search: { provider: "local" },
    outline: { level: [2, 3], label: "Trên trang này" },
    docFooter: { prev: "Trước", next: "Sau" },
    editLink: {
      pattern: "https://github.com/TienNHM/devops-course/edit/master/:path",
      text: "Sửa trang này trên GitHub",
    },
  },
});
