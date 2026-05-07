import { redirect } from "next/navigation";

// next.config.mjs の redirects() で / -> /home にしているが、
// 念のためサーバーサイドでもリダイレクト
export default function Index() {
  redirect("/home");
}
