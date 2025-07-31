CMS.init({
  config: {
    backend: {
      name: "github",
      repo: "Dadah12/artofrose-website",
      branch: "main",
      auth_scope: "repo",
      base_url: "https://artofrose.shop",
      auth_endpoint: "api/auth", // optional if self-hosted
    },
    media_folder: "images",
    public_folder: "/images",
    collections: [
      {
        name: "blog",
        label: "Blog",
        folder: "Blog/Blog1",
        create: true,
        slug: "{{slug}}",
        fields: [
          { label: "Title", name: "title", widget: "string" },
          { label: "Body", name: "body", widget: "markdown" },
        ],
      },
    ],
  },
});
