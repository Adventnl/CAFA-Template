import type { Metadata } from 'next';

import { PageIntro } from '@/components/composites/PageIntro';
import { getDictionary } from '@/lib/content';
import { resolveLocale } from '@/lib/locale';

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const dictionary = getDictionary(resolveLocale((await params).locale));
  return { title: dictionary.pages.about.title, description: dictionary.pages.about.intro };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const dictionary = getDictionary(resolveLocale((await params).locale));

  return <PageIntro intro={dictionary.pages.about.intro} title={dictionary.pages.about.title} />;
}
