import { useParams } from "~/lib/hooks";

export default async function Index() {
  const params = useParams();
  return (
    <>
      <div>Hello World</div>
    </>
  );
}
