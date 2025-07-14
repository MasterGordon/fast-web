import { Counter } from "~/components/Counter";
import Layout from "~/components/Layout";
import { Link } from "~/components/Link";
import { useParams } from "~/lib/hooks";
import { pokeapi } from "~/lib/pokeapi";

export default async function Index() {
  const params = useParams();
  const page = Number(params.get("page") ?? 0);
  const pokemon = await pokeapi.getPokemonsList({
    limit: 20,
    offset: page * 20,
  });
  return (
    <>
      <div>Hello World</div>
      <Counter />
      <Counter />
      <ul>
        {pokemon.results.map((r) => (
          <li>{r.name}</li>
        ))}
      </ul>
      <Link href={`/?page=${page - 1}`}>Prev</Link>
      <Link href={`/?page=${page + 1}`}>Next</Link>
    </>
  );
}
