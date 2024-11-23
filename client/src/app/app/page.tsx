import { api, HydrateClient } from "~/trpc/server";

const AppPage = () => {
  // Might want to prefetch some data here
  void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <div className="app-page">
        <h1>App Page</h1>
      </div>
    </HydrateClient>
  );
};

export default AppPage;
