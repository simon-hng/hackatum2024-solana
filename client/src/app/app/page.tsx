import { api, HydrateClient } from "~/trpc/server";

const AppPage = () => {
  // Might want to prefetch some data here
  void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <div></div>
    </HydrateClient>
  );
};

export default AppPage;
