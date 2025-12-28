import Link from "next/link";

export default function Home() {
  return (
    <div >
      <Link href={'/menus'}>di toi /menus de them mon an</Link>
      <hr />
      <Link href={'/students'}>di toi /student de them mon an</Link>
      <hr />
      <Link href={'/admin/dashboard'}>di toi /admin/dashboard </Link>
    </div>

  );
}
