import Error from "../components/Error";
import MetaTags from "../components/MetaTags";

export default function Custom404() {
  return (
    <>
      <MetaTags title="Not found | winstall" />
      <Error/>
    </>
  )
}
