<script>
  export let path = "/",
    data;
  const fallbackImage = "";
  const fallbackMetaTitle = "Hold My Mail";
</script>

<svelte:head>
  <title
    >{data.meta_title
      ? `${data.meta_title} - Hold My Mail`
      : fallbackMetaTitle}</title
  >
  <meta name="description" content={data.meta_description} />
  <link rel="canonical" href={`https://holdmymail.app${path}`} />

  <!-- Facebook Meta Tags -->
  <meta property="og:url" content={`https://holdmymail.app${path}`} />
  <meta property="og:type" content="website" />
  <meta
    property="og:title"
    content={data.meta_title
      ? `${data.meta_title} - Hold My Mail`
      : fallbackMetaTitle}
  />
  <meta property="og:description" content={data.meta_description} />
  <meta property="og:image" content={data.meta_image?.url || fallbackImage} />

  <!-- Twitter Meta Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta property="twitter:domain" content="zachpatrick.com" />
  <meta property="twitter:url" content={`https://holdmymail.app${path}`} />
  <meta
    name="twitter:title"
    content={data.meta_title
      ? `${data.meta_title} - Zach Patrick`
      : fallbackMetaTitle}
  />
  <meta name="twitter:description" content={data.meta_description} />
  <meta name="twitter:image" content={data.meta_image?.url || fallbackImage} />

  <slot />
</svelte:head>
