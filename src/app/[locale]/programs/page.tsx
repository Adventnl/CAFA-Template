import type { Metadata } from 'next';

import { PageIntro } from '@/components/composites/PageIntro';
import { getDictionary } from '@/lib/content';
import { resolveLocale } from '@/lib/locale';

interface ProgramsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ProgramsPageProps): Promise<Metadata> {
  const dictionary = getDictionary(resolveLocale((await params).locale));
  return { title: dictionary.pages.programs.title, description: dictionary.pages.programs.intro };
}

export default async function ProgramsPage({ params }: ProgramsPageProps) {
  const dictionary = getDictionary(resolveLocale((await params).locale));

  return (
    <PageIntro intro={dictionary.pages.programs.intro} title={dictionary.pages.programs.title} />
  );
}
