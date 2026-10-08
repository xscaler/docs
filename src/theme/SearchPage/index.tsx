import React, {type ComponentProps, type ReactNode} from 'react';
import Head from '@docusaurus/Head';
import SearchPage from '@theme-original/SearchPage';

export default function SearchPageWrapper(props: ComponentProps<typeof SearchPage>): ReactNode {
  return (
    <>
      <SearchPage {...props} />
      <Head>
        <meta name="robots" content="noindex, follow" />
      </Head>
    </>
  );
}
