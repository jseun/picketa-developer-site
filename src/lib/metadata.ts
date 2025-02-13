import { Metadata } from 'next';
import { SITE_TITLE, SITE_DESCRIPTION, SITE_URL,DEFAULT_OG_TITLE, DEFAULT_OG_DESCRIPTION } from './constants';

export type MetadataOverrides = Partial<Metadata>;

function ensureAbsoluteUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function generateOgImageUrl(params: {
  title?: string;
  description?: string;
  authorName?: string;
  authorPicture?: string;
  authorRole?: string;
  backgroundImage?: string;
}): string {
  const ogImageUrl = new URL('/api/og', SITE_URL);
  if (params.title) {
    ogImageUrl.searchParams.set('title', params.title);
  }
  if (params.description) {
    ogImageUrl.searchParams.set('description', params.description);
  }
  if (params.authorName) {
    ogImageUrl.searchParams.set('authorName', params.authorName);
  }
  if (params.authorPicture) {
    ogImageUrl.searchParams.set('authorPicture', ensureAbsoluteUrl(params.authorPicture));
  }
  if (params.authorRole) {
    ogImageUrl.searchParams.set('authorRole', params.authorRole);
  }
  if (params.backgroundImage) {
    ogImageUrl.searchParams.set('backgroundImage', ensureAbsoluteUrl(params.backgroundImage));
  }
  return ogImageUrl.toString();
}

export function generateMetadata(overrides: MetadataOverrides = {}): Metadata {
  const defaultMetadata: Metadata = {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    keywords: "Picketa, developer, blog, API, documentation, agriculture, technology, engineering, picketa.com",
    openGraph: {
      title: DEFAULT_OG_TITLE,
      description: DEFAULT_OG_DESCRIPTION,
      url: SITE_URL,
      siteName: SITE_TITLE,
      images: [{
        url: generateOgImageUrl({ 
          title: DEFAULT_OG_TITLE,
          description: DEFAULT_OG_DESCRIPTION 
        }),
        width: 1200,
        height: 630,
        alt: DEFAULT_OG_TITLE,
      }],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: DEFAULT_OG_TITLE,
      description: DEFAULT_OG_DESCRIPTION,
      creator: '@picketasystems',
      images: [generateOgImageUrl({ 
        title: DEFAULT_OG_TITLE,
        description: DEFAULT_OG_DESCRIPTION 
      })],
    },
  };

  return {
    ...defaultMetadata,
    ...overrides,
    openGraph: {
      ...defaultMetadata.openGraph,
      ...overrides.openGraph,
    },
    twitter: {
      ...defaultMetadata.twitter,
      ...overrides.twitter,
    },
  };
}
