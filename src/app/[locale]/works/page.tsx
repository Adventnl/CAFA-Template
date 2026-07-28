import type { Metadata } from 'next';

import { PageIntro } from '@/components/composites/PageIntro';
import { getDictionary } from '@/lib/content';
import { resolveLocale } from '@/lib/locale';

interface WorksPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: WorksPageProps): Promise<Metadata> {
  const dictionary = getDictionary(resolveLocale((await params).locale));
  return { title: dictionary.pages.works.title, description: dictionary.pages.works.intro };
}

export default async function WorksPage({ params }: WorksPageProps) {
  const dictionary = getDictionary(resolveLocale((await params).locale));

  return <PageIntro intro={dictionary.pages.works.intro} title={dictionary.pages.works.title} />;
}
