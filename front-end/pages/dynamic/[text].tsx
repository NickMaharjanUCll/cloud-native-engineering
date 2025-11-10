import { useRouter } from "next/router";

const Dynamic: React.FC = () => {
  // Dynamic page.
   const router = useRouter();
   const { text } = router.query;

  return (
    <>
      <p>Hello {text}</p>
    </>
  );
};

export default Dynamic;
